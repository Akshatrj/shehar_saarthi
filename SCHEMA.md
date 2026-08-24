# SheharSaarthi database schema

PostgreSQL is the system of record. Prisma owns the schema and migrations in `prisma/`. Citizen name, email, phone, and password hash live **only** on `users`. Complaints store a `citizenId` foreign key — never copy PII onto complaint, map, or assignment rows.

## Apply locally

```bash
npx.cmd vercel env pull .env.local --yes
npm run db:migrate
npm run db:seed
```

Run `npm install` then `npx prisma generate` before importing `@prisma/client` in application code. The seed script uses `prisma/client.ts`.

## Tables

| Table | Purpose |
|-------|---------|
| `users` | Identity and role (`CITIZEN`, `ADMIN`, `FIELD_WORKER`) |
| `departments` | Municipal departments |
| `field_workers` | Staff profile linked to a `users` row; no extra PII |
| `complaints` | Current complaint state (location, status, AI fields, live assignment pointers) |
| `complaint_media` | Evidence object-storage keys (not public URLs) |
| `complaint_status_history` | Insert-only status audit |
| `complaint_assignments` | Insert-only assignment audit |
| `complaint_verifications` | Citizen confirm / reopen decisions |
| `notifications` | In-app notices for a single user |
| `ai_jobs` | Async AI work; submit path does not wait on this table |

`analytics_complaint_counts` is a **view** over `complaints` (counts and average hours open). Analytics does not duplicate rows.

## Complaint current state

`complaints` holds the live record:

- Identity: `id` (UUID), `publicRef` (e.g. `SS-2026-000123`)
- `citizenId`, `category`, `description`
- `location`, `latitude`, `longitude`
- `status`, `priority`
- `aiVerificationStatus`, `aiClassification`, `aiPriority`, `aiConfidence`, `duplicateOfId`
- Live assignment: `departmentId`, `assignedWorkerId` (latest assignment; history is `complaint_assignments`)
- `reopenReason` (latest citizen reopen text; full history is `complaint_verifications`)
- `createdAt`, `updatedAt`, `resolvedAt`, `closedAt`

Images are **not** stored as blobs or public paths. `complaint_media.storageKey` points at object storage.

## Enums

Status: `SUBMITTED` → `VERIFIED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `AWAITING_CITIZEN_VERIFICATION` → `CLOSED`. Reject path: `REOPENED` → `IN_PROGRESS`.

Priority: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.

Category: `ROADS`, `STREET_LIGHTS`, `GARBAGE`, `DRAINAGE`, `WATER`, `PUBLIC_INFRASTRUCTURE`, `OTHER`.

AI verification: `PENDING`, `VERIFIED`, `REJECTED`, `NEEDS_REVIEW`.

App constants live in `src/domains/complaints/types.ts` and match Prisma enums. Zod schemas live in `src/domains/complaints/validation.ts`.

## Relationships

- User 1—* Complaint (as citizen)
- Department 1—* Complaint (optional until assigned)
- FieldWorker 1—* Complaint (optional current assignee)
- Complaint 1—* media, status history, assignments, verifications, notifications, AI jobs
- Complaint *—1 Complaint (`duplicateOfId`)
- FieldWorker 1—1 User

## Access rules

Enforced in SQL (row-level security) **and** in `src/domains/complaints/policy.ts`. Services must call both: set `app.user_id` / `app.role` via `applyRlsContext` (`src/lib/rls.ts`), then apply policy functions. UI hiding is not security.

| Actor | Complaints | Citizen PII (`users` name/email/phone) |
|-------|------------|----------------------------------------|
| Citizen | Create own; read own; upload evidence on own; verify/reopen own when awaiting verification | Own row only |
| Admin | Read/manage all; assign department/worker; update status | Yes, on authorised admin detail only |
| Field worker | Read/update **currently assigned** complaints only | **Never** (cannot `SELECT` other users) |

Arbitrary authenticated users cannot list all citizens or all complaints.

Postgres **superusers** bypass RLS. The Docker `sheharsaarthi` role is a superuser for local convenience. Production must connect the app as a non-superuser **without** `BYPASSRLS`. Migrations may set `app.bypass_rls=on` for the transaction.

Column-level status/verify rules (citizen cannot arbitrarily set `CLOSED`, worker cannot change `citizenId`) are enforced in domain services using the Zod schemas and policy helpers, not only in RLS.

## Indexes

Complaints: `status`, `category`, `createdAt`, `(departmentId, status)`, `(citizenId, createdAt)`, `(assignedWorkerId, status)`, `(latitude, longitude)`, unique `publicRef`.

Also: notifications `(userId, readAt)`, AI jobs `(status, createdAt)`, assignment and history `(complaintId, createdAt)`.
