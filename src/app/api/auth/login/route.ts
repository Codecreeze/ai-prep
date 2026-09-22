import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/server/persistence/db";
import { User } from "@/server/persistence/models/User";
import { verifyPassword } from "@/server/auth/password";
import { signSession, sessionCookieOptions } from "@/server/auth/session";
import { apiError } from "@/server/http/apiError";

const BodySchema = z.object({ email: z.string().email(), password: z.string() });

export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Email and password required");

  await connectDb();
  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  // Same error for "no such user" and "wrong password" — doesn't leak which emails are registered.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return apiError(401, "INVALID_CREDENTIALS", "Incorrect email or password");
  }

  const token = signSession({ userId: user._id.toString(), email: user.email });
  const res = NextResponse.json({ user: { id: user._id.toString(), email: user.email } });
  res.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
  return res;
}
