# SheharSaarthi

Your City. Your Voice. Your Change.

Civic issue reporting platform. See [ARCHITECTURE.md](ARCHITECTURE.md), [SCHEMA.md](SCHEMA.md), [SECURITY_AUDIT.md](SECURITY_AUDIT.md), and [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) before changing structure or deploying.

## Prerequisites

- Node.js 20+
- npm 10+
- A Vercel account (app + Neon Postgres + Blob)

On Windows PowerShell, use `npx.cmd` rather than `npx`.

## Setup

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

`vercel integration add neon` and `vercel blob store add` may open a browser the first time so you can accept Marketplace terms.

Open http://localhost:3000

Local `npm run dev` talks to the same Neon database Vercel uses. Evidence photos stay in `./storage` until `BLOB_READ_WRITE_TOKEN` is present.

## Demo accounts (local development only)

| Portal | Email | Password |
|--------|-------|----------|
| Citizen `/login` | `citizen@sheharsaarthi.local` | `citizen` |
| Admin `/admin/login` | `admin@sheharsaarthi.local` | `admin` |
| Field worker `/staff-login` | `worker@sheharsaarthi.local` | `worker` |

These credentials work only when `FOUNDATION_AUTH=true` **and** `NODE_ENV` is not `production`. They are ignored on Vercel production and preview runtimes. Register a real citizen account there.

## Production on Vercel

1. Link the Git repository in the Vercel dashboard (or `npx.cmd vercel --prod` after `vercel link`).
2. Confirm Neon and Blob are connected to **Production**, **Preview**, and **Development**.
3. Set `AUTH_SECRET` (≥32 characters) and `AUTH_URL` to the public HTTPS origin.
4. Leave `FOUNDATION_AUTH` unset or `false`.
5. Keep AI keys on the server only. Do not add `NEXT_PUBLIC_*` for models or maps.
6. Apply migrations once against Neon: `npm run db:migrate`
7. Seed departments (and optional demo users for local only): `npm run db:seed`

Production must use a PostgreSQL role **without** `BYPASSRLS`. Neon’s default owner role can bypass RLS; create a restricted app role before a municipal go-live.

Rate limits are in-memory per serverless instance. Put a gateway or Redis limiter in front of more than one instance.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed departments |
| `npm run db:studio` | Open Prisma Studio |

## What this repository includes

- Citizen report, track, map, notifications, and YES/NO verification
- Admin queue, assignment, status, maps, analytics, and predictive maintenance
- Field-worker staff portal
- Auth.js sessions, Prisma + PostgreSQL, RLS policies, and versioned `/api/v1` routes
- Server-only AI verification (stub or OpenAI-compatible)
- Leaflet + OpenStreetMap maps (no browser map key)
