-- Phase 1 foundation schema (replaces legacy tables)

DROP TABLE IF EXISTS "ai_jobs" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "complaint_verifications" CASCADE;
DROP TABLE IF EXISTS "complaint_assignments" CASCADE;
DROP TABLE IF EXISTS "complaint_status_history" CASCADE;
DROP TABLE IF EXISTS "complaint_media" CASCADE;
DROP TABLE IF EXISTS "complaints" CASCADE;
DROP TABLE IF EXISTS "field_workers" CASCADE;
DROP TABLE IF EXISTS "departments" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

DROP TYPE IF EXISTS "VerificationDecision" CASCADE;
DROP TYPE IF EXISTS "NotificationType" CASCADE;
DROP TYPE IF EXISTS "AiVerificationStatus" CASCADE;
DROP TYPE IF EXISTS "ComplaintPriority" CASCADE;
DROP TYPE IF EXISTS "ComplaintCategory" CASCADE;
DROP TYPE IF EXISTS "ComplaintStatus" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;

DROP FUNCTION IF EXISTS protect_user_privileges() CASCADE;
DROP FUNCTION IF EXISTS protect_complaint_ownership() CASCADE;
DROP FUNCTION IF EXISTS app_bypass() CASCADE;
DROP FUNCTION IF EXISTS app_is_admin() CASCADE;
DROP FUNCTION IF EXISTS app_is_citizen() CASCADE;
DROP FUNCTION IF EXISTS app_is_field_worker() CASCADE;
DROP FUNCTION IF EXISTS app_user_id() CASCADE;
DROP FUNCTION IF EXISTS app_field_worker_id() CASCADE;

CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'STAFF', 'SUPER_ADMIN');

CREATE TYPE "ComplaintStatus" AS ENUM (
  'SUBMITTED',
  'ROUTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CLOSED'
);

CREATE TYPE "ComplaintCategory" AS ENUM (
  'POTHOLE',
  'DAMAGED_ROAD',
  'GARBAGE',
  'BLOCKED_DRAIN',
  'BROKEN_STREETLIGHT',
  'WATER_LEAKAGE',
  'FALLEN_TREE',
  'DAMAGED_FOOTPATH',
  'OTHER'
);

CREATE TABLE "departments" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");
CREATE UNIQUE INDEX "departments_slug_key" ON "departments"("slug");

CREATE TABLE "users" (
  "id" UUID NOT NULL,
  "role" "UserRole" NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "image" TEXT,
  "departmentId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_departmentId_idx" ON "users"("departmentId");

CREATE TABLE "complaints" (
  "id" UUID NOT NULL,
  "publicRef" VARCHAR(32) NOT NULL,
  "citizenId" UUID NOT NULL,
  "departmentId" UUID,
  "assignedWorkerId" UUID,
  "category" "ComplaintCategory" NOT NULL,
  "description" TEXT NOT NULL,
  "locationLabel" VARCHAR(500),
  "latitude" DECIMAL(9,6),
  "longitude" DECIMAL(9,6),
  "imageStorageKey" TEXT,
  "status" "ComplaintStatus" NOT NULL DEFAULT 'SUBMITTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "complaints_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "complaints_latitude_range" CHECK ("latitude" IS NULL OR ("latitude" >= -90 AND "latitude" <= 90)),
  CONSTRAINT "complaints_longitude_range" CHECK ("longitude" IS NULL OR ("longitude" >= -180 AND "longitude" <= 180))
);

CREATE UNIQUE INDEX "complaints_publicRef_key" ON "complaints"("publicRef");
CREATE INDEX "complaints_departmentId_status_idx" ON "complaints"("departmentId", "status");
CREATE INDEX "complaints_assignedWorkerId_idx" ON "complaints"("assignedWorkerId");
CREATE INDEX "complaints_citizenId_idx" ON "complaints"("citizenId");
CREATE INDEX "complaints_createdAt_idx" ON "complaints"("createdAt");

CREATE TABLE "complaint_history" (
  "id" UUID NOT NULL,
  "complaintId" UUID NOT NULL,
  "actorId" UUID,
  "fromStatus" "ComplaintStatus",
  "toStatus" "ComplaintStatus" NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "complaint_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "complaint_history_complaintId_createdAt_idx" ON "complaint_history"("complaintId", "createdAt");

ALTER TABLE "users"
  ADD CONSTRAINT "users_departmentId_fkey"
  FOREIGN KEY ("departmentId") REFERENCES "departments"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "complaints"
  ADD CONSTRAINT "complaints_citizenId_fkey"
  FOREIGN KEY ("citizenId") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "complaints"
  ADD CONSTRAINT "complaints_departmentId_fkey"
  FOREIGN KEY ("departmentId") REFERENCES "departments"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "complaints"
  ADD CONSTRAINT "complaints_assignedWorkerId_fkey"
  FOREIGN KEY ("assignedWorkerId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "complaint_history"
  ADD CONSTRAINT "complaint_history_complaintId_fkey"
  FOREIGN KEY ("complaintId") REFERENCES "complaints"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "complaint_history"
  ADD CONSTRAINT "complaint_history_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
