import { NextResponse, type NextRequest } from "next/server";
import { handlers } from "@/lib/auth";

export const runtime = "nodejs";

async function handle(
  method: "GET" | "POST",
  request: NextRequest,
): Promise<Response> {
  try {
    return await handlers[method](request);
  } catch (error) {
    console.error("[auth] API route failed", error);
    if (method === "GET") {
      return NextResponse.json(null);
    }
    return NextResponse.json(
      { message: "Authentication is temporarily unavailable." },
      { status: 500 },
    );
  }
}

export const GET = (request: NextRequest) => handle("GET", request);
export const POST = (request: NextRequest) => handle("POST", request);
