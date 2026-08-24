-- Ownership and privilege guards. These triggers still run for the table owner.
-- Production DATABASE_URL must not be a PostgreSQL superuser (superusers bypass RLS).

CREATE OR REPLACE FUNCTION protect_user_privileges() RETURNS trigger AS $$
BEGIN
  IF current_setting('app.bypass_rls', true) = 'on' THEN
    RETURN NEW;
  END IF;
  IF current_setting('app.role', true) = 'ADMIN' THEN
    RETURN NEW;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'role cannot be changed';
  END IF;
  IF NEW."passwordHash" IS DISTINCT FROM OLD."passwordHash" THEN
    RAISE EXCEPTION 'password cannot be changed here';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_protect_privileges ON "users";
CREATE TRIGGER users_protect_privileges
  BEFORE UPDATE ON "users"
  FOR EACH ROW
  EXECUTE FUNCTION protect_user_privileges();

CREATE OR REPLACE FUNCTION protect_complaint_ownership() RETURNS trigger AS $$
BEGIN
  IF current_setting('app.bypass_rls', true) = 'on' THEN
    RETURN NEW;
  END IF;
  IF current_setting('app.role', true) = 'ADMIN' THEN
    RETURN NEW;
  END IF;
  IF NEW."citizenId" IS DISTINCT FROM OLD."citizenId" THEN
    RAISE EXCEPTION 'complaint owner cannot be changed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS complaints_protect_ownership ON "complaints";
CREATE TRIGGER complaints_protect_ownership
  BEFORE UPDATE ON "complaints"
  FOR EACH ROW
  EXECUTE FUNCTION protect_complaint_ownership();

DROP POLICY IF EXISTS complaints_update ON "complaints";
CREATE POLICY complaints_update ON "complaints" FOR UPDATE
  USING (
    app_bypass()
    OR app_is_admin()
    OR (app_is_citizen() AND "citizenId" = app_user_id())
    OR (app_is_field_worker() AND "assignedWorkerId" = app_field_worker_id())
  )
  WITH CHECK (
    app_bypass()
    OR app_is_admin()
    OR (app_is_citizen() AND "citizenId" = app_user_id())
    OR (app_is_field_worker() AND "assignedWorkerId" = app_field_worker_id())
  );

DROP POLICY IF EXISTS users_update_self ON "users";
CREATE POLICY users_update_self ON "users" FOR UPDATE
  USING (
    app_bypass() OR app_is_admin() OR id = app_user_id()
  )
  WITH CHECK (
    app_bypass()
    OR app_is_admin()
    OR (id = app_user_id() AND role <> 'ADMIN')
  );
