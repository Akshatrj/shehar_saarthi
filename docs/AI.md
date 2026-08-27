# Shehar Saarthi — Gemini AI Architecture

Civic complaint flows work without AI. Gemini is an optional server-side enhancement.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/apikey).
3. Optional: tune `GEMINI_MODEL`, `GEMINI_TIMEOUT_MS`, confidence thresholds, and priority weights.

Never expose `GEMINI_API_KEY` to the browser (`NEXT_PUBLIC_*`).

## Flow

1. Citizen submits complaint → saved to Neon + image in Vercel Blob.
2. Client fires `POST /api/classify` asynchronously (non-blocking).
3. Server optimizes image once, loads bounded historical aggregates + cached civic context.
4. One Gemini multimodal request returns structured JSON.
5. Server validates, computes priority, persists `Complaint` AI fields + `AiClassificationLog`.

If Gemini fails or times out: manual category selection; `prioritySource = MANUAL_DEFAULT`.

## Image optimization

- Original blob URL is unchanged (official evidence).
- Server fetches, validates MIME/size, resizes/compresses only when needed.
- Single optimized buffer is sent to Gemini.

## Evidence consistency

States: `CONSISTENT`, `POTENTIAL_MISMATCH`, `NEEDS_REVIEW`, `INCONCLUSIVE`.  
AI never auto-rejects complaints.

## Monitoring

Super admins: `/admin/ai` — request logs, priority distribution, review flags.

Department admins: AI insights on complaint detail (priority, evidence, recommended action).

## Tests

```bash
npm run test:gemini
npm run test:phase4
```

Tests use mocked parsing/priority logic; no live Gemini calls in CI.
