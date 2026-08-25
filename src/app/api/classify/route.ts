import { API_ERROR_CODES } from "@/lib/api/errors";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireCitizenPortalApi } from "@/lib/auth/require";
import { validateClassifyImageUrl } from "@/domains/ai/access";
import { analyzeComplaint } from "@/domains/ai/classify";
import { getGeminiModel } from "@/domains/ai/config";
import {
  logAiFallback,
  saveComplaintAiAnalysis,
} from "@/domains/complaints/ai-persistence";
import {
  hasAiAttempt,
  hasCompletedAiAnalysis,
} from "@/domains/complaints/classify-cache";
import { getCitizenComplaintByImageUrl } from "@/domains/complaints/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClassifyResponse =
  | {
      available: true;
      provider: "GEMINI";
      model: string;
      category: string;
      categoryConfidence: number;
      description: string;
      evidenceConsistency: string;
      evidenceConfidence: number;
      priority: string;
      priorityScore: number;
      civicImpactScore: number;
      requiresManualReview: boolean;
      complaintId: string;
      requestId: string;
      cached?: boolean;
    }
  | {
      available: false;
      fallback: "manual";
      category: null;
      description: null;
      complaintId?: string;
      requestId?: string;
      message: string;
      cached?: boolean;
    };

export async function POST(request: Request) {
  const gate = await requireCitizenPortalApi();
  if ("response" in gate) {
    return gate.response;
  }

  let body: { imageUrl?: unknown; requestId?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError(API_ERROR_CODES.VALIDATION_ERROR, "Invalid JSON body.", 400);
  }

  let imageUrl: string;
  try {
    imageUrl = validateClassifyImageUrl(body.imageUrl);
  } catch (error) {
    return jsonError(
      API_ERROR_CODES.VALIDATION_ERROR,
      error instanceof Error ? error.message : "Invalid imageUrl.",
      400,
    );
  }

  const complaint = await getCitizenComplaintByImageUrl(gate.user, imageUrl);
  if (!complaint) {
    return jsonError(
      API_ERROR_CODES.NOT_FOUND,
      "No complaint found for this photograph.",
      404,
    );
  }

  if (hasCompletedAiAnalysis(complaint)) {
    return jsonOk({
      available: true,
      provider: "GEMINI",
      model: getGeminiModel(),
      category: complaint.aiCategory!,
      categoryConfidence: complaint.aiCategoryConfidence
        ? Number(complaint.aiCategoryConfidence)
        : 0,
      description: complaint.aiDescription ?? "",
      evidenceConsistency: complaint.evidenceConsistency ?? "INCONCLUSIVE",
      evidenceConfidence: complaint.evidenceConfidence
        ? Number(complaint.evidenceConfidence)
        : 0,
      priority: complaint.aiPriority ?? "P4",
      priorityScore: complaint.priorityScore ?? 0,
      civicImpactScore: complaint.civicImpactScore ?? 0,
      requiresManualReview: complaint.requiresManualReview,
      complaintId: complaint.id,
      requestId: complaint.aiRequestId!,
      cached: true,
    } satisfies ClassifyResponse);
  }

  if (hasAiAttempt(complaint)) {
    return jsonOk({
      available: false,
      fallback: "manual",
      category: null,
      description: null,
      complaintId: complaint.id,
      requestId: complaint.aiRequestId ?? undefined,
      message:
        "AI suggestions are currently unavailable. Please select a category manually.",
      cached: true,
    } satisfies ClassifyResponse);
  }

  const analysis = await analyzeComplaint({
    complaintId: complaint.id,
    imageUrl,
    description: complaint.description,
    citizenCategory: complaint.category,
    latitude: Number(complaint.latitude),
    longitude: Number(complaint.longitude),
    locationLabel: complaint.locationLabel,
  });

  if (!analysis.available) {
    try {
      await logAiFallback(gate.user.id, complaint.id, {
        requestId: analysis.requestId,
        message: analysis.message,
        model: getGeminiModel(),
        timings: analysis.timings,
      });
    } catch (error) {
      console.error("ai fallback log failed", { requestId: analysis.requestId, error });
    }

    return jsonOk({
      available: false,
      fallback: "manual",
      category: null,
      description: null,
      complaintId: complaint.id,
      requestId: analysis.requestId,
      message: analysis.message,
    } satisfies ClassifyResponse);
  }

  try {
    await saveComplaintAiAnalysis(gate.user.id, complaint.id, analysis);
  } catch (error) {
    console.error("ai persistence failed", { requestId: analysis.requestId, error });
  }

  return jsonOk({
    available: true,
    provider: "GEMINI",
    model: analysis.model,
    category: analysis.category,
    categoryConfidence: analysis.categoryConfidence,
    description: analysis.description,
    evidenceConsistency: analysis.evidenceConsistency,
    evidenceConfidence: analysis.evidenceConfidence,
    priority: analysis.priority,
    priorityScore: analysis.priorityScore,
    civicImpactScore: analysis.civicImpactScore,
    requiresManualReview: analysis.requiresManualReview,
    complaintId: complaint.id,
    requestId: analysis.requestId,
  } satisfies ClassifyResponse);
}
