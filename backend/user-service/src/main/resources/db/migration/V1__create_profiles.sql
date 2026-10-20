CREATE TABLE profiles (
                          id VARCHAR(36) NOT NULL,
                          identity_subject VARCHAR(255) NOT NULL,
                          display_name VARCHAR(100) NOT NULL,
                          headline VARCHAR(160),
                          version BIGINT NOT NULL DEFAULT 0,
                          created_at TIMESTAMP(6) NOT NULL,
                          updated_at TIMESTAMP(6) NOT NULL,

                          PRIMARY KEY (id),

                          CONSTRAINT uk_profiles_identity_subject
                              UNIQUE (identity_subject)
);