CREATE TABLE projects (
                          id VARCHAR(36) NOT NULL,
                          client_subject VARCHAR(255) NOT NULL,
                          title VARCHAR(150) NOT NULL,
                          description TEXT NOT NULL,
                          budget DECIMAL(12, 2) NOT NULL,
                          currency VARCHAR(3) NOT NULL DEFAULT 'INR',
                          status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
                          version BIGINT NOT NULL DEFAULT 0,
                          created_at TIMESTAMP(6) NOT NULL,
                          updated_at TIMESTAMP(6) NOT NULL,

                          PRIMARY KEY (id),
                          CONSTRAINT chk_projects_budget CHECK (budget > 0),
                          CONSTRAINT chk_projects_status
                              CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),

                          INDEX idx_projects_client (client_subject),
                          INDEX idx_projects_status_created (status, created_at, id)
);