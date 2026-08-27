import type { ComplaintCategory } from "@/domains/complaints/types";
import type { AiPriority, EvidenceConsistency } from "@/domains/ai/types";

export type ComplaintClassifyState = {
  id: string;
  status: string;
  category: ComplaintCategory | null;
  imageUrl: string;
  description: string;
  latitude: { toString(): string };
  longitude: { toString(): string };
  locationLabel: string | null;
  aiRequestId: string | null;
  aiCategory: ComplaintCategory | null;
  aiDescription: string | null;
  aiCategoryConfidence: { toString(): string } | null;
  evidenceConsistency: EvidenceConsistency | null;
  evidenceConfidence: { toString(): string } | null;
  aiPriority: AiPriority | null;
  priorityScore: number | null;
  civicImpactScore: number | null;
  requiresManualReview: boolean;
};

export function hasCompletedAiAnalysis(complaint: ComplaintClassifyState) {
  return Boolean(complaint.aiRequestId && complaint.aiCategory);
}

export function hasAiAttempt(complaint: ComplaintClassifyState) {
  return Boolean(complaint.aiRequestId);
}
