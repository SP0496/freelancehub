package com.freelancehub.user.profile;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/me")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ProfileResponse getMyProfile(
            @AuthenticationPrincipal Jwt jwt) {

        return profileService.getMyProfile(jwt.getSubject());
    }

    @PutMapping
    public ProfileResponse saveMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateProfileRequest request) {

        return profileService.saveMyProfile(
                jwt.getSubject(),
                request
        );
    }
}