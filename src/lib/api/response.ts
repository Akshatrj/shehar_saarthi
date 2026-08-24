import { NextResponse } from "next/server";
import type { ApiErrorCode, ApiSuccessBody } from "@/lib/api/errors";

export function jsonOk<T>(data: T, status = 200) {
  const body: ApiSuccessBody<T> = { data };
  return NextResponse.json(body, { status });
}

export function jsonError(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json({ code, message }, { status });
}
