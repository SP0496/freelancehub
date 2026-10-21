CREATE TABLE proposals (
                           id VARCHAR(36) NOT NULL,
                           project_id VARCHAR(36) NOT NULL,
                           freelancer_subject VARCHAR(255) NOT NULL,
                           cover_letter TEXT NOT NULL,
                           proposed_amount DECIMAL(12, 2) NOT NULL,
                           delivery_days INT NOT NULL,
                           status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
                           version BIGINT NOT NULL DEFAULT 0,
                           created_at TIMESTAMP(6) NOT NULL,
                           updated_at TIMESTAMP(6) NOT NULL,

                           PRIMARY KEY (id),

                           CONSTRAINT fk_proposals_project
                               FOREIGN KEY (project_id) REFERENCES projects(id),

                           CONSTRAINT uk_proposals_project_freelancer
                               UNIQUE (project_id, freelancer_subject),

                           CONSTRAINT chk_proposals_amount
                               CHECK (proposed_amount > 0),

                           CONSTRAINT chk_proposals_delivery
                               CHECK (delivery_days BETWEEN 1 AND 365),

                           CONSTRAINT chk_proposals_status
                               CHECK (
                                   status IN (
                                              'SUBMITTED',
                                              'ACCEPTED',
                                              'REJECTED',
                                              'WITHDRAWN'
                                       )
                                   ),

                           INDEX idx_proposals_freelancer_created
                               (freelancer_subject, created_at, id),

                           INDEX idx_proposals_project_status
                               (project_id, status)
);