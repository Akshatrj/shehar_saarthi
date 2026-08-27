import { revalidatePath } from "next/cache";
import { API_ERROR_CODES } from "@/lib/api/errors";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireCitizenPortalApi } from "@/lib/auth/require";
import {
  ComplaintServiceError,
  cancelCitizenComplaint,
  getCitizenComplaint,
} from "@/domains/complaints/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const gate = await requireCitizenPortalApi();
  if ("response" in gate) {
    return gate.response;
  }

  const { id } = await context.params;
  const complaint = await getCitizenComplaint(gate.user, id);
  if (!complaint) {
    return jsonError(
      API_ERROR_CODES.NOT_FOUND,
      "Complaint not found.",
      404,
    );
  }

  return jsonOk({ complaint });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const gate = await requireCitizenPortalApi();
  if ("response" in gate) {
    return gate.response;
  }

  const { id } = await context.params;

  try {
    await cancelCitizenComplaint(gate.user, id);
    revalidatePath("/citizen");
    revalidatePath(`/citizen/complaints/${id}`);
    revalidatePath("/admin/complaints");
    revalidatePath("/department-admin");
    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof ComplaintServiceError) {
      const code =
        error.code in API_ERROR_CODES
          ? (error.code as (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES])
          : API_ERROR_CODES.VALIDATION_ERROR;
      return jsonError(code, error.message, error.status);
    }
    console.error("complaint cancel failed", error);
    return jsonError(
      API_ERROR_CODES.SERVICE_UNAVAILABLE,
      "Could not cancel this complaint. Please try again.",
      500,
    );
  }
}
