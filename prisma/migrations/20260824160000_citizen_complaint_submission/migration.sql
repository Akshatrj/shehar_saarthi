-- Phase 3: citizen complaint submission fields

ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "aiCategory" "ComplaintCategory";
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "aiDescription" TEXT;

ALTER TABLE "complaints" ALTER COLUMN "category" DROP NOT NULL;

UPDATE "complaints"
SET "latitude" = 0, "longitude" = 0
WHERE "latitude" IS NULL OR "longitude" IS NULL;

UPDATE "complaints"
SET "imageUrl" = COALESCE("imageUrl", "imageStorageKey", '')
WHERE "imageUrl" IS NULL;

DELETE FROM "complaints" WHERE "imageUrl" IS NULL OR "imageUrl" = '';

ALTER TABLE "complaints" DROP COLUMN IF EXISTS "imageStorageKey";

ALTER TABLE "complaints" ALTER COLUMN "latitude" SET NOT NULL;
ALTER TABLE "complaints" ALTER COLUMN "longitude" SET NOT NULL;
ALTER TABLE "complaints" ALTER COLUMN "imageUrl" SET NOT NULL;

ALTER TABLE "complaint_history" ADD COLUMN IF NOT EXISTS "action" VARCHAR(32);

UPDATE "complaint_history"
SET "action" = 'STATUS_CHANGED'
WHERE "action" IS NULL;

ALTER TABLE "complaint_history" ALTER COLUMN "action" SET NOT NULL;
