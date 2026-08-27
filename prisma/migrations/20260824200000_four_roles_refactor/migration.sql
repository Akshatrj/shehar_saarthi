-- Four-role refactor: STAFF -> WORKER + DEPARTMENT_ADMIN, slug -> code, history field renames

-- Department: slug -> code, drop updatedAt
ALTER TABLE "departments" RENAME COLUMN "slug" TO "code";
ALTER TABLE "departments" DROP COLUMN IF EXISTS "updatedAt";

-- ComplaintHistory: rename status/note columns
ALTER TABLE "complaint_history" RENAME COLUMN "fromStatus" TO "oldStatus";
ALTER TABLE "complaint_history" RENAME COLUMN "toStatus" TO "newStatus";
ALTER TABLE "complaint_history" RENAME COLUMN "note" TO "metadata";

-- UserRole enum: replace STAFF with WORKER, add DEPARTMENT_ADMIN
CREATE TYPE "UserRole_new" AS ENUM ('CITIZEN', 'WORKER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN');

ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING (
  CASE "role"::text
    WHEN 'STAFF' THEN 'WORKER'::"UserRole_new"
    WHEN 'CITIZEN' THEN 'CITIZEN'::"UserRole_new"
    WHEN 'SUPER_ADMIN' THEN 'SUPER_ADMIN'::"UserRole_new"
    ELSE 'CITIZEN'::"UserRole_new"
  END
);

DROP TYPE "UserRole";

ALTER TYPE "UserRole_new" RENAME TO "UserRole";
