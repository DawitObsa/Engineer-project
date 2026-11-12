# ICPCAS

Integrated Construction Project Management and Contract Administration System for engineering consultancy project controls.

The initial project is the **Tepi–Mizan Road Upgrading Project** (Ethiopia), with Prominent Engineering Solutions as Consultant/Engineer, Chiana Gezhouba Group Co., Ltd. as Contractor and Ethiopian Roads Administration as Employer.

> The records shown in the interface are explicitly labelled historical, document-derived sample data. They are not verified current project status and must be checked against their source letters before operational use.

## What is implemented in this delivery

- A responsive enterprise project workspace with project selector, navigation, notifications and a role-aware sample entry screen.
- A rich dashboard based on declared sample records: verified-versus-planned progress, work activity completion, controlled workflow status and attention items.
- Functional controlled registers for progress, EOT, personnel, technical submissions, recovery, quality and correspondence: search, filter, record details and local draft creation work in the browser.
- A Phase 1 Express/MongoDB API foundation: security headers, constrained CORS, validation, JWT-based authorization, initial-admin bootstrap, login, project access rules and audit logging.
- Phase 2 API workflows for private document metadata/files, correspondence, EOT claims and non-overwriting assessments, staff proposals/mobilization events, and technical-submission reviews.
- Live API login/session revocation, password-reset workflow, personal notifications, and permission-scoped CSV/printable status reports.
- Core data models for organizations, users, projects, audit logs, documents, EOT, correspondence, personnel, technical submissions, progress, equipment, materials/fuel, recovery and quality with timestamps and indexes.

The frontend currently uses persisted sample-browser state so it can be evaluated without a database. The backend establishes the secure integration boundary; production workflows must be wired to the API after MongoDB configuration.

## Run the frontend

```powershell
npm install
npm run dev
```

Open the `Local` URL printed in the terminal. If port 3000 is already in use, Next.js chooses another port such as 3001. Run only one `npm run dev` process for this workspace: dev servers and `npm run build` share `.next` and must not run concurrently. In sample mode, choose a role to enter the workspace; sample drafts are preserved in this browser's local storage.

For live role-based authentication, create a project-root `.env.local` file containing:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_ALLOWED_DEV_ORIGINS=10.171.222.82
```

Replace the allowed dev origin with the IP or hostname used to open the app over your LAN; use a comma-separated list for multiple origins. Restart the frontend after changing environment variables. Live sessions use current account roles and project assignments; navigation is filtered by role and API permissions are enforced server-side.

## Run the API

```powershell
Copy-Item .env.example backend/.env
# Edit backend/.env: provide a real MongoDB URI, JWT_SECRET and one-time setup token.
Set-Location backend
npm install
npm run dev
```

The API listens on `http://localhost:4000`; health is available at `GET /api/v1/health`.

If `NEXT_PUBLIC_API_URL` is configured, the web sign-in form uses live API authentication. Without it, the interface remains in explicitly labelled sample mode for offline evaluation; sample mode cannot register accounts.

### Optional clearly-labelled pilot seed

Use only against an empty, dedicated development database. Set `ALLOW_SAMPLE_SEED=true` and a unique `SEED_ADMIN_PASSWORD` in `backend/.env`, then run:

```powershell
npm run seed:sample
```

The script refuses to run against a database that already has a project. It creates only historical document-derived sample records and does not invent missing approvals, values or actual completion dates.

### Initial administrator setup

Before users exist, call `POST /api/v1/auth/initial-admin` with a setup token that matches `INITIAL_ADMIN_SETUP_TOKEN`. That operation can only succeed once while the user collection is empty. Never use the sample UI as a production authentication mechanism.

After setup, Super Admins and Organization Admins can register users from **User Management**. Organization Admins can manage accounts only in their own organization and cannot assign either administrator role. There is no public self-registration endpoint; administrator role assignment is enforced by the API. Account deactivation and role/project-assignment changes take effect on the next API request, and sign-out revokes the active session.

## Project structure

```
app/                     Next.js App Router interface and small health endpoint
components/              Reserved for extracted shared UI modules
lib/                     Typed sample pilot data
backend/src/             Express API, models, middleware and routes
docs/api/                API notes
docs/architecture/       Architecture decisions
```

## Phase 1 security decisions

- Passwords are hashed with bcrypt (12 rounds) in the API and never returned.
- API credentials are signed JWTs with a bounded eight-hour lifetime.
- Role checks and project assignment checks run server-side; hiding a UI action is never an authorization control.
- Environment configuration is required at API startup; no credentials are hard-coded.
- Audit records are append-only from ordinary feature routes. Approved contractual decisions should be modelled as new controlled decisions, never overwritten.

## Current scope and next work

This delivery implements the requested **Phase 1 foundation**, a polished, operable project-control frontend, and substantial API workflows across contract administration and construction operations. Remaining production hardening is primarily database-backed dashboard data binding, email delivery, formal PDF/Excel service generation, malware scanning/object-storage integration, full end-to-end coverage, and operational runbooks.

## Docker deployment

Set `JWT_SECRET`, `INITIAL_ADMIN_SETUP_TOKEN`, and (optionally) `CORS_ORIGIN`, then run:

```powershell
docker compose up --build
```

The web app is served at `http://localhost:3000`, API at `http://localhost:4000`, and MongoDB/file volumes are persisted by Docker. Use managed MongoDB/private object storage and a TLS reverse proxy before production use.

## Checks

```powershell
Set-Location backend
npm run typecheck
npm test
```

The included smoke tests cover the API health contract and unauthenticated project access; expand with a dedicated test MongoDB instance for full workflows.

See [production handoff checklist](docs/operations/production.md) before connecting the system to real contractual records.

See [architecture notes](docs/architecture/phase-1.md) and [API notes](docs/api/phase-1.md) for the implemented contract.
