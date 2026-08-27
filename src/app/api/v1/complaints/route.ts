import { API_ERROR_CODES } from "@/lib/api/errors";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireCitizenPortalApi } from "@/lib/auth/require";
import {
  ComplaintServiceError,
  createCitizenComplaint,
  listCitizenComplaints,
} from "@/domains/complaints/service";
import { ComplaintValidationError } from "@/domains/complaints/validation";
import { BlobStorageError } from "@/domains/storage/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validationResponse(error: ComplaintValidationError) {
  return jsonError(API_ERROR_CODES.VALIDATION_ERROR, error.message, 400);
}

export async function GET() {
  const gate = await requireCitizenPortalApi();
  if ("response" in gate) {
    return gate.response;
  }

  const complaints = await listCitizenComplaints(gate.user);
  return jsonOk({ complaints });
}

export async function POST(request: Request) {
  const gate = await requireCitizenPortalApi();
  if ("response" in gate) {
    return gate.response;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "Invalid form submission.",
      400,
    );
  }

  const photo = formData.get("photo");
  const category = formData.get("category");
  const description = formData.get("description");
  const latitude = formData.get("latitude");
  const longitude = formData.get("longitude");
  const phone = formData.get("phone");

  try {
    const complaint = await createCitizenComplaint(gate.user, {
      photo: photo instanceof File ? photo : new File([], ""),
      category,
      description,
      latitude,
      longitude,
      phone,
    });
    return jsonOk({ complaint }, 201);
  } catch (error) {
    if (error instanceof ComplaintValidationError) {
      return validationResponse(error);
    }
    if (error instanceof BlobStorageError) {
      return jsonError(API_ERROR_CODES.SERVICE_UNAVAILABLE, error.message, 503);
    }
  if (error instanceof ComplaintServiceError) {
    const code =
      error.code in API_ERROR_CODES
        ? (error.code as (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES])
        : API_ERROR_CODES.VALIDATION_ERROR;
    return jsonError(code, error.message, error.status);
  }
    console.error("complaint submission failed", error);
    return jsonError(
      API_ERROR_CODES.SERVICE_UNAVAILABLE,
      "Could not submit your complaint. Please try again.",
      500,
    );
  }
}
