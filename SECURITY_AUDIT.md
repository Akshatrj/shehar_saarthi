# SheharSaarthi security audit

Date: 18 August 2026  
Scope: authentication, authorization, RLS, APIs, uploads, input, XSS/CSRF, injection, secrets, privacy, file access, rate limits, errors, logging.  
Method: source review of `src/`, `prisma/`, `next.config.ts`, Docker, and environment handling. No Firebase is used.

Citizen name, email, phone, and password hashes must not be available to other citizens, the public, field workers, or unauthenticated users. Admin APIs must not rely on UI routes alone.

---

## Findings

| ID | Vulnerability | Severity | Affected component | Fix | Status |
|----|---------------|----------|--------------------|-----|--------|
| SA-01 | Hardcoded demo passwords (`citizen` / `admin`) work whenever `FOUNDATION_AUTH=true`. | Critical | `src/lib/auth.ts`, `.env.example` | Disable foundation auth whenever `NODE_ENV=production`. Demo logins remain for `next dev` only. | **Fixed** |
| SA-02 | `AUTH_SECRET` was optional; a missing secret in production weakens JWT sessions. | Critical | `src/lib/env.ts` | Require `AUTH_SECRET` (min 32 chars) at production runtime. Invalid env errors no longer echo Zod internals. | **Fixed** |
| SA-03 | Neon default owner role can bypass RLS for the app connection. | Critical (production if copied) | `DATABASE_URL` | Documented: production must use a non-superuser **without** `BYPASSRLS`. Application policy, `WITH CHECK`, and triggers still apply. | **Open — deployment** |
| SA-04 | Citizen dashboard queried other citizens’ complaints (publicRef + location). With a superuser DB role this returned other people’s issue locations. | High | `src/domains/complaints/citizen-dashboard.ts` | Removed cross-citizen `findMany`. Nearby public areas must use a privacy-safe aggregate, not another person’s pin. | **Fixed** |
| SA-05 | `complaints` UPDATE policy had `USING` but no `WITH CHECK`; a citizen update could have changed `citizenId`. | High | RLS `complaints_update` | Recreated policy with `WITH CHECK` that the owner / assignee still matches. Trigger `protect_complaint_ownership` blocks `citizenId` changes unless admin or RLS bypass. | **Fixed** |
| SA-06 | `users` UPDATE allowed a non-admin to change `role` / `passwordHash` if any write path sent those fields. | High | RLS `users_update_self`, table `users` | `WITH CHECK` prevents promoting self to `ADMIN`. Trigger `protect_user_privileges` blocks role and password hash changes unless admin or bypass. | **Fixed** |
| SA-07 | Complaint photo was fully buffered before size checks (DoS). | High | `src/app/api/v1/complaints/route.ts` | Reject when `photo.size` exceeds 8 MB before `arrayBuffer()`. Server action body limit aligned to 8 MB. Magic-byte validation still applies. | **Fixed** |
| SA-08 | No rate limiting on login, geo proxy, uploads, or AI drain. | High | Auth and `/api/v1/*` | In-memory sliding window in middleware: credential POSTs 20/min, complaint POST 8/min, geo 30/min, AI process 10/min, other v1 120/min. Session GET is not limited. Per-IP; not shared across multiple Node instances. | **Fixed** |
| SA-09 | Field worker JWT role was coerced to `CITIZEN`, mixing portals. | High | `src/lib/auth.ts` session callback | Preserve `FIELD_WORKER` on the session. Unknown roles still become `CITIZEN` (not `ADMIN`). | **Fixed** |
| SA-10 | Evidence images used a short shared cache (`max-age=120`) without a restrictive CSP on the response. | Medium | Media GET route | `Cache-Control: private, no-store`, `Content-Disposition`, image sandbox CSP, `nosniff`. Access still requires a signed-in user plus RLS and `canReadComplaint`. | **Fixed** |
| SA-11 | Dashboard errors returned `error.message` (possible Prisma leakage). | Medium | Citizen dashboard | Generic “Could not load your complaints.” | **Fixed** |
| SA-12 | Browser security headers incomplete (clickjacking was already `DENY`). | Medium | `next.config.ts` | Added COOP, `X-Permitted-Cross-Domain-Policies`, and a CSP for `base-uri` / `form-action` / `frame-ancestors` / `object-src`. Full `script-src` lock-down is not applied so Next.js hydration keeps working. | **Fixed** |
| SA-13 | Middleware only checks that a session cookie exists, not the role. | Medium | `src/middleware.ts` | Accepted for redirects. **Admin APIs use `requireAdmin()`; admin pages use the server layout + `canAccessAdminArea`.** Cookie presence is not authorization. | **Accepted** |
| SA-14 | In-memory rate limits do not hold across multiple server instances. | Medium | `src/lib/rate-limit.ts` | Replace with Redis/gateway limits in production. | **Open** |
| SA-15 | Nominatim is an open proxy for signed-in citizens (abuse / ToS). | Medium | `src/app/api/v1/geo/*` | Auth + rate limit. Still no per-user quota store. | **Partial** |
| SA-16 | Admin `notifications` SELECT is allowed for all rows (staff can read other users’ in-app notices). | Low | RLS `notifications_select` | Bodies are operational, not passwords. Keep for municipal ops or narrow later. | **Accepted** |
| SA-17 | Stored description HTML is not sanitized server-side. | Low | Complaint create + React render | React text interpolation escapes XSS. Do not introduce `dangerouslySetInnerHTML` on user text. Landing JSON-LD is static. | **Accepted** |
| SA-18 | CSRF on cookie-authenticated POST APIs depends on Auth.js `SameSite` cookies (Lax) and same-origin `fetch`. | Low | Auth.js session | Auth.js issues a CSRF token for its own callback. App POSTs are same-site. Add Origin checks if a native/mobile cross-site client is added. | **Accepted** |
| SA-19 | SQL injection via Prisma tagged `$executeRaw` / `set_config` is parameterized. | Info | `src/lib/rls.ts` | No string-concatenated SQL found. | **Pass** |
| SA-20 | AI keys are server-only (`AI_API_KEY` never `NEXT_PUBLIC_*`). Worker drain uses timing-safe Bearer compare. Empty worker secret does not open the route (admin session required). | Info | `src/domains/ai/provider.ts`, `src/app/api/v1/ai/process/route.ts` | Keep worker secret long and random in production. | **Pass** |
| SA-21 | Evidence is not under `public/`; keys must start with `complaints/` and cannot contain `..`. | Info | `src/domains/storage/service.ts` | Pass. Images sniffed as JPEG/PNG/WebP only. | **Pass** |
| SA-22 | Health endpoint exposes only service name + `ok`. | Info | `src/app/api/v1/health/route.ts` | Pass. | **Pass** |
| SA-23 | No Firebase; storage is local disk (later S3). Minio demo passwords are local-only. | Info | Docker Minio | Do not expose Minio ports on the public internet. | **Open — deployment** |
| SA-24 | Field workers cannot `SELECT` other `users` rows (RLS). Admin PII only on complaint detail via `canReadCitizenPii`. | Info | `policy.ts` + RLS | Pass for current APIs. | **Pass** |
| SA-25 | Unauthenticated users cannot call complaint or media APIs (`requireCitizen` / `requireSignedIn`). | Info | `src/lib/api/session.ts` | Pass. | **Pass** |

---

## Critical and high — what changed in code

1. Production ignores `FOUNDATION_AUTH`; demo passwords cannot authenticate.
2. Production runtime requires `AUTH_SECRET`.
3. Complaint ownership and user privilege triggers + UPDATE `WITH CHECK`.
4. No cross-citizen complaint list on the dashboard.
5. Upload size rejected before buffering; 8 MB action limit.
6. API and login rate limits.
7. Field worker role preserved on the session.
8. Stricter evidence headers; generic dashboard errors; extra HTTP security headers.

Apply the new migration when Postgres is up:

```bash
npx.cmd prisma migrate deploy
```

---

## Authorization model (must stay true)

| Layer | What it does |
|-------|----------------|
| UI layouts | Redirect unsigned / wrong-portal users. **Not sufficient alone.** |
| `requireAdmin` / `requireCitizen` / `requireSignedIn` | Enforced on API routes. |
| `src/domains/complaints/policy.ts` | Row-level rules in application code (including media). |
| PostgreSQL RLS | Enforced when the DB role is **not** a superuser. |

Admin actions (`/api/v1/admin/*`, `/api/v1/ai/process` without worker secret) call `requireAdmin()` on the server.

---

## Privacy checklist

| Actor | Citizen name/email/phone | Other citizens’ complaints |
|-------|--------------------------|----------------------------|
| Public / unauthenticated | No | No |
| Other citizens | No | No (nearby list removed; RLS also hides rows) |
| Field worker | No (`users` RLS is self or admin) | Assigned complaints only, no PII columns on complaint rows |
| Admin | Yes, complaint detail only | Yes, operational |

---

## Residual production requirements

- Connect Prisma as a **non-superuser** without `BYPASSRLS`.
- Set a long random `AUTH_SECRET`; never ship `FOUNDATION_AUTH` as the login system.
- Put a reverse-proxy or Redis rate limiter in front of the app.
- Do not publish Minio (9000/9001) or Postgres 5432 to the internet.
- Keep `AI_API_KEY` and `AI_WORKER_SECRET` server-side only.
- Prefer HSTS at the TLS terminator.
