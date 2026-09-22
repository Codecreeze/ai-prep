import { NextResponse } from "next/server";

// Matches the error shape documented in docs/API_SPEC.md — every endpoint returns
// this same envelope so the frontend has one error-handling path, not one per route.
export function apiError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}
