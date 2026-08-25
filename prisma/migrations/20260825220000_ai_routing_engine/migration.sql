-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ROADS', 'STREET_LIGHTING', 'SANITATION', 'WATER', 'DRAINAGE', 'PARKS', 'OTHER');

-- CreateEnum
CREATE TYPE "RoutingStatus" AS ENUM ('UNASSIGNED', 'AI_ANALYZED', 'ROUTING_RECOMMENDED', 'AUTO_ASSIGNED', 'MANUALLY_ASSIGNED');

-- AlterEnum: add new complaint categories
ALTER TYPE "ComplaintCategory" ADD VALUE IF NOT EXISTS 'ROAD_OBSTRUCTION';
ALTER TYPE "ComplaintCategory" ADD VALUE IF NOT EXISTS 'FLICKERING_STREETLIGHT';
ALTER TYPE "ComplaintCategory" ADD VALUE IF NOT EXISTS 'DARK_AREA';
ALTER TYPE "ComplaintCategory" ADD VALUE IF NOT EXISTS 'OVERFLOWING_DUSTBIN';
ALTER TYPE "ComplaintCategory" ADD VALUE IF NOT EXISTS 'ILLEGAL_DUMPING';
ALTER TYPE "ComplaintCategory" ADD VALUE IF NOT EXISTS 'NO_WATER_SUPPLY';
ALTER TYPE "ComplaintCategory" ADD VALUE IF NOT EXISTS 'CONTAMINATED_WATER';
ALTER TYPE "ComplaintCategory" ADD VALUE IF NOT EXISTS 'OVERFLOWING_DRAIN';
ALTER TYPE "ComplaintCategory" ADD VALUE IF NOT EXISTS 'DAMAGED_DRAIN';

-- AlterTable departments
ALTER TABLE "departments"
  ADD COLUMN IF NOT EXISTS "description" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(9,6),
  ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(9,6),
  ADD COLUMN IF NOT EXISTS "jurisdictionRadiusKm" DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS "workloadScore" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "supportedCategories" "ComplaintCategory"[] NOT NULL DEFAULT ARRAY[]::"ComplaintCategory"[],
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable complaints
ALTER TABLE "complaints"
  ADD COLUMN IF NOT EXISTS "recommendedDepartmentId" UUID,
  ADD COLUMN IF NOT EXISTS "recommendedDistanceKm" DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS "routingReason" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "routingConfidence" DECIMAL(4,3),
  ADD COLUMN IF NOT EXISTS "rankedRecommendations" JSONB,
  ADD COLUMN IF NOT EXISTS "routingStatus" "RoutingStatus" NOT NULL DEFAULT 'UNASSIGNED',
  ADD COLUMN IF NOT EXISTS "serviceType" "ServiceType",
  ADD COLUMN IF NOT EXISTS "aiClassificationReason" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "routedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "routedById" UUID,
  ADD COLUMN IF NOT EXISTS "manualAssignmentReason" VARCHAR(500);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "complaints_recommendedDepartmentId_idx" ON "complaints"("recommendedDepartmentId");
CREATE INDEX IF NOT EXISTS "complaints_routingStatus_idx" ON "complaints"("routingStatus");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "complaints" ADD CONSTRAINT "complaints_recommendedDepartmentId_fkey"
    FOREIGN KEY ("recommendedDepartmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "complaints" ADD CONSTRAINT "complaints_routedById_fkey"
    FOREIGN KEY ("routedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
