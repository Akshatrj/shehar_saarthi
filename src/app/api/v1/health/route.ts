import { jsonOk } from "@/lib/api/response";

export function GET() {
  return jsonOk({
    service: "sheharsaarthi",
    status: "ok",
  });
}
