-- Distinct in-app event types, plus field-worker insert so staff can notify the citizen.
-- ADD VALUE is committed before application code uses the new labels.

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WORK_STARTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CLOSED';

DROP POLICY IF EXISTS notifications_insert ON "notifications";

CREATE POLICY notifications_insert ON "notifications" FOR INSERT WITH CHECK (
  app_bypass()
  OR app_is_admin()
  OR (app_is_citizen() AND "userId" = app_user_id())
  OR (
    app_is_field_worker()
    AND EXISTS (
      SELECT 1
      FROM complaints c
      WHERE c.id = "complaintId"
        AND c."citizenId" = "userId"
        AND c."assignedWorkerId" = app_field_worker_id()
    )
  )
);
