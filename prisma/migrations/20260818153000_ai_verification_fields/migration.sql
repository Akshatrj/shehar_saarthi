-- Persist AI verification outcome on the complaint (citizen-safe reason + model + timestamp).
-- Enum values stay PENDING / VERIFIED / REJECTED / NEEDS_REVIEW (AI_PENDING, AI_VERIFIED, AI_REJECTED, AI_REVIEW_REQUIRED).

ALTER TABLE "complaints"
  ADD COLUMN IF NOT EXISTS "aiReason" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "aiModel" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "aiVerifiedAt" TIMESTAMP(3);
