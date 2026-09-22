import { cookies } from "next/headers";
import { sessionCookieOptions, verifySession, type SessionPayload } from "./session";

/** Reads and verifies the session cookie for the current request. Null if signed out or expired. */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieOptions.name)?.value;
  if (!token) return null;
  return verifySession(token);
}
