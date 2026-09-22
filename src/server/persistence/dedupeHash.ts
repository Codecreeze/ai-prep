import { createHash } from "node:crypto";

// Detects "same JD + same company submitted twice" (a brief-listed edge case) so we
// can return the existing kit instead of burning LLM quota regenerating an identical one.
export function computeDedupeHash(jd: string, companyUrl: string): string {
  const normalized = `${jd.trim().toLowerCase()}::${companyUrl.trim().toLowerCase()}`;
  return createHash("sha256").update(normalized).digest("hex");
}
