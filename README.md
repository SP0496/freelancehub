# FreelanceHub

A freelance marketplace using React, Spring Boot, MySQL, and Keycloak.

## Features

- Sign in with Keycloak
- Create and manage projects
- Submit, accept, and withdraw proposals
- Ownership checks for proposal actions
- Automated frontend and backend tests

## Requirements

- Docker Desktop with Docker Compose
- Git

## First-time setup

1. Clone the repository and open its folder.
2. Create your local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

   Do this only if `.env` does not already exist.

3. Fill in all four passwords in `.env`.
4. Validate and start:

   ```powershell
   docker compose config --quiet
   docker compose up -d --build
   ```

5. Check startup:

   ```powershell
   docker compose ps
   ```

   First startup can take several minutes. If MySQL becomes
   healthy but other services remain Created, run the startup
   command again.

6. Open http://localhost:5173.

MySQL creates the application databases and users on first
initialization. Flyway creates the application tables.

Keycloak imports the freelancehub realm and application clients.
Application users are created manually.

## Create test accounts

1. Open http://localhost:8180/admin.
2. Sign in as `admin` using `KEYCLOAK_ADMIN_PASSWORD`.
3. Select the `freelancehub` realm.
4. Create separate client and freelancer test users.
5. Set each user's password with Temporary turned off.

Use one account to post a project and the other to submit a proposal.
The project owner can then accept it.

## Optional email verification

Configure SMTP under Realm settings → Email.

For Gmail, use smtp.gmail.com, port 587, STARTTLS,
authentication, and a Google app password.

Set a real recipient address on the test user and add the
Verify Email required action.

SMTP credentials are configured locally in Keycloak and are
not included in the realm template. Configure them separately
for each environment.

## Daily commands

Start:

```powershell
docker compose up -d
```

Stop while preserving data:

```powershell
docker compose stop
```

Rebuild after changing application code:

```powershell
docker compose up -d --build
```

View recent logs:

```powershell
docker compose logs --tail=80
```

## Data and configuration

- MySQL and Keycloak data are stored in named Docker volumes.
- Database initialization scripts run only on an empty MySQL volume.
- Existing Keycloak realms are skipped during startup import.
- Never commit `.env` or SMTP credentials.
- `docker compose down -v` deletes this project's volumes.

## Automated checks

GitHub Actions runs frontend tests, build, and lint checks,
plus Maven verification for all three backend services.

## Deployment status

This Compose configuration is for local development.
It uses localhost addresses and Keycloak development mode.