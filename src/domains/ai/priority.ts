import type { AiPriority } from "@/domains/ai/types";
import {
  getAiConfidenceThreshold,
  getEvidenceReviewThreshold,
  getPriorityThresholds,
  getPriorityWeights,
} from "@/domains/ai/config";

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function clampConfidence(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(3))));
}

export function priorityFromScore(score: number): AiPriority {
  const thresholds = getPriorityThresholds();
  if (score >= thresholds.p1) return "P1";
  if (score >= thresholds.p2) return "P2";
  if (score >= thresholds.p3) return "P3";
  return "P4";
}

export function calculatePriorityScore(input: {
  safetyRiskScore: number;
  publicImpactScore: number;
  urgencyScore: number;
  infrastructureSeverityScore: number;
  civicImpactScore: number;
  historicalTrendScore: number | null;
  currentContextScore: number | null;
  recurringProblem: boolean;
}) {
  const weights = getPriorityWeights();
  const currentEvidence = clampScore(
    (input.infrastructureSeverityScore + input.civicImpactScore) / 2,
  );
  const safetyUrgency = clampScore((input.safetyRiskScore + input.urgencyScore) / 2);
  const trend = input.historicalTrendScore ?? 0;
  const context = input.currentContextScore ?? 0;
  const recurring = input.recurringProblem ? 75 : 20;

  const score =
    currentEvidence * weights.current +
    safetyUrgency * weights.safety +
    input.publicImpactScore * weights.impact +
    trend * weights.trend +
    recurring * weights.recurring +
    context * weights.context;

  return clampScore(score);
}

export function requiresManualReview(input: {
  categoryConfidence: number;
  evidenceConfidence: number;
  evidenceConsistency: string;
}) {
  const categoryThreshold = getAiConfidenceThreshold();
  const evidenceThreshold = getEvidenceReviewThreshold();

  if (input.categoryConfidence < categoryThreshold) return true;
  if (input.evidenceConfidence < evidenceThreshold) return true;
  if (input.evidenceConsistency === "POTENTIAL_MISMATCH") return true;
  if (input.evidenceConsistency === "NEEDS_REVIEW") return true;
  return false;
}
