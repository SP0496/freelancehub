package com.freelancehub.user.auth;

import com.freelancehub.user.auth.dto.*;
import com.freelancehub.user.profile.ProfileEntity;
import com.freelancehub.user.profile.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final KeycloakClient keycloakClient;
    private final ProfileRepository profileRepository;

    public AuthService(KeycloakClient keycloakClient, ProfileRepository profileRepository) {
        this.keycloakClient = keycloakClient;
        this.profileRepository = profileRepository;
    }

    public SendOtpResponse sendRegistrationOtp(SendOtpRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String username = request.username() != null ? request.username().trim() : null;

        // 1. Prevent duplicate email registration
        if (keycloakClient.findUserByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email address already exists.");
        }

        // 2. Prevent duplicate username registration if provided
        if (username != null && !username.isBlank()) {
            if (keycloakClient.findUserByUsername(username).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this username already exists.");
            }
        }

        // 3. Request OTP generation and SMTP dispatch via Keycloak SPI
        var spiResponse = keycloakClient.requestRegistrationOtp(email, username);

        int expiresIn = spiResponse.expiresIn() != null ? spiResponse.expiresIn().intValue() : 300;
        int cooldown = spiResponse.cooldown() != null ? spiResponse.cooldown().intValue() : 60;

        return SendOtpResponse.of(
                true,
                spiResponse.message(),
                maskEmail(email),
                expiresIn,
                cooldown
        );
    }

    public VerifyOtpResponse verifyRegistrationOtp(VerifyOtpRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String otp = request.otp().trim();

        var spiResponse = keycloakClient.verifyRegistrationOtp(email, otp);

        int expiresIn = spiResponse.expiresIn() != null ? spiResponse.expiresIn().intValue() : 600;

        return VerifyOtpResponse.of(
                true,
                spiResponse.message(),
                spiResponse.verificationTicket(),
                email,
                expiresIn
        );
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String username = request.username().trim();

        // 1. Single-use cryptographic verification ticket consumption
        boolean ticketValid = keycloakClient.consumeVerificationTicket(email, request.verificationTicket());
        if (!ticketValid) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid, expired, or already-used verification ticket. Please verify your email again."
            );
        }

        // 2. Check duplicates immediately before creating user
        if (keycloakClient.findUserByUsername(username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this username already exists.");
        }
        if (keycloakClient.findUserByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email address already exists.");
        }

        // 3. Create Keycloak user with verified email
        String userId = keycloakClient.createVerifiedUser(request);

        // 4. Assign role (ROLE_FREELANCER or ROLE_CLIENT)
        String role = resolveRole(request.role());
        keycloakClient.assignRealmRole(userId, role);

        // 5. Synchronize initial Profile in MySQL
        String displayName = (request.firstName().trim() + " " + request.lastName().trim()).strip();
        String headline = role.equals("ROLE_CLIENT") ? "FreelanceHub Client" : "FreelanceHub Freelancer";

        try {
            ProfileEntity profile = new ProfileEntity(userId, displayName, headline);
            profileRepository.saveAndFlush(profile);
            log.info("Synchronized profile for new registered user: id={}, role={}", userId, role);
        } catch (Exception e) {
            log.error("Failed to persist ProfileEntity for user {}: {}", userId, e.getMessage(), e);
            // Even if profile persistence fails, user was created in Keycloak
        }

        return RegisterResponse.of(
                true,
                "Registration completed successfully. You can now sign in.",
                userId,
                username,
                email,
                role
        );
    }

    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String identifier = request.identifier().trim();
        KeycloakClient.KeycloakUser user = null;

        if (identifier.contains("@")) {
            user = keycloakClient.findUserByEmail(identifier.toLowerCase(Locale.ROOT)).orElse(null);
        } else {
            user = keycloakClient.findUserByUsername(identifier).orElse(null);
        }

        // Prevent email enumeration: return clean response even if user not found
        if (user == null) {
            return ForgotPasswordResponse.of(
                    true,
                    "If an account exists with this identifier, a password reset link has been dispatched via Keycloak SMTP.",
                    maskEmail(identifier.contains("@") ? identifier : identifier + "@gmail.com")
            );
        }

        if (user.email() == null || user.email().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Account '" + user.username() + "' does not have a registered email address. Contact support."
            );
        }

        keycloakClient.sendForgotPasswordEmail(user.id());

        return ForgotPasswordResponse.of(
                true,
                "A password reset link has been dispatched to your Gmail via Keycloak SMTP.",
                maskEmail(user.email())
        );
    }

    private String resolveRole(String rawRole) {
        if (rawRole == null) return "ROLE_FREELANCER";
        String upper = rawRole.toUpperCase(Locale.ROOT);
        if (upper.contains("CLIENT")) {
            return "ROLE_CLIENT";
        }
        return "ROLE_FREELANCER";
    }

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String local = parts[0];
        String domain = parts[1];
        if (local.length() <= 2) {
            return local.charAt(0) + "***@" + domain;
        }
        return local.substring(0, 2) + "***" + local.charAt(local.length() - 1) + "@" + domain;
    }
}
