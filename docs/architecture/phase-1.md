# Phase 1 architecture

ICPCAS begins as a modular monolith. The Next.js application is the user-facing workspace; the Express service is the protected system-of-record boundary. MongoDB is the persistent database. File objects will be stored privately and referenced through database metadata rather than public URLs.

## Authorization boundary

Every API request is evaluated in this order:

1. Verify bearer token and its expiry.
2. Check the required role for the action.
3. Check the user is assigned to the target project (unless they are a Super Admin).
4. Scope reads and writes to the caller's organization and project assignments.
5. Write an audit event for meaningful state changes.

The API reloads each active account's roles and project assignments while validating its session, so deactivation, role changes, and assignment changes apply on the next request.

## Records and contractual integrity

Official decisions are additive. An EOT assessment, recommendation, Employer decision, technical review or approved baseline will receive its own versioned record. A revision does not overwrite a prior record and a rejected submission never replaces an approved baseline. This is why the dashboard distinguishes submitted, reviewed, recommended and approved values.

## Data lifecycle

The interface contains sample records only. Browser persistence is a development convenience, not a database. The `backend` API is the required destination for production mutations. The current API now covers documents, correspondence, EOT, personnel and technical-submission workflows; construction operations, reports and notifications remain to be wired.

## Private files in development

The document route accepts only PDF, JPEG and PNG files up to 20 MB, hashes each file, records its project and uploader, and checks project access before download. The `FILE_STORAGE_PATH` implementation is a private local-development adapter; production deployment must replace it with private object storage, signed short-lived retrieval or streamed access, malware scanning and retention controls.
