-- SheharSaarthi initial schema + row-level security
-- Applied by Prisma migrate. FORCE RLS so even the table owner must pass policies
-- unless app.bypass_rls is set for migrations.

CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'ADMIN', 'FIELD_WORKER');
CREATE TYPE "ComplaintStatus" AS ENUM (
  'SUBMITTED',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'AWAITING_CITIZEN_VERIFICATION',
  'CLOSED',
  'REOPENED'
);
CREATE TYPE "ComplaintPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "ComplaintCategory" AS ENUM (
  'ROADS',
  'STREET_LIGHTS',
  'GARBAGE',
  'DRAINAGE',
  'WATER',
  'PUBLIC_INFRASTRUCTURE',
  'OTHER'
);
CREATE TYPE "AiVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'NEEDS_REVIEW');
CREATE TYPE "NotificationType" AS ENUM (
  'STATUS_CHANGED',
  'ASSIGNED',
  'RESOLVED',
  'REOPENED',
  'VERIFICATION_REQUESTED'
);
CREATE TYPE "VerificationDecision" AS ENUM ('CONFIRMED', 'REOPENED');

CREATE TABLE "users" (
  "id" UUID NOT NULL,
  "role" "UserRole" NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "departments" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "departments_slug_key" ON "departments"("slug");

CREATE TABLE "field_workers" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "departmentId" UUID NOT NULL,
  "employeeCode" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "field_workers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "field_workers_userId_key" ON "field_workers"("userId");
CREATE UNIQUE INDEX "field_workers_employeeCode_key" ON "field_workers"("employeeCode");
CREATE INDEX "field_workers_departmentId_idx" ON "field_workers"("departmentId");

CREATE TABLE "complaints" (
  "id" UUID NOT NULL,
  "publicRef" VARCHAR(32) NOT NULL,
  "citizenId" UUID NOT NULL,
  "departmentId" UUID,
  "assignedWorkerId" UUID,
  "category" "ComplaintCategory" NOT NULL,
  "description" TEXT NOT NULL,
  "location" VARCHAR(500),
  "latitude" DECIMAL(9,6) NOT NULL,
  "longitude" DECIMAL(9,6) NOT NULL,
  "status" "ComplaintStatus" NOT NULL DEFAULT 'SUBMITTED',
  "priority" "ComplaintPriority" NOT NULL DEFAULT 'MEDIUM',
  "aiVerificationStatus" "AiVerificationStatus" NOT NULL DEFAULT 'PENDING',
  "aiClassification" "ComplaintCategory",
  "aiPriority" "ComplaintPriority",
  "aiConfidence" DECIMAL(5,4),
  "duplicateOfId" UUID,
  "reopenReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "resolvedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  CONSTRAINT "complaints_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "complaints_latitude_range" CHECK ("latitude" >= -90 AND "latitude" <= 90),
  CONSTRAINT "complaints_longitude_range" CHECK ("longitude" >= -180 AND "longitude" <= 180)
);

CREATE UNIQUE INDEX "complaints_publicRef_key" ON "complaints"("publicRef");
CREATE INDEX "complaints_status_idx" ON "complaints"("status");
CREATE INDEX "complaints_category_idx" ON "complaints"("category");
CREATE INDEX "complaints_createdAt_idx" ON "complaints"("createdAt");
CREATE INDEX "complaints_departmentId_status_idx" ON "complaints"("departmentId", "status");
CREATE INDEX "complaints_citizenId_createdAt_idx" ON "complaints"("citizenId", "createdAt");
CREATE INDEX "complaints_assignedWorkerId_status_idx" ON "complaints"("assignedWorkerId", "status");
CREATE INDEX "complaints_latitude_longitude_idx" ON "complaints"("latitude", "longitude");

CREATE TABLE "complaint_media" (
  "id" UUID NOT NULL,
  "complaintId" UUID NOT NULL,
  "storageKey" TEXT NOT NULL,
  "mimeType" VARCHAR(64) NOT NULL,
  "byteSize" INTEGER NOT NULL,
  "checksumSha256" TEXT,
  "uploadedById" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "complaint_media_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "complaint_media_size" CHECK ("byteSize" > 0 AND "byteSize" <= 8388608),
  CONSTRAINT "complaint_media_mime" CHECK ("mimeType" IN ('image/jpeg', 'image/png', 'image/webp'))
);

CREATE INDEX "complaint_media_complaintId_idx" ON "complaint_media"("complaintId");

CREATE TABLE "complaint_status_history" (
  "id" UUID NOT NULL,
  "complaintId" UUID NOT NULL,
  "actorId" UUID,
  "fromStatus" "ComplaintStatus",
  "toStatus" "ComplaintStatus" NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "complaint_status_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "complaint_status_history_complaintId_createdAt_idx" ON "complaint_status_history"("complaintId", "createdAt");

CREATE TABLE "complaint_assignments" (
  "id" UUID NOT NULL,
  "complaintId" UUID NOT NULL,
  "departmentId" UUID,
  "fieldWorkerId" UUID,
  "assignedById" UUID NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "complaint_assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "complaint_assignments_complaintId_createdAt_idx" ON "complaint_assignments"("complaintId", "createdAt");
CREATE INDEX "complaint_assignments_fieldWorkerId_idx" ON "complaint_assignments"("fieldWorkerId");

CREATE TABLE "complaint_verifications" (
  "id" UUID NOT NULL,
  "complaintId" UUID NOT NULL,
  "citizenId" UUID NOT NULL,
  "decision" "VerificationDecision" NOT NULL,
  "reopenReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "complaint_verifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "complaint_verifications_reopen" CHECK (
    "decision" <> 'REOPENED' OR ("reopenReason" IS NOT NULL AND length(btrim("reopenReason")) > 0)
  )
);

CREATE INDEX "complaint_verifications_complaintId_createdAt_idx" ON "complaint_verifications"("complaintId", "createdAt");
CREATE INDEX "complaint_verifications_citizenId_idx" ON "complaint_verifications"("citizenId");

CREATE TABLE "notifications" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "complaintId" UUID,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");
CREATE INDEX "notifications_complaintId_idx" ON "notifications"("complaintId");

CREATE TABLE "ai_jobs" (
  "id" UUID NOT NULL,
  "complaintId" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "payload" JSONB,
  "result" JSONB,
  "error" TEXT,
  "actorId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "ai_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_jobs_status_createdAt_idx" ON "ai_jobs"("status", "createdAt");
CREATE INDEX "ai_jobs_complaintId_idx" ON "ai_jobs"("complaintId");

ALTER TABLE "field_workers" ADD CONSTRAINT "field_workers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "field_workers" ADD CONSTRAINT "field_workers_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assignedWorkerId_fkey" FOREIGN KEY ("assignedWorkerId") REFERENCES "field_workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_duplicateOfId_fkey" FOREIGN KEY ("duplicateOfId") REFERENCES "complaints"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "complaint_media" ADD CONSTRAINT "complaint_media_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "complaint_media" ADD CONSTRAINT "complaint_media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "complaint_status_history" ADD CONSTRAINT "complaint_status_history_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "complaint_status_history" ADD CONSTRAINT "complaint_status_history_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "complaint_assignments" ADD CONSTRAINT "complaint_assignments_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "complaint_assignments" ADD CONSTRAINT "complaint_assignments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "complaint_assignments" ADD CONSTRAINT "complaint_assignments_fieldWorkerId_fkey" FOREIGN KEY ("fieldWorkerId") REFERENCES "field_workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "complaint_assignments" ADD CONSTRAINT "complaint_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "complaint_verifications" ADD CONSTRAINT "complaint_verifications_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "complaint_verifications" ADD CONSTRAINT "complaint_verifications_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE VIEW analytics_complaint_counts AS
SELECT
  "status",
  "category",
  "departmentId",
  "priority",
  COUNT(*)::bigint AS "count",
  AVG(EXTRACT(EPOCH FROM (COALESCE("resolvedAt", NOW()) - "createdAt")) / 3600.0) AS "avg_hours_open"
FROM "complaints"
GROUP BY "status", "category", "departmentId", "priority";

CREATE OR REPLACE FUNCTION app_is_admin() RETURNS boolean AS $$
  SELECT current_setting('app.role', true) = 'ADMIN'
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app_is_citizen() RETURNS boolean AS $$
  SELECT current_setting('app.role', true) = 'CITIZEN'
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app_is_field_worker() RETURNS boolean AS $$
  SELECT current_setting('app.role', true) = 'FIELD_WORKER'
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app_user_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app_field_worker_id() RETURNS uuid AS $$
  SELECT fw.id FROM field_workers fw WHERE fw."userId" = app_user_id() AND fw."isActive" = true LIMIT 1
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app_bypass() RETURNS boolean AS $$
  SELECT current_setting('app.bypass_rls', true) = 'on'
$$ LANGUAGE sql STABLE;

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "complaints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "complaints" FORCE ROW LEVEL SECURITY;
ALTER TABLE "complaint_media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "complaint_media" FORCE ROW LEVEL SECURITY;
ALTER TABLE "complaint_status_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "complaint_status_history" FORCE ROW LEVEL SECURITY;
ALTER TABLE "complaint_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "complaint_assignments" FORCE ROW LEVEL SECURITY;
ALTER TABLE "complaint_verifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "complaint_verifications" FORCE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" FORCE ROW LEVEL SECURITY;
ALTER TABLE "field_workers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "field_workers" FORCE ROW LEVEL SECURITY;
ALTER TABLE "ai_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_jobs" FORCE ROW LEVEL SECURITY;
ALTER TABLE "departments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "departments" FORCE ROW LEVEL SECURITY;

CREATE POLICY users_select ON "users" FOR SELECT USING (
  app_bypass() OR app_is_admin() OR id = app_user_id()
);
CREATE POLICY users_update_self ON "users" FOR UPDATE USING (
  app_bypass() OR app_is_admin() OR id = app_user_id()
);
CREATE POLICY users_insert ON "users" FOR INSERT WITH CHECK (
  app_bypass() OR app_is_admin() OR (app_is_citizen() AND role = 'CITIZEN' AND id = app_user_id())
);

CREATE POLICY complaints_select ON "complaints" FOR SELECT USING (
  app_bypass()
  OR app_is_admin()
  OR (app_is_citizen() AND "citizenId" = app_user_id())
  OR (app_is_field_worker() AND "assignedWorkerId" = app_field_worker_id())
);
CREATE POLICY complaints_insert ON "complaints" FOR INSERT WITH CHECK (
  app_bypass()
  OR app_is_admin()
  OR (app_is_citizen() AND "citizenId" = app_user_id())
);
CREATE POLICY complaints_update ON "complaints" FOR UPDATE USING (
  app_bypass()
  OR app_is_admin()
  OR (app_is_citizen() AND "citizenId" = app_user_id())
  OR (app_is_field_worker() AND "assignedWorkerId" = app_field_worker_id())
);

CREATE POLICY media_select ON "complaint_media" FOR SELECT USING (
  app_bypass()
  OR app_is_admin()
  OR EXISTS (
    SELECT 1 FROM complaints c
    WHERE c.id = "complaintId"
      AND (
        (app_is_citizen() AND c."citizenId" = app_user_id())
        OR (app_is_field_worker() AND c."assignedWorkerId" = app_field_worker_id())
      )
  )
);
CREATE POLICY media_insert ON "complaint_media" FOR INSERT WITH CHECK (
  app_bypass()
  OR app_is_admin()
  OR (
    app_is_citizen()
    AND "uploadedById" = app_user_id()
    AND EXISTS (SELECT 1 FROM complaints c WHERE c.id = "complaintId" AND c."citizenId" = app_user_id())
  )
);

CREATE POLICY history_select ON "complaint_status_history" FOR SELECT USING (
  app_bypass()
  OR app_is_admin()
  OR EXISTS (
    SELECT 1 FROM complaints c
    WHERE c.id = "complaintId"
      AND (
        (app_is_citizen() AND c."citizenId" = app_user_id())
        OR (app_is_field_worker() AND c."assignedWorkerId" = app_field_worker_id())
      )
  )
);
CREATE POLICY history_insert ON "complaint_status_history" FOR INSERT WITH CHECK (
  app_bypass()
  OR app_is_admin()
  OR (app_is_citizen() AND EXISTS (SELECT 1 FROM complaints c WHERE c.id = "complaintId" AND c."citizenId" = app_user_id()))
  OR (app_is_field_worker() AND EXISTS (SELECT 1 FROM complaints c WHERE c.id = "complaintId" AND c."assignedWorkerId" = app_field_worker_id()))
);

CREATE POLICY assignments_select ON "complaint_assignments" FOR SELECT USING (
  app_bypass()
  OR app_is_admin()
  OR (app_is_field_worker() AND "fieldWorkerId" = app_field_worker_id())
);
CREATE POLICY assignments_insert ON "complaint_assignments" FOR INSERT WITH CHECK (
  app_bypass() OR app_is_admin()
);

CREATE POLICY verifications_select ON "complaint_verifications" FOR SELECT USING (
  app_bypass()
  OR app_is_admin()
  OR (app_is_citizen() AND "citizenId" = app_user_id())
);
CREATE POLICY verifications_insert ON "complaint_verifications" FOR INSERT WITH CHECK (
  app_bypass()
  OR app_is_admin()
  OR (app_is_citizen() AND "citizenId" = app_user_id())
);

CREATE POLICY notifications_select ON "notifications" FOR SELECT USING (
  app_bypass() OR app_is_admin() OR "userId" = app_user_id()
);
CREATE POLICY notifications_update ON "notifications" FOR UPDATE USING (
  app_bypass() OR "userId" = app_user_id()
);
CREATE POLICY notifications_insert ON "notifications" FOR INSERT WITH CHECK (
  app_bypass() OR app_is_admin()
);

CREATE POLICY field_workers_select ON "field_workers" FOR SELECT USING (
  app_bypass() OR app_is_admin() OR "userId" = app_user_id()
);

CREATE POLICY ai_jobs_select ON "ai_jobs" FOR SELECT USING (
  app_bypass() OR app_is_admin()
);
CREATE POLICY ai_jobs_write ON "ai_jobs" FOR ALL USING (
  app_bypass() OR app_is_admin()
);

CREATE POLICY departments_select ON "departments" FOR SELECT USING (true);
CREATE POLICY departments_write ON "departments" FOR ALL USING (
  app_bypass() OR app_is_admin()
);
