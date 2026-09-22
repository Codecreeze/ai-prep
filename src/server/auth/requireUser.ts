import { getCurrentUser } from "./getCurrentUser";
import { apiError } from "../http/apiError";
import type { SessionPayload } from "./session";

// Shared "protected route" guard — every kit/practice API route starts with this
// instead of duplicating the cookie-check + 401 response in each file.
export async function requireUser(): Promise<{ user: SessionPayload } | { error: Response }> {
  const user = await getCurrentUser();
  if (!user) return { error: apiError(401, "UNAUTHORIZED", "Sign in required") };
  return { user };
}
