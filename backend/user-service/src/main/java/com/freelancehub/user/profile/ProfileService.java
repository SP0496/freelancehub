package com.freelancehub.user.profile;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile(String subject) {

        ProfileEntity profile = profileRepository
                .findByIdentitySubject(subject)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Create your profile first"
                ));

        return toResponse(profile);
    }

    @Transactional
    public ProfileResponse saveMyProfile(
            String subject,
            UpdateProfileRequest request) {

        String displayName = request.displayName().strip();

        String headline = request.headline() == null
                ? null
                : request.headline().strip();

        ProfileEntity profile = profileRepository
                .findByIdentitySubject(subject)
                .orElseGet(() -> new ProfileEntity(
                        subject,
                        displayName,
                        headline
                ));

        profile.update(displayName, headline);

        try {
            ProfileEntity saved =
                    profileRepository.saveAndFlush(profile);

            return toResponse(saved);

        } catch (DataIntegrityViolationException
                 | ObjectOptimisticLockingFailureException exception) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Profile changed. Reload and retry."
            );
        }
    }

    private ProfileResponse toResponse(ProfileEntity profile) {
        return new ProfileResponse(
                profile.getDisplayName(),
                profile.getHeadline()
        );
    }
}