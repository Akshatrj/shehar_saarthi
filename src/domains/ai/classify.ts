import {
  createClassificationRequestId,
  getGeminiModel,
  isGeminiConfigured,
} from "@/domains/ai/config";
import { getCivicContextSummary } from "@/domains/ai/context";
import { fetchAndOptimizeComplaintImage } from "@/domains/ai/image-optimize";
import {
  analyzeComplaintWithGemini,
  ClassificationProviderError,
  parseGeminiRawOutput,
} from "@/domains/ai/gemini";
import {
  calculatePriorityScore,
  priorityFromScore,
  requiresManualReview,
} from "@/domains/ai/priority";
import { getHistoricalTrendSummary } from "@/domains/ai/trends";
import type {
  ClassificationResult,
  ComplaintAnalysisInput,
} from "@/domains/ai/types";
import { departmentSlugForCategory } from "@/domains/complaints/categories";
import { DEPARTMENT_NAMES } from "@/domains/complaints/categories";
import type { ComplaintCategory } from "@/domains/complaints/types";

export { ClassificationProviderError };

export async function analyzeComplaint(
  input: ComplaintAnalysisInput,
): Promise<ClassificationResult> {
  const started = Date.now();
  const requestId = createClassificationRequestId();
  let preprocessingMs = 0;
  let contextLookupMs = 0;
  let inferenceMs = 0;

  if (!isGeminiConfigured()) {
    return {
      available: false,
      fallback: "manual",
      requestId,
      message:
        "AI suggestions are currently unavailable. Please select a category manually.",
      prioritySource: "MANUAL_DEFAULT",
      requiresManualReview: true,
      timings: {
        preprocessingMs: 0,
        contextLookupMs: 0,
        inferenceMs: 0,
        totalMs: Date.now() - started,
      },
    };
  }

  try {
    const preprocessStart = Date.now();
    const image = await fetchAndOptimizeComplaintImage(input.imageUrl);
    preprocessingMs = Date.now() - preprocessStart;

    const contextStart = Date.now();
    const [trends, context] = await Promise.all([
      getHistoricalTrendSummary({
        category: (input.citizenCategory as ComplaintCategory | null) ?? null,
        latitude: input.latitude,
        longitude: input.longitude,
      }),
      getCivicContextSummary(),
    ]);
    contextLookupMs = Date.now() - contextStart;

    const inferenceStart = Date.now();
    const { raw, model } = await analyzeComplaintWithGemini({
      image,
      description: input.description,
      citizenCategory: input.citizenCategory,
      locationLabel: input.locationLabel,
      latitude: input.latitude,
      longitude: input.longitude,
      trends,
      context,
    });
    inferenceMs = Date.now() - inferenceStart;

    const parsed = parseGeminiRawOutput(raw);
    const category = parsed.category as ComplaintCategory;

    const priorityScore = calculatePriorityScore({
      safetyRiskScore: parsed.safetyRiskScore,
      publicImpactScore: parsed.publicImpactScore,
      urgencyScore: parsed.urgencyScore,
      infrastructureSeverityScore: parsed.infrastructureSeverityScore,
      civicImpactScore: parsed.civicImpactScore,
      historicalTrendScore: trends.historicalTrendScore,
      currentContextScore: context.score,
      recurringProblem: trends.recurringProblem,
    });

    const priority = priorityFromScore(priorityScore);
    const reviewRequired = requiresManualReview({
      categoryConfidence: parsed.categoryConfidence,
      evidenceConfidence: parsed.evidenceConfidence,
      evidenceConsistency: parsed.evidenceConsistency,
    });

    const slug = departmentSlugForCategory(category);
    const mappedDepartment = slug ? DEPARTMENT_NAMES[slug] : null;

    return {
      available: true,
      provider: "GEMINI",
      model: model || getGeminiModel(),
      requestId,
      category,
      categoryConfidence: parsed.categoryConfidence,
      description: parsed.description,
      evidenceConsistency: parsed.evidenceConsistency,
      evidenceConfidence: parsed.evidenceConfidence,
      evidenceReason: parsed.evidenceReason,
      priority,
      priorityScore,
      civicImpactScore: parsed.civicImpactScore,
      safetyRiskScore: parsed.safetyRiskScore,
      publicImpactScore: parsed.publicImpactScore,
      urgencyScore: parsed.urgencyScore,
      essentialServiceImpactScore: parsed.essentialServiceImpactScore,
      infrastructureSeverityScore: parsed.infrastructureSeverityScore,
      healthEnvironmentalRiskScore: parsed.healthEnvironmentalRiskScore,
      historicalTrendScore: trends.historicalTrendScore,
      currentContextScore: context.score,
      recurringProblem: trends.recurringProblem,
      priorityReason: parsed.priorityReason,
      recommendedDepartment: mappedDepartment ?? parsed.recommendedDepartment,
      recommendedAction: parsed.recommendedAction,
      requiresManualReview: reviewRequired,
      prioritySource: "AI",
      context,
      timings: {
        preprocessingMs,
        contextLookupMs,
        inferenceMs,
        totalMs: Date.now() - started,
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      const detail =
        error instanceof ClassificationProviderError
          ? error.message
          : "AI analysis failed.";
      console.warn("gemini classify failed", detail);
    }

    return {
      available: false,
      fallback: "manual",
      requestId,
      message:
        "AI suggestions are currently unavailable. Please select a category manually.",
      prioritySource: "MANUAL_DEFAULT",
      requiresManualReview: true,
      timings: {
        preprocessingMs,
        contextLookupMs,
        inferenceMs,
        totalMs: Date.now() - started,
      },
    };
  }
}

// Legacy alias for tests migrating from Hugging Face naming
export const classifyComplaintImage = async (
  imageUrl: string,
  extras?: Partial<ComplaintAnalysisInput>,
) =>
  analyzeComplaint({
    complaintId: extras?.complaintId ?? "test-complaint",
    imageUrl,
    description: extras?.description ?? "Civic infrastructure issue reported.",
    citizenCategory: extras?.citizenCategory ?? null,
    latitude: extras?.latitude ?? 28.6139,
    longitude: extras?.longitude ?? 77.209,
    locationLabel: extras?.locationLabel ?? null,
  });
