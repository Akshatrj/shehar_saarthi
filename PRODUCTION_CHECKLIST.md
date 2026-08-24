# SheharSaarthi production checklist

Release audit: 18 August 2026. Engineering review of the repository after the Stage 22 performance pass.

Use this list as the go-live sign-off. Items marked `[x]` were verified in code during this audit. Items marked `[ ]` still need a human or operations step on the target environment.

## Sign-off

- [x] Architecture verified
- [x] Authentication verified
- [x] Authorization verified
- [x] Database verified
- [x] Storage verified
- [x] AI integration verified
- [x] Citizen workflow verified
- [x] Admin workflow verified
- [x] Notifications verified
- [x] Maps verified
- [x] Analytics verified
- [x] Security audit completed
- [ ] Mobile testing completed
- [x] Production build completed

Mobile testing stays unchecked until someone exercises the flows on a phone (report wizard, map pin, queue, verification).

## Architecture

Modular Next.js App Router monolith. Route groups separate public, citizen, admin, and staff surfaces. Domain logic lives under `src/domains/` (complaints, AI, maps, notifications, analytics, storage, auth). Shared UI lives under `src/components/`. APIs are versioned at `/api/v1`. Layouts are not treated as authorization.

## Functionality (code paths)

Citizen: register or sign in, report with photo + pin, track status, map of own pins, notifications, YES closes / NO reopens after `AWAITING_CITIZEN_VERIFICATION`.

Admin: queue search/filter/pagination, assign department or field worker, status updates, AI/duplicate review, resolve to citizen confirmation (cannot skip to `CLOSED`), maps, analytics, predictive maintenance.

Staff: assigned complaints only; identity of the citizen is not shown.

Duplicates are linked, never deleted. Status names match the Prisma `ComplaintStatus` enum.

## Security

- Secrets stay server-side. No `NEXT_PUBLIC_*` AI or map keys.
- `.env` / `.env*.local` are gitignored. `.env.example` has placeholders only.
- Production runtime requires `AUTH_SECRET` and `DATABASE_URL`. Demo logins (`FOUNDATION_AUTH`) are ignored when `NODE_ENV=production`.
- APIs use `requireCitizen` / `requireAdmin` / `requireSignedIn` plus `canReadComplaint` / assign policy. Field-worker role is preserved on the JWT.
- Evidence is outside `public/`, 8 MB check before buffering, JPEG/PNG/WebP sniff, `private, no-store` on media responses.
- RLS policies and ownership triggers exist in migrations. **They do not apply if the database role is a superuser.**

See [SECURITY_AUDIT.md](SECURITY_AUDIT.md).

## Database

Relationships: User → complaints / notifications / verifications; Complaint → media, history, assignments, duplicates, AI jobs. Indexes on complaint status, category, createdAt, citizen+createdAt, assignee+status, lat/lng, notifications user+readAt and user+createdAt.

Apply all Prisma migrations before go-live:

```bash
npx.cmd prisma migrate deploy
```

## AI

Provider is server-only (`stub` or `openai`). Responses are parsed with Zod (`parseAiVerificationResult`). Invalid or low-confidence output becomes `NEEDS_REVIEW`. Failures do not block submission. Worker drain requires `AI_WORKER_SECRET` (timing-safe) or an admin session.

## UI

Responsive shells, skip link, loading/error/empty states on primary desks. Evidence images use `decoding="async"`. Authenticated blobs are not passed through `next/image`.

## Performance (Stage 22)

Applied only where the cost was measurable:

- Citizen dashboard stats via `groupBy`; recent list `take: 6`
- Complaint lists paginated (40 per page)
- Unread notification badge uses `count` instead of loading rows
- Public issue areas aggregated in SQL (`GROUP BY` rounded lat/lng)
- Nominatim fetches cached 24h; map-click reverse geocode debounced
- Leaflet loaded with `next/dynamic` (report wizard location step; map views)
- Dashboard map GeoJSON loaded on the server (no extra `/api/v1/maps/mine` round trip)
- `compress: true` and package-import optimization for Leaflet

Not added: `sharp` image transcoding (upload already capped at 8 MB and sniffed). Do not use `next/image` for cookie-gated evidence.

Production build: `npx.cmd tsc --noEmit` and `npx.cmd next build`.

## Deployment

| Setting | Development | Production |
|---------|-------------|------------|
| `AUTH_URL` | `http://localhost:3000` | Public HTTPS origin |
| `AUTH_SECRET` | Local random ≥32 chars | Unique secret ≥32 chars |
| `FOUNDATION_AUTH` | `true` for demo logins | Ignored / leave `false` |
| `DATABASE_URL` | Neon Postgres (Vercel Marketplace) | Non-superuser, no `BYPASSRLS` |
| `AI_API_KEY` / `AI_WORKER_SECRET` | Optional stub | Server-only; never `NEXT_PUBLIC_*` |

Documented in `.env.example` and [README.md](README.md).

## Residuals (must be handled at deploy)

These are not application-code defects, but they **block calling a live municipal deploy “done”**:

1. Neon’s default owner role can bypass RLS. Production must use a non-superuser without `BYPASSRLS`.
2. Rate limits are in-memory per serverless instance. Multiple instances need a shared or gateway limiter.
3. Nominatim is proxied for signed-in citizens (auth + rate limit). Respect OSM usage policy; consider a self-hosted nominatim for high volume.
4. Evidence photos use Vercel Blob in production (`BLOB_READ_WRITE_TOKEN` or OIDC). Do not rely on the local `./storage` folder on Vercel.
5. Run `npm run db:migrate` on the Neon database, including `20260818183000_notification_created_at_index`.

## Production-ready?

**Application code is ready to deploy** once the residuals above are applied on the host. Do not declare the *environment* production-ready until:

- migrations are applied
- the database role is not a superuser
- `AUTH_SECRET` / `AUTH_URL` / `DATABASE_URL` are set for that origin
- demo auth cannot succeed (`NODE_ENV=production`)
- mobile smoke tests are done on a real device
