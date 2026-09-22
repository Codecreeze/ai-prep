import { z } from "zod";
import { generateJSON, withUntrustedContent } from "../llm/client";
import { makeIdGenerator } from "../generation/ids";
import type { Requirement } from "../validation/kitSchema";

const ExtractedSchema = z.object({
  title: z.string(),
  seniority: z.string(),
  responsibilities: z.array(z.string()),
  requirements: z.array(
    z.object({
      text: z.string(),
      kind: z.enum(["technical", "behavioural", "domain"]),
      priority: z.enum(["must", "nice"]),
    })
  ),
});

const PROMPT = `You extract structured role information from a job description.

Rules:
- Only extract what the text actually states. Do NOT invent requirements, skills, or
  responsibilities that aren't there. A short/thin description should produce a short
  list — that is the correct, honest output, not a failure.
- priority "must" = the posting states it as required/needed. priority "nice" = the
  posting frames it as a bonus/plus/preferred-but-optional. Do not guess; use the
  posting's own wording.
- kind "technical" = a specific skill/tool/technology. "behavioural" = a soft skill,
  leadership, or working-style trait. "domain" = industry/business-domain knowledge.

Return JSON: { "title": string, "seniority": string, "responsibilities": string[],
"requirements": [{ "text": string, "kind": "technical"|"behavioural"|"domain",
"priority": "must"|"nice" }] }`;

/**
 * Extracts role title, seniority, responsibilities, and requirements from a raw JD.
 * Assigns stable ids (r1, r2...) after extraction — the LLM never invents ids itself,
 * so id stability/uniqueness is guaranteed by our code, not the model's discretion.
 */
export async function extractRequirements(
  jd: string
): Promise<{ title: string; seniority: string; responsibilities: string[]; requirements: Requirement[] }> {
  const nextId = makeIdGenerator("r");
  const prompt = withUntrustedContent(PROMPT, jd);

  const extracted = await generateJSON(prompt, (raw) => ExtractedSchema.parse(JSON.parse(raw)));

  return {
    title: extracted.title,
    seniority: extracted.seniority,
    responsibilities: extracted.responsibilities,
    requirements: extracted.requirements.map((r) => ({ id: nextId(), ...r })),
  };
}
