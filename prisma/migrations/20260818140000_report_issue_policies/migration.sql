-- Citizens may enqueue PENDING AI jobs for their own new reports.
-- Citizens may write an in-app notice to themselves after submit.

DROP POLICY IF EXISTS ai_jobs_write ON "ai_jobs";

CREATE POLICY ai_jobs_insert ON "ai_jobs" FOR INSERT WITH CHECK (
  app_bypass()
  OR app_is_admin()
  OR (
    app_is_citizen()
    AND status = 'PENDING'
    AND EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = "complaintId" AND c."citizenId" = app_user_id()
    )
  )
);

CREATE POLICY ai_jobs_update ON "ai_jobs" FOR UPDATE USING (
  app_bypass() OR app_is_admin()
);

CREATE POLICY ai_jobs_delete ON "ai_jobs" FOR DELETE USING (
  app_bypass() OR app_is_admin()
);

DROP POLICY IF EXISTS notifications_insert ON "notifications";

CREATE POLICY notifications_insert ON "notifications" FOR INSERT WITH CHECK (
  app_bypass()
  OR app_is_admin()
  OR (app_is_citizen() AND "userId" = app_user_id())
);
