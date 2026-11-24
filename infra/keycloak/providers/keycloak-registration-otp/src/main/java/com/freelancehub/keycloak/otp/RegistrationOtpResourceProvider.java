package com.freelancehub.keycloak.otp;

import com.freelancehub.keycloak.otp.dto.ApiResponse;
import com.freelancehub.keycloak.otp.dto.SendOtpRequest;
import com.freelancehub.keycloak.otp.dto.VerifyOtpRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import org.keycloak.email.EmailException;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.services.resource.RealmResourceProvider;

@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RegistrationOtpResourceProvider implements RealmResourceProvider {
    private static final Logger logger = Logger.getLogger(RegistrationOtpResourceProvider.class);

    private final KeycloakSession session;
    private final RegistrationOtpService otpService;

    public RegistrationOtpResourceProvider(KeycloakSession session) {
        this.session = session;
        this.otpService = new RegistrationOtpService(session);
    }

    @Override
    public Object getResource() {
        return this;
    }

    @Override
    public void close() {
        // No-op
    }

    @OPTIONS
    @Path("{any:.*}")
    public Response corsPreflight() {
        return addCors(Response.ok()).build();
    }

    @POST
    @Path("/send")
    public Response sendOtp(SendOtpRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return addCors(Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Email address is required.")))
                    .build();
        }

        RealmModel realm = session.getContext().getRealm();
        if (realm == null) {
            return addCors(Response.status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.error("Realm context not found.")))
                    .build();
        }

        try {
            RegistrationOtpService.SendResult result = otpService.requestOtp(request.getEmail(), realm);
            if (!result.isSuccess()) {
                return addCors(Response.status(result.getStatusCode())
                        .entity(ApiResponse.error(result.getErrorMessage())))
                        .build();
            }

            return addCors(Response.ok(ApiResponse.ok(
                    "A 6-digit verification code has been dispatched to your email via Keycloak SMTP.",
                    result.getExpiresIn(),
                    result.getCooldown()
            ))).build();

        } catch (EmailException e) {
            logger.error("Failed to send OTP email: " + e.getMessage(), e);
            return addCors(Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to send verification code through Keycloak SMTP. Check SMTP configuration.")))
                    .build();
        } catch (Exception e) {
            logger.error("Unexpected error in sendOtp: " + e.getMessage(), e);
            return addCors(Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Internal identity server error.")))
                    .build();
        }
    }

    @POST
    @Path("/verify")
    public Response verifyOtp(VerifyOtpRequest request) {
        if (request == null || request.getEmail() == null || request.getOtp() == null) {
            return addCors(Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Email and 6-digit verification code are required.")))
                    .build();
        }

        try {
            RegistrationOtpService.VerifyResult result = otpService.verifyOtp(request.getEmail(), request.getOtp());
            if (!result.isSuccess()) {
                return addCors(Response.status(result.getStatusCode())
                        .entity(ApiResponse.error(result.getErrorMessage())))
                        .build();
            }

            return addCors(Response.ok(ApiResponse.verified(
                    "Verification code confirmed successfully.",
                    result.getVerificationTicket(),
                    result.getEmail(),
                    result.getExpiresIn()
            ))).build();

        } catch (Exception e) {
            logger.error("Unexpected error in verifyOtp: " + e.getMessage(), e);
            return addCors(Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Internal identity server error.")))
                    .build();
        }
    }

    @POST
    @Path("/consume-ticket")
    public Response consumeTicket(@QueryParam("email") String email, @QueryParam("ticket") String ticket) {
        if (email == null || ticket == null) {
            return addCors(Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Email and ticket are required.")))
                    .build();
        }

        boolean valid = RegistrationOtpService.consumeVerificationTicket(email, ticket);
        if (!valid) {
            return addCors(Response.status(Response.Status.FORBIDDEN)
                    .entity(ApiResponse.error("Invalid or expired verification ticket. Please re-verify.")))
                    .build();
        }

        return addCors(Response.ok(ApiResponse.ok("Verification ticket consumed successfully.", null, null))).build();
    }

    private Response.ResponseBuilder addCors(Response.ResponseBuilder builder) {
        return builder
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT")
                .header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")
                .header("Access-Control-Max-Age", "3600");
    }
}
