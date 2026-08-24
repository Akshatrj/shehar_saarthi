-- Speeds citizen/admin notification lists ordered by createdAt.
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx"
  ON "notifications" ("userId", "createdAt");
