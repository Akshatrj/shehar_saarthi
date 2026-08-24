import { API_ERROR_CODES } from "@/lib/api/errors";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireCitizenPortalApi } from "@/lib/auth/require";
import { validateClassifyImageUrl } from "@/domains/ai/access";
import { classifyComplaintImage, ClassificationProviderError } from "@/domains/ai/huggingface";
import {
  getCitizenComplaintByImageUrl,
  saveComplaintAiSuggestion,
} from "@/domains/complaints/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClassifyResponse = {
  available: boolean;
  category: string | null;
  description: string | null;
  complaintId?: string;
  message?: string;
};

export async function POST(request: Request) {
  const gate = await requireCitizenPortalApi();
  if ("response" in gate) {
    return gate.response;
  }

  let body: { imageUrl?: unknown };
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

  try {
    const result = await classifyComplaintImage(imageUrl);

    await saveComplaintAiSuggestion(gate.user.id, complaint.id, {
      aiCategory: result.category,
      aiDescription: result.description,
    });

    const payload: ClassifyResponse = {
      available: true,
      category: result.category,
      description: result.description,
      complaintId: complaint.id,
    };
    return jsonOk(payload);
  } catch (error) {
    if (error instanceof ClassificationProviderError) {
      const payload: ClassifyResponse = {
        available: false,
        category: null,
        description: null,
        complaintId: complaint.id,
        message:
          "Automatic classification is temporarily unavailable. You can choose a category manually.",
      };
      return jsonOk(payload, 200);
    }

    console.error("classify route failed", error);
    const payload: ClassifyResponse = {
      available: false,
      category: null,
      description: null,
      complaintId: complaint.id,
      message:
        "Automatic classification is temporarily unavailable. You can choose a category manually.",
    };
    return jsonOk(payload, 200);
  }
}
