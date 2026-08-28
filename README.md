# SheharSaarthi

Your City. Your Voice. Your Change.

A civic complaint portal for Indian municipalities. Residents report issues with a photo and map pin; workers, department admins, and super admins route and resolve them.

## Stack

- Next.js 15 (App Router) and React 19
- Auth.js v5 (Google OAuth + email/password)
- Prisma 6 and Neon PostgreSQL
- Vercel Blob for evidence photos
- Google Gemini for optional server-side classification (complaints still work without it)
- Leaflet + OpenStreetMap (no browser map key)

## Portals

| Role | Path |
|------|------|
| Citizen | `/citizen` |
| Field worker | `/worker` |
| Department admin | `/department-admin` |
| Super admin | `/admin` |

Public pages: `/`, `/about`, `/how-it-works`, `/contact`, `/privacy`, `/terms`. Sign in at `/login`; register at `/register`. `/staff-login` and `/admin/login` redirect to `/login`.

## Install

Prerequisites: Node.js 20+, npm 10+, a Vercel account (app + Neon Postgres + Blob).

On Windows PowerShell, use `npx.cmd` rather than `npx`.

```bash
copy .env.example .env.local
npm install
npx.cmd vercel login
npx.cmd vercel link
npx.cmd vercel integration add neon
npx.cmd vercel blob store add
npx.cmd vercel env pull .env.local --yes
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000

Never commit `.env.local`. Only `.env.example` (placeholders) belongs in git.

## Environment variables

Copy `.env.example` to `.env.local`. Names the app uses:

| Name | Purpose |
|------|---------|
| `AUTH_URL` | Public origin (local: `http://localhost:3000`; production: `https://shehar-saarthi.vercel.app`) |
| `AUTH_SECRET` | Auth.js secret (≥32 characters in production) |
| `FOUNDATION_AUTH` | `true` enables local demo logins (ignored in production) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth |
| `DATABASE_URL` / `DIRECT_URL` | Neon pooled and direct Postgres URLs |
| `SUPER_ADMIN_EMAIL` | Google inbox promoted to Super Admin |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Optional civic AI |

Commented optional tunables (timeouts, confidence, priority weights, civic RSS) are listed in `.env.example`. Vercel/Neon may also inject `POSTGRES_*` URLs; the app reads those as fallbacks.

Do not add `NEXT_PUBLIC_*` for AI keys, database URLs, or map tokens.

## Database

Schema: `prisma/schema.prisma`. History: `prisma/migrations/`. Seed: `prisma/seed.ts` (departments; demo users only when foundation auth is on).

```bash
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:seed
```

Do not run `prisma migrate reset` against a shared or production database. Neon’s default owner role can bypass RLS; use a restricted app role before municipal go-live.

## Development

```bash
npm run dev
```

Local `npm run dev` uses the Neon database from `.env.local`. Evidence photos stay in `./storage` until `BLOB_READ_WRITE_TOKEN` is set.

### Local demo accounts

Only when `FOUNDATION_AUTH=true` and `NODE_ENV` is not `production`:

| Portal | Email | Password |
|--------|-------|----------|
| Citizen `/login` | `citizen@sheharsaarthi.local` | `citizen` |
| Super admin `/login` | `admin@sheharsaarthi.local` | `admin` |
| Worker `/login` | `worker@sheharsaarthi.local` | `worker` |

Register a real citizen account on Vercel preview/production.

## Testing

```bash
npm run lint
npm run test:all
```

Scripts under `scripts/test-*.ts` cover complaints, classification, routing, worker/department-admin/admin desks, auth, and role sync. `npm run test:gemini:live` hits Gemini and is optional.

## Production build

```bash
npm run build
npm start
```

`npm run build` runs `prisma generate` then `next build`.

## Deployment (Vercel)

1. Link the Git repository in the Vercel dashboard.
2. Connect Neon and Blob to Production, Preview, and Development.
3. Set `AUTH_SECRET` and set `AUTH_URL` to `https://shehar-saarthi.vercel.app` on Production (keep `http://localhost:3000` for local `.env.local`).
4. Leave `FOUNDATION_AUTH` unset or `false`.
5. Apply migrations once: `npm run db:migrate`
6. Seed departments if needed: `npm run db:seed`
7. In Google Cloud Console, add the production authorized origin and redirect URI listed in `.env.example`.

Gemini is optional. If `GEMINI_API_KEY` is missing, citizens pick a category manually.

## Architecture notes

- Domain logic lives in `src/domains/` (auth, complaints, routing, AI, storage, admin).
- Server Actions and a small `/api/v1` surface (`health`, `me`, `complaints`) sit in `src/app/`. Classification is `POST /api/classify`.
- Layouts are not authorization. `src/lib/auth/require.ts` loads the user from Prisma on each request.
- Roles: `CITIZEN`, `WORKER`, `DEPARTMENT_ADMIN`, `SUPER_ADMIN`.
- Maps use OSM tiles; geocoding uses Nominatim from the browser (`connect-src` in `next.config.ts`).
- AI design: [docs/AI.md](docs/AI.md).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Prisma generate + production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run test:all` | All local test scripts |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed departments |
| `npm run db:studio` | Prisma Studio |
| `npm run verify:secrets` | Fail if secret env files are tracked |
