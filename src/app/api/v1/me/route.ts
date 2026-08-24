import { jsonOk } from "@/lib/api/response";
import { requireAuthApi } from "@/lib/auth/require";

export async function GET() {
  const gate = await requireAuthApi();
  if ("response" in gate) {
    return gate.response;
  }

  const { user } = gate;
  return jsonOk({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    departmentId: user.departmentId,
    isActive: user.isActive,
  });
}
