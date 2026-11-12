# Foundation and Phase 2 API

All responses use this envelope:

```json
{ "success": true, "data": {} }
```

Validation and authorization errors use `{ "success": false, "error": { "message": "..." } }` and an appropriate HTTP status.

| Method | Endpoint | Authority | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | Public | Process health check |
| `POST` | `/api/v1/auth/initial-admin` | One-time token | Establish the initial Super Admin and consultant organization |
| `POST` | `/api/v1/auth/login` | Public | Obtain an eight-hour bearer session |
| `GET` | `/api/v1/auth/me` | Authenticated user | Return current account, roles and project assignments |
| `POST` | `/api/v1/auth/logout` | Authenticated user | Revoke the current session |
| `GET` | `/api/v1/projects` | Assigned user | List assigned, non-archived projects |
| `POST` | `/api/v1/projects` | Super/Organization Admin | Create a project and record an audit event |
| `GET` | `/api/v1/projects/:projectId` | Assigned user | Read an assigned project |
| `GET`, `POST` | `/api/v1/users` | Super/Organization Admin | List and create accounts; Organization Admins are limited to their organization and cannot assign administrator roles |
| `PATCH` | `/api/v1/users/:userId` | Super/Organization Admin | Change roles, assignments, or active status in authorized scope; only Super Admins can assign administrator roles |
| `GET`, `POST` | `/api/v1/organizations` | Administrator | List organizations or create one as Super Admin |
| `GET`, `POST` | `/api/v1/documents` | Assigned/authorized user | List or upload a private PDF/JPEG/PNG; upload requires `?projectId=` |
| `GET` | `/api/v1/documents/:documentId/download` | Assigned user | Download a private, authorized document |
| `GET`, `POST` | `/api/v1/eot` | Assigned contractor/administrator | List or create an EOT claim |
| `POST` | `/api/v1/eot/:claimId/submit` | Submitting Contractor | Submit a draft/resubmitted claim |
| `POST` | `/api/v1/eot/:claimId/supplementary-request` | Engineer | Request more substantiation |
| `POST` | `/api/v1/eot/:claimId/assessments` | Engineer or Employer by stage | Add immutable assessment, recommendation, or Employer decision |
| `GET`, `POST` | `/api/v1/personnel` | Assigned Contractor | List or create staff proposal records |
| `POST` | `/api/v1/personnel/:proposalId/events` | Workflow-authorized user | Record no-objection, mobilization, verification, replacement, etc. |
| `GET`, `POST` | `/api/v1/technical-submissions` | Assigned Contractor | List or create design-submission records |
| `POST` | `/api/v1/technical-submissions/:submissionId/reviews` | Engineer/Employer by decision | Record an attributed technical review |
| `GET`, `POST` | `/api/v1/correspondence` | Assigned workflow user | Read or register correspondence, links and attachments |
| `GET`, `POST` | `/api/v1/progress/activities` | Assigned Engineer/Admin | Configure weighted activity measurements |
| `GET`, `POST` | `/api/v1/progress/reports` | Assigned workflow user | Submit construction-progress records |
| `POST` | `/api/v1/progress/reports/:reportId/verify` | Engineer/Inspector | Verify quantities and calculate weighted progress |
| `GET`, `POST` | `/api/v1/equipment` | Assigned workflow user | Register and list equipment |
| `POST` | `/api/v1/equipment/:equipmentId/logs` | Assigned workflow user | Record mobilization, breakdown, maintenance or utilization |
| `GET`, `POST` | `/api/v1/materials` | Assigned workflow user | Register materials and inspect calculated stock availability |
| `POST` | `/api/v1/materials/:materialId/transactions` | Assigned workflow user | Append a delivery, issue, return or adjustment transaction |
| `GET`, `POST` | `/api/v1/recovery` | Assigned workflow user | Submit or inspect a recovery programme |
| `POST` | `/api/v1/recovery/:programmeId/verify-implementation` | Engineer/Inspector | Separately verify programme implementation |
| `GET`, `POST` | `/api/v1/quality/ncrs` | Quality/Engineer | Register and monitor NCRs |
| `POST` | `/api/v1/quality/corrective-actions` | Quality/Engineer | Assign a corrective action |
| `POST` | `/api/v1/auth/logout` | Authenticated user | Revoke the current session |
| `POST` | `/api/v1/auth/password-reset/request` | Public | Prepare a time-limited reset token |
| `POST` | `/api/v1/auth/password-reset/confirm` | Public | Replace password and revoke existing sessions |
| `GET` | `/api/v1/notifications` | Authenticated user | List personal notifications |
| `PATCH` | `/api/v1/notifications/:notificationId/read` | Notification owner | Mark a notification read |
| `GET` | `/api/v1/reports/project-status.csv` | Assigned user | Download a permission-scoped CSV status report |
| `GET` | `/api/v1/reports/project-status.html` | Assigned user | Open a print-friendly report and save as PDF from the browser |

Pass sessions as `Authorization: Bearer <token>`. Project access is enforced in the API even where the corresponding workspace controls are hidden.

EOT assessments and recommendations are separate records; they do not overwrite the Contractor's original claim. Only an `EMPLOYER` role can record final EOT approval. For a document upload, put the authorized project ID in the query string before the multipart file is sent: `POST /api/v1/documents?projectId=<id>`.
