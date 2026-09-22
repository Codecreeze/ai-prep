import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/server/auth/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieOptions.name, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
