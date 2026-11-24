package com.freelancehub.user.auth;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.freelancehub.user.auth.dto.RegisterRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.Instant;
import java.util.*;

@Component
public class KeycloakClient {

    private static final Logger log = LoggerFactory.getLogger(KeycloakClient.class);

    private final RestClient restClient;
    private final String serverUrl;
    private final String realm;
    private final String adminUsername;
    private final String adminPassword;

    private String cachedAdminToken;
    private Instant tokenExpiry = Instant.MIN;

    public KeycloakClient(
            @Value("${keycloak.server-url:http://localhost:8180}") String serverUrl,
            @Value("${keycloak.realm:freelancehub}") String realm,
            @Value("${keycloak.admin-username:admin}") String adminUsername,
            @Value("${keycloak.admin-password:LocalAdminPassword123}") String adminPassword) {
        this.serverUrl = serverUrl.replaceAll("/+$", "");
        this.realm = realm;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.restClient = RestClient.builder().build();
    }

    private synchronized String getAdminToken() {
        if (cachedAdminToken != null && Instant.now().isBefore(tokenExpiry.minusSeconds(30))) {
            return cachedAdminToken;
        }

        String tokenUrl = serverUrl + "/realms/master/protocol/openid-connect/token";

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", "admin-cli");
        form.add("grant_type", "password");
        form.add("username", adminUsername);
        form.add("password", adminPassword);

        try {
            Map<?, ?> resp = restClient.post()
                    .uri(tokenUrl)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(Map.class);

            if (resp != null && resp.containsKey("access_token")) {
                cachedAdminToken = (String) resp.get("access_token");
                Object exp = resp.get("expires_in");
                long expiresIn = exp instanceof Number num ? num.longValue() : 60L;
                tokenExpiry = Instant.now().plusSeconds(expiresIn);
                return cachedAdminToken;
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to obtain Keycloak admin token.");
        } catch (RestClientResponseException e) {
            log.error("Failed to authenticate Keycloak admin-cli: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Identity service communication error.");
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record KeycloakUser(
            String id,
            String username,
            String email,
            String firstName,
            String lastName,
            Boolean enabled,
            Boolean emailVerified
    ) {}

    public Optional<KeycloakUser> findUserByUsername(String username) {
        String token = getAdminToken();
        String uri = serverUrl + "/admin/realms/" + realm + "/users?username=" + username.trim() + "&exact=true";

        try {
            List<KeycloakUser> users = restClient.get()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<KeycloakUser>>() {});

            if (users != null && !users.isEmpty()) {
                return users.stream()
                        .filter(u -> u.username() != null && u.username().equalsIgnoreCase(username.trim()))
                        .findFirst();
            }
            return Optional.empty();
        } catch (RestClientResponseException e) {
            log.error("Error looking up Keycloak user by username: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to verify username availability.");
        }
    }

    public Optional<KeycloakUser> findUserByEmail(String email) {
        String token = getAdminToken();
        String uri = serverUrl + "/admin/realms/" + realm + "/users?email=" + email.trim() + "&exact=true";

        try {
            List<KeycloakUser> users = restClient.get()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<KeycloakUser>>() {});

            if (users != null && !users.isEmpty()) {
                return users.stream()
                        .filter(u -> u.email() != null && u.email().equalsIgnoreCase(email.trim()))
                        .findFirst();
            }
            return Optional.empty();
        } catch (RestClientResponseException e) {
            log.error("Error looking up Keycloak user by email: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to verify email availability.");
        }
    }

    public String createVerifiedUser(RegisterRequest req) {
        String token = getAdminToken();
        String uri = serverUrl + "/admin/realms/" + realm + "/users";

        Map<String, Object> payload = new HashMap<>();
        payload.put("username", req.username().trim());
        payload.put("email", req.email().trim());
        payload.put("firstName", req.firstName().trim());
        payload.put("lastName", req.lastName().trim());
        payload.put("enabled", true);
        payload.put("emailVerified", true);
        payload.put("requiredActions", Collections.emptyList());

        Map<String, Object> credential = new HashMap<>();
        credential.put("type", "password");
        credential.put("value", req.password());
        credential.put("temporary", false);
        payload.put("credentials", List.of(credential));

        try {
            var response = restClient.post()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            URI location = response.getHeaders().getLocation();
            if (location != null) {
                String path = location.getPath();
                return path.substring(path.lastIndexOf('/') + 1);
            }

            // Fallback: look up by username
            return findUserByUsername(req.username().trim())
                    .map(KeycloakUser::id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "User created but ID could not be retrieved."));

        } catch (RestClientResponseException e) {
            log.error("Failed to create user in Keycloak: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 409) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this username or email already exists.");
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to register account with identity provider.");
        }
    }

    public void assignRealmRole(String userId, String roleName) {
        String token = getAdminToken();

        // 1. Get role representation
        String getRoleUri = serverUrl + "/admin/realms/" + realm + "/roles/" + roleName;
        Map<?, ?> roleObj = null;

        try {
            roleObj = restClient.get()
                    .uri(getRoleUri)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 404) {
                // Create role if missing
                try {
                    Map<String, String> newRole = Map.of("name", roleName, "description", "FreelanceHub role " + roleName);
                    restClient.post()
                            .uri(serverUrl + "/admin/realms/" + realm + "/roles")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(newRole)
                            .retrieve()
                            .toBodilessEntity();

                    roleObj = restClient.get()
                            .uri(getRoleUri)
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                            .retrieve()
                            .body(Map.class);
                } catch (Exception createEx) {
                    log.error("Failed to create role {}: {}", roleName, createEx.getMessage());
                }
            } else {
                log.error("Error fetching realm role {}: {}", roleName, e.getMessage());
            }
        }

        if (roleObj == null || !roleObj.containsKey("id")) {
            log.warn("Could not find or create role {} for user assignment.", roleName);
            return;
        }

        // 2. Map role to user
        String mappingUri = serverUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm";
        try {
            restClient.post()
                    .uri(mappingUri)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(List.of(roleObj))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Successfully assigned role {} to user {}", roleName, userId);
        } catch (RestClientResponseException e) {
            log.error("Failed to assign role {} to user {}: status={}, body={}", roleName, userId, e.getStatusCode(), e.getResponseBodyAsString());
        }
    }

    public void sendForgotPasswordEmail(String userId) {
        String token = getAdminToken();
        String uri = serverUrl + "/admin/realms/" + realm + "/users/" + userId
                + "/execute-actions-email?client_id=freelancehub-web&lifespan=1800";

        try {
            restClient.put()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(List.of("UPDATE_PASSWORD"))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException e) {
            log.error("Failed to dispatch password reset email: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send password reset email via Keycloak SMTP.");
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OtpSpiResponse(
            boolean success,
            String message,
            Long expiresIn,
            Long cooldown,
            String verificationTicket,
            String email
    ) {}

    public OtpSpiResponse requestRegistrationOtp(String email, String username) {
        String uri = serverUrl + "/realms/" + realm + "/registration-otp/send";

        Map<String, String> body = new HashMap<>();
        body.put("email", email.trim());
        if (username != null && !username.isBlank()) {
            body.put("username", username.trim());
        }

        try {
            return restClient.post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(OtpSpiResponse.class);
        } catch (RestClientResponseException e) {
            log.warn("Keycloak OTP SPI send returned error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            String errorMsg = extractErrorMessage(e.getResponseBodyAsString(), "Failed to send verification code.");
            throw new ResponseStatusException(HttpStatus.valueOf(e.getStatusCode().value()), errorMsg);
        }
    }

    public OtpSpiResponse verifyRegistrationOtp(String email, String otp) {
        String uri = serverUrl + "/realms/" + realm + "/registration-otp/verify";

        Map<String, String> body = Map.of(
                "email", email.trim(),
                "otp", otp.trim()
        );

        try {
            return restClient.post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(OtpSpiResponse.class);
        } catch (RestClientResponseException e) {
            log.warn("Keycloak OTP SPI verify returned error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            String errorMsg = extractErrorMessage(e.getResponseBodyAsString(), "Invalid verification code.");
            throw new ResponseStatusException(HttpStatus.valueOf(e.getStatusCode().value()), errorMsg);
        }
    }

    public boolean consumeVerificationTicket(String email, String ticket) {
        String uri = serverUrl + "/realms/" + realm + "/registration-otp/consume-ticket?email="
                + email.trim() + "&ticket=" + ticket.trim();

        try {
            OtpSpiResponse resp = restClient.post()
                    .uri(uri)
                    .retrieve()
                    .body(OtpSpiResponse.class);
            return resp != null && resp.success();
        } catch (RestClientResponseException e) {
            log.warn("Keycloak OTP SPI consume-ticket returned status={}", e.getStatusCode());
            return false;
        }
    }

    private String extractErrorMessage(String responseBody, String defaultMsg) {
        if (responseBody == null || responseBody.isBlank()) return defaultMsg;
        try {
            int msgIdx = responseBody.indexOf("\"message\":\"");
            if (msgIdx != -1) {
                int start = msgIdx + 11;
                int end = responseBody.indexOf("\"", start);
                if (end > start) return responseBody.substring(start, end);
            }
            int errIdx = responseBody.indexOf("\"error\":\"");
            if (errIdx != -1) {
                int start = errIdx + 9;
                int end = responseBody.indexOf("\"", start);
                if (end > start) return responseBody.substring(start, end);
            }
        } catch (Exception ignored) {
        }
        return defaultMsg;
    }
}
