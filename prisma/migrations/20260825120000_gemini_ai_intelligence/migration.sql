-- CreateEnum
CREATE TYPE "AiPriority" AS ENUM ('P1', 'P2', 'P3', 'P4');

-- CreateEnum
CREATE TYPE "EvidenceConsistency" AS ENUM ('CONSISTENT', 'POTENTIAL_MISMATCH', 'NEEDS_REVIEW', 'INCONCLUSIVE');

-- CreateEnum
CREATE TYPE "PrioritySource" AS ENUM ('AI', 'ADMIN_OVERRIDE', 'MANUAL_DEFAULT');

-- CreateEnum
CREATE TYPE "AiClassificationStatus" AS ENUM ('SUCCESS', 'FAILURE', 'MANUAL_FALLBACK');

-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "aiCategoryConfidence" DECIMAL(4,3),
ADD COLUMN     "evidenceConsistency" "EvidenceConsistency",
ADD COLUMN     "evidenceConfidence" DECIMAL(4,3),
ADD COLUMN     "evidenceReason" TEXT,
ADD COLUMN     "aiPriority" "AiPriority",
ADD COLUMN     "priorityScore" INTEGER,
ADD COLUMN     "civicImpactScore" INTEGER,
ADD COLUMN     "requiresManualReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prioritySource" "PrioritySource",
ADD COLUMN     "recommendedDepartmentName" TEXT,
ADD COLUMN     "recommendedAction" TEXT,
ADD COLUMN     "aiRequestId" VARCHAR(32),
ADD COLUMN     "historicalTrendScore" INTEGER,
ADD COLUMN     "currentContextScore" INTEGER,
ADD COLUMN     "recurringProblem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priorityReason" TEXT;

-- CreateIndex
CREATE INDEX "complaints_aiPriority_idx" ON "complaints"("aiPriority");

-- CreateIndex
CREATE INDEX "complaints_requiresManualReview_idx" ON "complaints"("requiresManualReview");

-- CreateTable
CREATE TABLE "ai_classification_logs" (
    "id" UUID NOT NULL,
    "complaintId" UUID NOT NULL,
    "requestId" VARCHAR(32) NOT NULL,
    "provider" VARCHAR(16) NOT NULL DEFAULT 'GEMINI',
    "model" VARCHAR(128) NOT NULL,
    "status" "AiClassificationStatus" NOT NULL,
    "category" "ComplaintCategory",
    "categoryConfidence" DECIMAL(4,3),
    "description" TEXT,
    "evidenceConsistency" "EvidenceConsistency",
    "evidenceConfidence" DECIMAL(4,3),
    "evidenceReason" TEXT,
    "priority" "AiPriority",
    "priorityScore" INTEGER,
    "civicImpactScore" INTEGER,
    "safetyRiskScore" INTEGER,
    "publicImpactScore" INTEGER,
    "urgencyScore" INTEGER,
    "essentialServiceImpactScore" INTEGER,
    "infrastructureSeverityScore" INTEGER,
    "healthEnvironmentalRiskScore" INTEGER,
    "historicalTrendScore" INTEGER,
    "currentContextScore" INTEGER,
    "recurringProblem" BOOLEAN NOT NULL DEFAULT false,
    "priorityReason" TEXT,
    "recommendedDepartment" TEXT,
    "recommendedAction" TEXT,
    "requiresManualReview" BOOLEAN NOT NULL DEFAULT false,
    "prioritySource" "PrioritySource",
    "contextSourceTitle" TEXT,
    "contextSourceDate" TEXT,
    "contextSourceDomain" TEXT,
    "contextRelevance" INTEGER,
    "contextCheckedAt" TIMESTAMP(3),
    "preprocessingMs" INTEGER,
    "contextLookupMs" INTEGER,
    "inferenceMs" INTEGER,
    "databaseMs" INTEGER,
    "totalMs" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_classification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_classification_logs_requestId_key" ON "ai_classification_logs"("requestId");

-- CreateIndex
CREATE INDEX "ai_classification_logs_complaintId_createdAt_idx" ON "ai_classification_logs"("complaintId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_classification_logs_status_createdAt_idx" ON "ai_classification_logs"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ai_classification_logs_priority_idx" ON "ai_classification_logs"("priority");

-- AddForeignKey
ALTER TABLE "ai_classification_logs" ADD CONSTRAINT "ai_classification_logs_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
