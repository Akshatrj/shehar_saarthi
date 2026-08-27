export type AiPriority = "P1" | "P2" | "P3" | "P4";

export type EvidenceConsistency =
  | "CONSISTENT"
  | "POTENTIAL_MISMATCH"
  | "NEEDS_REVIEW"
  | "INCONCLUSIVE";

export type PrioritySource = "AI" | "ADMIN_OVERRIDE" | "MANUAL_DEFAULT";

export type CivicContextSummary = {
  available: boolean;
  score: number | null;
  summary: string;
  sourceTitle: string | null;
  sourceDate: string | null;
  sourceDomain: string | null;
  relevance: number | null;
  checkedAt: string | null;
};

export type HistoricalTrendSummary = {
  similarComplaintsLast30Days: number;
  similarComplaintsPrevious30Days: number;
  trendPercentage: number | null;
  unresolvedRelatedCount: number;
  recurringProblem: boolean;
  historicalTrendScore: number | null;
  summary: string;
};

export type ComplaintAnalysisInput = {
  complaintId: string;
  imageUrl: string;
  description: string;
  citizenCategory: string | null;
  latitude: number;
  longitude: number;
  locationLabel: string | null;
};

export type GeminiRawAnalysis = {
  category: string;
  categoryConfidence: number;
  description: string;
  evidenceConsistency: EvidenceConsistency;
  evidenceConfidence: number;
  evidenceReason: string;
  safetyRiskScore: number;
  publicImpactScore: number;
  urgencyScore: number;
  essentialServiceImpactScore: number;
  infrastructureSeverityScore: number;
  healthEnvironmentalRiskScore: number;
  civicImpactScore: number;
  priorityReason: string;
  classificationReason: string;
  serviceType: string;
  recommendedDepartment: string;
  recommendedAction: string;
};

export type ClassificationAnalysisResult = {
  available: true;
  provider: "GEMINI";
  model: string;
  requestId: string;
  category: string;
  categoryConfidence: number;
  description: string;
  evidenceConsistency: EvidenceConsistency;
  evidenceConfidence: number;
  evidenceReason: string;
  priority: AiPriority;
  priorityScore: number;
  civicImpactScore: number;
  safetyRiskScore: number;
  publicImpactScore: number;
  urgencyScore: number;
  essentialServiceImpactScore: number;
  infrastructureSeverityScore: number;
  healthEnvironmentalRiskScore: number;
  historicalTrendScore: number | null;
  currentContextScore: number | null;
  recurringProblem: boolean;
  priorityReason: string;
  classificationReason: string;
  serviceType: string;
  recommendedDepartment: string;
  recommendedAction: string;
  requiresManualReview: boolean;
  prioritySource: PrioritySource;
  context: CivicContextSummary;
  timings: {
    preprocessingMs: number;
    contextLookupMs: number;
    inferenceMs: number;
    totalMs: number;
  };
};

export type ClassificationFallbackResult = {
  available: false;
  fallback: "manual";
  requestId: string;
  message: string;
  prioritySource: "MANUAL_DEFAULT";
  requiresManualReview: true;
  timings: {
    preprocessingMs: number;
    contextLookupMs: number;
    inferenceMs: number;
    totalMs: number;
  };
};

export type ClassificationResult =
  | ClassificationAnalysisResult
  | ClassificationFallbackResult;
