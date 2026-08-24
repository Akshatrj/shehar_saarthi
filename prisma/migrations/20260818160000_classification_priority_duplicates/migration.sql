-- Intake classification, explainable priority, and duplicate linking.
-- Citizen reports are never deleted when a possible duplicate is found.

ALTER TABLE "complaints"
  ADD COLUMN IF NOT EXISTS "intakeStage" VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
  ADD COLUMN IF NOT EXISTS "reportCount" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "possibleDuplicate" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "duplicateReview" VARCHAR(16) NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "duplicateDistanceM" INTEGER,
  ADD COLUMN IF NOT EXISTS "duplicateSimilarity" DECIMAL(5,4),
  ADD COLUMN IF NOT EXISTS "priorityScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "priorityReasons" JSONB,
  ADD COLUMN IF NOT EXISTS "classificationReasons" JSONB;

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'DUPLICATE_DETECTED';
