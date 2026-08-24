import { API_ERROR_CODES } from "@/lib/api/errors";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireCitizenPortalApi } from "@/lib/auth/require";
import { getCitizenComplaint } from "@/domains/complaints/service";

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
