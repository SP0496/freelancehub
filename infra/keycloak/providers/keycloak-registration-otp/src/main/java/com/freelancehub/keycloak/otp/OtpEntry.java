package com.freelancehub.keycloak.otp;

public class OtpEntry {
    private final String email;
    private final String saltBase64;
    private final String otpHashBase64;
    private final long createdAt;
    private final long expiresAt;
    private int attempts;
    private long lastSentAt;
    private int hourlySendCount;
    private long hourWindowStart;

    public OtpEntry(String email, String saltBase64, String otpHashBase64, long createdAt, long expiresAt, long lastSentAt, int hourlySendCount, long hourWindowStart) {
        this.email = email;
        this.saltBase64 = saltBase64;
        this.otpHashBase64 = otpHashBase64;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.lastSentAt = lastSentAt;
        this.attempts = 0;
        this.hourlySendCount = hourlySendCount;
        this.hourWindowStart = hourWindowStart;
    }

    public String getEmail() {
        return email;
    }

    public String getSaltBase64() {
        return saltBase64;
    }

    public String getOtpHashBase64() {
        return otpHashBase64;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public long getExpiresAt() {
        return expiresAt;
    }

    public int getAttempts() {
        return attempts;
    }

    public void incrementAttempts() {
        this.attempts++;
    }

    public long getLastSentAt() {
        return lastSentAt;
    }

    public void setLastSentAt(long lastSentAt) {
        this.lastSentAt = lastSentAt;
    }

    public int getHourlySendCount() {
        return hourlySendCount;
    }

    public void incrementHourlySendCount() {
        this.hourlySendCount++;
    }

    public void resetHourlySendCount(long newWindowStart) {
        this.hourWindowStart = newWindowStart;
        this.hourlySendCount = 1;
    }

    public long getHourWindowStart() {
        return hourWindowStart;
    }

    public boolean isExpired(long now) {
        return now > expiresAt;
    }
}
