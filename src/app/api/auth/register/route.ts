import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/server/persistence/db";
import { User } from "@/server/persistence/models/User";
import { hashPassword } from "@/server/auth/password";
import { signSession, sessionCookieOptions } from "@/server/auth/session";
import { apiError } from "@/server/http/apiError";

const BodySchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Valid email and password (min 8 chars) required");

  await connectDb();
  const { email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) return apiError(409, "EMAIL_TAKEN", "An account with this email already exists");

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, passwordHash });

  const token = signSession({ userId: user._id.toString(), email: user.email });
  const res = NextResponse.json({ user: { id: user._id.toString(), email: user.email } }, { status: 201 });
  res.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
  return res;
}
