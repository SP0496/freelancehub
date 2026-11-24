package com.freelancehub.user.auth;

import com.freelancehub.user.auth.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registration-otp/send")
    public ResponseEntity<SendOtpResponse> sendRegistrationOtp(
            @Valid @RequestBody SendOtpRequest request) {
        SendOtpResponse response = authService.sendRegistrationOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/registration-otp/verify")
    public ResponseEntity<VerifyOtpResponse> verifyRegistrationOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        VerifyOtpResponse response = authService.verifyRegistrationOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        ForgotPasswordResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }
}
