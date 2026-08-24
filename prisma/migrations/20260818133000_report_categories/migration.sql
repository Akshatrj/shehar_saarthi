-- Add citizen report categories used by the Report an Issue workflow.

ALTER TYPE "ComplaintCategory" ADD VALUE IF NOT EXISTS 'POTHOLE';
ALTER TYPE "ComplaintCategory" ADD VALUE IF NOT EXISTS 'ILLEGAL_DUMPING';
