# Production handoff checklist

The repository now contains a runnable web/API/MongoDB composition, but production activation still requires environment and service decisions by the operating organization.

## Required before go-live

- Use managed MongoDB with encrypted connections, point-in-time backups, restore drills and least-privilege credentials.
- Replace `FILE_STORAGE_PATH` local disk with private object storage. Add malware scanning, encryption, lifecycle retention, and short-lived authorized retrieval.
- Generate unique secrets for `JWT_SECRET` and `INITIAL_ADMIN_SETUP_TOKEN`; store them in a secret manager.
- Set an explicit production `CORS_ORIGIN` and put the services behind TLS/reverse proxy.
- Configure email delivery for password-reset and deadline notifications. Never expose reset tokens in production responses.
- Run `npm run typecheck`, `npm test`, frontend build, API integration tests against a dedicated test MongoDB, and browser workflow tests before release.
- Review role/project assignments with the three participating organizations and create the initial Super Admin only through the one-time bootstrap endpoint.
- Establish retention, incident response, audit-log review, and backup-restore ownership.

## Current safe defaults

- API startup refuses to run without `MONGODB_URI` and `JWT_SECRET`.
- Authentication is rate-limited, hashed with bcrypt, session-backed, and revocable.
- Project access and role checks execute on the API.
- Uploaded files are constrained to PDF/JPEG/PNG and 20 MB in the development adapter.
- Sample seed requires `ALLOW_SAMPLE_SEED=true` and refuses a non-empty project database.
