package com.freelancehub.keycloak.otp;

import org.jboss.logging.Logger;
import org.keycloak.email.EmailException;
import org.keycloak.email.EmailSenderProvider;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

public class RegistrationOtpService {
    private static final Logger logger = Logger.getLogger(RegistrationOtpService.class);

    public static final long OTP_EXPIRY_MS = 5 * 60 * 1000L; // 5 minutes
    public static final int MAX_ATTEMPTS = 5;
    public static final long COOLDOWN_MS = 60 * 1000L; // 60 seconds
    public static final int MAX_HOURLY_SENDS = 5;
    public static final long HOUR_MS = 60 * 60 * 1000L;
    public static final long TICKET_EXPIRY_MS = 10 * 60 * 1000L; // 10 minutes

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );

    // Singleton in-memory secure expiring store
    private static final ConcurrentHashMap<String, OtpEntry> OTP_STORE = new ConcurrentHashMap<>();
    private static final ConcurrentHashMap<String, Long> ACTIVE_TICKETS = new ConcurrentHashMap<>();

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final byte[] SERVER_HMAC_SECRET = new byte[32];

    static {
        SECURE_RANDOM.nextBytes(SERVER_HMAC_SECRET);
        // Periodic cleanup of expired entries every 2 minutes
        ScheduledExecutorService cleaner = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "registration-otp-cleaner");
            t.setDaemon(true);
            return t;
        });
        cleaner.scheduleAtFixedRate(RegistrationOtpService::cleanupExpiredEntries, 2, 2, TimeUnit.MINUTES);
    }

    private final KeycloakSession session;

    public RegistrationOtpService(KeycloakSession session) {
        this.session = session;
    }

    public static boolean isValidEmail(String email) {
        if (email == null) return false;
        String trimmed = email.trim();
        return !trimmed.isEmpty() && trimmed.length() <= 255 && EMAIL_PATTERN.matcher(trimmed).matches();
    }

    public SendResult requestOtp(String email, RealmModel realm) throws EmailException {
        if (!isValidEmail(email)) {
            return SendResult.error("Invalid email address format.", 400);
        }

        String normalizedEmail = email.trim().toLowerCase();
        long now = System.currentTimeMillis();

        OtpEntry existing = OTP_STORE.get(normalizedEmail);
        int hourlyCount = 1;
        long windowStart = now;

        if (existing != null) {
            // Check sliding hourly rate limit
            if (now - existing.getHourWindowStart() < HOUR_MS) {
                if (existing.getHourlySendCount() >= MAX_HOURLY_SENDS) {
                    return SendResult.error("Maximum verification requests exceeded for this hour. Please try again later.", 429);
                }
                hourlyCount = existing.getHourlySendCount() + 1;
                windowStart = existing.getHourWindowStart();
            }

            // Check 60-second resend cooldown
            long elapsedSinceLastSent = now - existing.getLastSentAt();
            if (elapsedSinceLastSent < COOLDOWN_MS) {
                long remainingSeconds = (COOLDOWN_MS - elapsedSinceLastSent + 999) / 1000;
                return SendResult.error("Please wait " + remainingSeconds + " seconds before requesting a new verification code.", 429);
            }
        }

        // Generate cryptographically secure 6-digit OTP
        int rawOtpInt = 100000 + SECURE_RANDOM.nextInt(900000);
        String rawOtp = String.valueOf(rawOtpInt);

        // Generate 16-byte random salt and SHA-256 hash
        byte[] salt = new byte[16];
        SECURE_RANDOM.nextBytes(salt);
        String saltBase64 = Base64.getEncoder().encodeToString(salt);
        String otpHashBase64 = hashOtp(salt, rawOtp);

        long expiresAt = now + OTP_EXPIRY_MS;
        OtpEntry newEntry = new OtpEntry(
                normalizedEmail,
                saltBase64,
                otpHashBase64,
                now,
                expiresAt,
                now,
                hourlyCount,
                windowStart
        );

        // Send Email via Keycloak Realm SMTP
        Map<String, String> smtpConfig = realm.getSmtpConfig();
        if (smtpConfig == null || smtpConfig.isEmpty()) {
            logger.error("Realm SMTP is not configured in realm: " + realm.getName());
            return SendResult.error("Identity provider email service is not configured. Contact administrator.", 500);
        }

        EmailSenderProvider emailSender = session.getProvider(EmailSenderProvider.class);
        if (emailSender == null) {
            logger.error("EmailSenderProvider not available in Keycloak session");
            return SendResult.error("Internal mail service unavailable.", 500);
        }

        String subject = "FreelanceHub Verification Code";
        String textBody = buildTextEmail(rawOtp);
        String htmlBody = buildHtmlEmail(rawOtp);

        try {
            emailSender.send(smtpConfig, normalizedEmail, subject, textBody, htmlBody);
        } catch (EmailException e) {
            logger.error("Failed to send verification code email via Keycloak SMTP: " + e.getMessage());
            throw e;
        }

        // Only save state if email was dispatched successfully
        OTP_STORE.put(normalizedEmail, newEntry);

        logger.infof("Dispatched registration OTP email to %s (expires in %ds)", maskEmail(normalizedEmail), OTP_EXPIRY_MS / 1000);

        return SendResult.success(OTP_EXPIRY_MS / 1000, COOLDOWN_MS / 1000);
    }

    public VerifyResult verifyOtp(String email, String submittedOtp) {
        if (!isValidEmail(email)) {
            return VerifyResult.error("Invalid email address format.", 400);
        }
        if (submittedOtp == null || submittedOtp.trim().length() != 6) {
            return VerifyResult.error("Verification code must be exactly 6 digits.", 400);
        }

        String normalizedEmail = email.trim().toLowerCase();
        String trimmedOtp = submittedOtp.trim();
        long now = System.currentTimeMillis();

        OtpEntry entry = OTP_STORE.get(normalizedEmail);
        if (entry == null) {
            return VerifyResult.error("No active verification code found. Please request a new code.", 400);
        }

        if (entry.isExpired(now)) {
            OTP_STORE.remove(normalizedEmail);
            return VerifyResult.error("Verification code has expired. Please request a new code.", 400);
        }

        if (entry.getAttempts() >= MAX_ATTEMPTS) {
            OTP_STORE.remove(normalizedEmail);
            return VerifyResult.error("Maximum verification attempts exceeded. Please request a new code.", 429);
        }

        byte[] salt = Base64.getDecoder().decode(entry.getSaltBase64());
        String expectedHash = entry.getOtpHashBase64();
        String calculatedHash = hashOtp(salt, trimmedOtp);

        if (!MessageDigest.isEqual(
                expectedHash.getBytes(StandardCharsets.UTF_8),
                calculatedHash.getBytes(StandardCharsets.UTF_8))) {
            entry.incrementAttempts();
            int remaining = MAX_ATTEMPTS - entry.getAttempts();
            if (remaining <= 0) {
                OTP_STORE.remove(normalizedEmail);
                return VerifyResult.error("Maximum verification attempts exceeded. Please request a new code.", 429);
            }
            return VerifyResult.error("Invalid verification code. " + remaining + " attempts remaining.", 400);
        }

        // Single-use: immediately invalidate the OTP from storage
        OTP_STORE.remove(normalizedEmail);

        // Generate cryptographically signed single-use verification ticket
        long ticketExpiry = now + TICKET_EXPIRY_MS;
        String ticket = generateVerificationTicket(normalizedEmail, ticketExpiry);
        ACTIVE_TICKETS.put(ticket, ticketExpiry);

        logger.infof("Successfully verified registration OTP for %s", maskEmail(normalizedEmail));

        return VerifyResult.success(ticket, normalizedEmail, TICKET_EXPIRY_MS / 1000);
    }

    public static boolean consumeVerificationTicket(String email, String ticket) {
        if (email == null || ticket == null || ticket.trim().isEmpty()) {
            return false;
        }

        String normalizedEmail = email.trim().toLowerCase();
        Long expiry = ACTIVE_TICKETS.get(ticket);
        if (expiry == null || System.currentTimeMillis() > expiry) {
            ACTIVE_TICKETS.remove(ticket);
            return false;
        }

        if (!validateTicketSignature(normalizedEmail, ticket)) {
            return false;
        }

        // Single-use atomic consumption
        return ACTIVE_TICKETS.remove(ticket) != null;
    }

    private static String hashOtp(byte[] salt, String otp) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt);
            byte[] digest = md.digest(otp.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }

    private static String generateVerificationTicket(String email, long expiry) {
        try {
            byte[] nonce = new byte[16];
            SECURE_RANDOM.nextBytes(nonce);
            String nonceStr = Base64.getUrlEncoder().withoutPadding().encodeToString(nonce);
            String payload = email + ":" + nonceStr + ":" + expiry;
            String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));

            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(SERVER_HMAC_SECRET, "HmacSHA256"));
            byte[] sig = hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String encodedSig = Base64.getUrlEncoder().withoutPadding().encodeToString(sig);

            return encodedPayload + "." + encodedSig;
        } catch (Exception e) {
            throw new RuntimeException("HMAC computation failed", e);
        }
    }

    private static boolean validateTicketSignature(String expectedEmail, String ticket) {
        try {
            String[] parts = ticket.split("\\.");
            if (parts.length != 2) return false;

            String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            String[] payloadParts = payload.split(":");
            if (payloadParts.length != 3) return false;

            String ticketEmail = payloadParts[0];
            long expiry = Long.parseLong(payloadParts[2]);

            if (System.currentTimeMillis() > expiry) return false;
            if (!ticketEmail.equalsIgnoreCase(expectedEmail)) return false;

            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(SERVER_HMAC_SECRET, "HmacSHA256"));
            byte[] expectedSig = hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedSigStr = Base64.getUrlEncoder().withoutPadding().encodeToString(expectedSig);

            return MessageDigest.isEqual(
                    parts[1].getBytes(StandardCharsets.UTF_8),
                    expectedSigStr.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            return false;
        }
    }

    private static void cleanupExpiredEntries() {
        long now = System.currentTimeMillis();
        OTP_STORE.entrySet().removeIf(entry -> entry.getValue().isExpired(now));
        ACTIVE_TICKETS.entrySet().removeIf(entry -> now > entry.getValue());
    }

    private static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        if (parts[0].length() <= 2) {
            return parts[0].charAt(0) + "***@" + parts[1];
        }
        return parts[0].substring(0, 2) + "***" + parts[0].charAt(parts[0].length() - 1) + "@" + parts[1];
    }

    private static String buildTextEmail(String otp) {
        return "FreelanceHub Verification Code\n" +
                "------------------------------------\n\n" +
                "Use the following verification code to complete your registration on FreelanceHub:\n\n" +
                "VERIFICATION CODE: " + otp + "\n\n" +
                "This code is valid for 5 minutes. Do not share this code with anyone.\n\n" +
                "If you did not request this verification code, please ignore this email.\n\n" +
                "--\nFreelanceHub Identity Service (Keycloak SMTP)";
    }

    private static String buildHtmlEmail(String otp) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "  <meta charset=\"utf-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>FreelanceHub Verification Code</title>\n" +
                "</head>\n" +
                "<body style=\"margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;\">\n" +
                "  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color: #f1f5f9; padding: 32px 16px;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\">\n" +
                "        <table role=\"presentation\" width=\"100%\" style=\"max-width: 520px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">\n" +
                "          <tr>\n" +
                "            <td style=\"background-color: #0f172a; padding: 24px; text-align: center;\">\n" +
                "              <table role=\"presentation\" align=\"center\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">\n" +
                "                <tr>\n" +
                "                  <td style=\"background-color: #2563eb; width: 40px; height: 40px; border-radius: 8px; text-align: center; vertical-align: middle; font-weight: 800; color: #ffffff; font-size: 18px; font-family: sans-serif;\">\n" +
                "                    FH\n" +
                "                  </td>\n" +
                "                  <td style=\"padding-left: 12px; font-size: 20px; font-weight: 700; color: #ffffff; font-family: sans-serif;\">\n" +
                "                    FreelanceHub\n" +
                "                  </td>\n" +
                "                </tr>\n" +
                "              </table>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style=\"padding: 32px 28px;\">\n" +
                "              <h1 style=\"margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a; text-align: center;\">\n" +
                "                Verification Code\n" +
                "              </h1>\n" +
                "              <p style=\"margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569; text-align: center;\">\n" +
                "                Please use the verification code below to complete your registration on FreelanceHub:\n" +
                "              </p>\n" +
                "              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin: 24px 0;\">\n" +
                "                <tr>\n" +
                "                  <td align=\"center\">\n" +
                "                    <div style=\"display: inline-block; background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 10px; padding: 16px 36px; text-align: center;\">\n" +
                "                      <span style=\"font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; display: block;\">\n" +
                otp +
                "                      </span>\n" +
                "                    </div>\n" +
                "                  </td>\n" +
                "                </tr>\n" +
                "              </table>\n" +
                "              <p style=\"margin: 0 0 16px 0; font-size: 12px; line-height: 18px; color: #64748b; text-align: center;\">\n" +
                "                This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.\n" +
                "              </p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style=\"background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;\">\n" +
                "              <p style=\"margin: 0; font-size: 12px; color: #94a3b8; line-height: 18px;\">\n" +
                "                If you did not request this verification code, please ignore this email or contact support.\n" +
                "              </p>\n" +
                "              <p style=\"margin: 8px 0 0 0; font-size: 11px; color: #cbd5e1;\">\n" +
                "                FreelanceHub Identity Service &bull; Authenticated via Keycloak SMTP\n" +
                "              </p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
                "</html>";
    }

    public static class SendResult {
        private final boolean success;
        private final String errorMessage;
        private final int statusCode;
        private final long expiresIn;
        private final long cooldown;

        private SendResult(boolean success, String errorMessage, int statusCode, long expiresIn, long cooldown) {
            this.success = success;
            this.errorMessage = errorMessage;
            this.statusCode = statusCode;
            this.expiresIn = expiresIn;
            this.cooldown = cooldown;
        }

        public static SendResult success(long expiresIn, long cooldown) {
            return new SendResult(true, null, 200, expiresIn, cooldown);
        }

        public static SendResult error(String message, int statusCode) {
            return new SendResult(false, message, statusCode, 0, 0);
        }

        public boolean isSuccess() {
            return success;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

        public int getStatusCode() {
            return statusCode;
        }

        public long getExpiresIn() {
            return expiresIn;
        }

        public long getCooldown() {
            return cooldown;
        }
    }

    public static class VerifyResult {
        private final boolean success;
        private final String errorMessage;
        private final int statusCode;
        private final String verificationTicket;
        private final String email;
        private final long expiresIn;

        private VerifyResult(boolean success, String errorMessage, int statusCode, String verificationTicket, String email, long expiresIn) {
            this.success = success;
            this.errorMessage = errorMessage;
            this.statusCode = statusCode;
            this.verificationTicket = verificationTicket;
            this.email = email;
            this.expiresIn = expiresIn;
        }

        public static VerifyResult success(String ticket, String email, long expiresIn) {
            return new VerifyResult(true, null, 200, ticket, email, expiresIn);
        }

        public static VerifyResult error(String message, int statusCode) {
            return new VerifyResult(false, message, statusCode, null, null, 0);
        }

        public boolean isSuccess() {
            return success;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

        public int getStatusCode() {
            return statusCode;
        }

        public String getVerificationTicket() {
            return verificationTicket;
        }

        public String getEmail() {
            return email;
        }

        public long getExpiresIn() {
            return expiresIn;
        }
    }
}
