-- Category → department routing uses stable department IDs.
-- Department name/code remain mutable metadata.

CREATE TABLE "category_routes" (
    "category" "ComplaintCategory" NOT NULL,
    "departmentId" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_routes_pkey" PRIMARY KEY ("category")
);

CREATE INDEX "category_routes_departmentId_idx" ON "category_routes"("departmentId");

ALTER TABLE "category_routes"
  ADD CONSTRAINT "category_routes_departmentId_fkey"
  FOREIGN KEY ("departmentId") REFERENCES "departments"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "category_routes" ("category", "departmentId", "updatedAt")
SELECT DISTINCT ON (mapped.cat)
  mapped.cat,
  mapped.id,
  CURRENT_TIMESTAMP
FROM (
  SELECT
    d.id,
    d."createdAt",
    c.cat
  FROM "departments" d
  CROSS JOIN LATERAL unnest(d."supportedCategories") AS c(cat)
  WHERE d."isActive" = true
    AND cardinality(d."supportedCategories") > 0
) AS mapped
ORDER BY mapped.cat, mapped."createdAt" ASC
ON CONFLICT DO NOTHING;
