-- Optional contact phone captured on full complaint submit only.

ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "contactPhone" VARCHAR(20);
