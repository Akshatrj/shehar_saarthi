-- Optional password hash for email/password citizen accounts.
-- Google users keep this null.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
