package com.freelancehub.user.profile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository
        extends JpaRepository<ProfileEntity, String> {

    Optional<ProfileEntity> findByIdentitySubject(String identitySubject);
}