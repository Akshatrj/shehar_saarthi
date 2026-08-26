import { NextResponse } from "next/server";
import { handlers } from "@/lib/auth";

export const runtime = "nodejs";

async function handle(
  method: "GET" | "POST",
  request: Request,
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

export const GET = (request: Request) => handle("GET", request);
export const POST = (request: Request) => handle("POST", request);
