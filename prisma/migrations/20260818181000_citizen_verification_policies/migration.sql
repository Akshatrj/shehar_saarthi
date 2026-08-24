-- Citizen verification: owners may confirm or reopen only from AWAITING_CITIZEN_VERIFICATION.
-- Applied after security_hardening so the looser citizen UPDATE policy is not left in place.
-- History stays insert-only. Previous resolution rows and media are never deleted.

DROP POLICY IF EXISTS complaints_update ON "complaints";

CREATE POLICY complaints_update ON "complaints" FOR UPDATE
USING (
  app_bypass()
  OR app_is_admin()
  OR (app_is_field_worker() AND "assignedWorkerId" = app_field_worker_id())
  OR (
    app_is_citizen()
    AND "citizenId" = app_user_id()
    AND status = 'AWAITING_CITIZEN_VERIFICATION'
  )
)
WITH CHECK (
  app_bypass()
  OR app_is_admin()
  OR (app_is_field_worker() AND "assignedWorkerId" = app_field_worker_id())
  OR (
    app_is_citizen()
    AND "citizenId" = app_user_id()
    AND status IN ('CLOSED', 'REOPENED')
  )
);

DROP POLICY IF EXISTS history_insert ON "complaint_status_history";

CREATE POLICY history_insert ON "complaint_status_history" FOR INSERT WITH CHECK (
  app_bypass()
  OR app_is_admin()
  OR (
    app_is_citizen()
    AND "actorId" = app_user_id()
    AND "toStatus" IN ('CLOSED', 'REOPENED')
    AND EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = "complaintId" AND c."citizenId" = app_user_id()
    )
  )
  OR (
    app_is_field_worker()
    AND EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = "complaintId" AND c."assignedWorkerId" = app_field_worker_id()
    )
  )
);

DROP POLICY IF EXISTS verifications_insert ON "complaint_verifications";

CREATE POLICY verifications_insert ON "complaint_verifications" FOR INSERT WITH CHECK (
  app_bypass()
  OR app_is_admin()
  OR (
    app_is_citizen()
    AND "citizenId" = app_user_id()
    AND EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = "complaintId"
        AND c."citizenId" = app_user_id()
        AND c.status = 'AWAITING_CITIZEN_VERIFICATION'
    )
  )
);
