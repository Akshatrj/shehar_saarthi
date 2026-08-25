import { prisma } from "@/lib/db";
import type { ComplaintCategory } from "@/domains/complaints/types";
import type { ClassificationAnalysisResult } from "@/domains/ai/types";
import { ComplaintServiceError } from "@/domains/complaints/service";

export async function saveComplaintAiAnalysis(
  citizenId: string,
  complaintId: string,
  analysis: ClassificationAnalysisResult,
) {
  const owned = await prisma.complaint.findFirst({
    where: { id: complaintId, citizenId },
    select: { id: true, aiRequestId: true },
  });
  if (!owned) {
    throw new ComplaintServiceError("Complaint not found.", 404, "NOT_FOUND");
  }

  if (owned.aiRequestId === analysis.requestId) {
    return;
  }

  const dbStart = Date.now();

  await prisma.$transaction(async (tx) => {
    await tx.complaint.update({
      where: { id: complaintId },
      data: {
        aiCategory: analysis.category as ComplaintCategory,
        aiDescription: analysis.description,
        aiCategoryConfidence: analysis.categoryConfidence,
        evidenceConsistency: analysis.evidenceConsistency,
        evidenceConfidence: analysis.evidenceConfidence,
        evidenceReason: analysis.evidenceReason,
        aiPriority: analysis.priority,
        priorityScore: analysis.priorityScore,
        civicImpactScore: analysis.civicImpactScore,
        requiresManualReview: analysis.requiresManualReview,
        prioritySource: analysis.prioritySource,
        recommendedDepartmentName: analysis.recommendedDepartment,
        recommendedAction: analysis.recommendedAction,
        aiRequestId: analysis.requestId,
        historicalTrendScore: analysis.historicalTrendScore,
        currentContextScore: analysis.currentContextScore,
        recurringProblem: analysis.recurringProblem,
        priorityReason: analysis.priorityReason,
      },
    });

    await tx.aiClassificationLog.create({
      data: {
        complaintId,
        requestId: analysis.requestId,
        provider: analysis.provider,
        model: analysis.model,
        status: "SUCCESS",
        category: analysis.category as ComplaintCategory,
        categoryConfidence: analysis.categoryConfidence,
        description: analysis.description,
        evidenceConsistency: analysis.evidenceConsistency,
        evidenceConfidence: analysis.evidenceConfidence,
        evidenceReason: analysis.evidenceReason,
        priority: analysis.priority,
        priorityScore: analysis.priorityScore,
        civicImpactScore: analysis.civicImpactScore,
        safetyRiskScore: analysis.safetyRiskScore,
        publicImpactScore: analysis.publicImpactScore,
        urgencyScore: analysis.urgencyScore,
        essentialServiceImpactScore: analysis.essentialServiceImpactScore,
        infrastructureSeverityScore: analysis.infrastructureSeverityScore,
        healthEnvironmentalRiskScore: analysis.healthEnvironmentalRiskScore,
        historicalTrendScore: analysis.historicalTrendScore,
        currentContextScore: analysis.currentContextScore,
        recurringProblem: analysis.recurringProblem,
        priorityReason: analysis.priorityReason,
        recommendedDepartment: analysis.recommendedDepartment,
        recommendedAction: analysis.recommendedAction,
        requiresManualReview: analysis.requiresManualReview,
        prioritySource: analysis.prioritySource,
        contextSourceTitle: analysis.context.sourceTitle,
        contextSourceDate: analysis.context.sourceDate,
        contextSourceDomain: analysis.context.sourceDomain,
        contextRelevance: analysis.context.relevance,
        contextCheckedAt: analysis.context.checkedAt
          ? new Date(analysis.context.checkedAt)
          : null,
        preprocessingMs: analysis.timings.preprocessingMs,
        contextLookupMs: analysis.timings.contextLookupMs,
        inferenceMs: analysis.timings.inferenceMs,
        databaseMs: Date.now() - dbStart,
        totalMs: analysis.timings.totalMs,
      },
    });
  });

  return Date.now() - dbStart;
}

export async function logAiFallback(
  citizenId: string,
  complaintId: string,
  input: {
    requestId: string;
    message: string;
    model: string;
    timings: {
      preprocessingMs: number;
      contextLookupMs: number;
      inferenceMs: number;
      totalMs: number;
    };
  },
) {
  const owned = await prisma.complaint.findFirst({
    where: { id: complaintId, citizenId },
    select: { id: true, aiRequestId: true },
  });
  if (!owned || owned.aiRequestId === input.requestId) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.complaint.update({
      where: { id: complaintId },
      data: {
        requiresManualReview: true,
        prioritySource: "MANUAL_DEFAULT",
        aiRequestId: input.requestId,
      },
    });

    await tx.aiClassificationLog.create({
      data: {
        complaintId,
        requestId: input.requestId,
        provider: "GEMINI",
        model: input.model,
        status: "MANUAL_FALLBACK",
        requiresManualReview: true,
        prioritySource: "MANUAL_DEFAULT",
        preprocessingMs: input.timings.preprocessingMs,
        contextLookupMs: input.timings.contextLookupMs,
        inferenceMs: input.timings.inferenceMs,
        totalMs: input.timings.totalMs,
        errorMessage: input.message,
      },
    });
  });
}

// Backward-compatible helper
export async function saveComplaintAiSuggestion(
  citizenId: string,
  complaintId: string,
  input: { aiCategory: ComplaintCategory; aiDescription: string },
) {
  await prisma.complaint.updateMany({
    where: { id: complaintId, citizenId },
    data: {
      aiCategory: input.aiCategory,
      aiDescription: input.aiDescription,
    },
  });
}
