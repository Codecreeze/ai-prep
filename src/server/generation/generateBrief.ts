import { z } from "zod";
import { generateJSON, withUntrustedContent } from "../llm/client";
import type { CrawledPage } from "../crawler/crawlCompanySite";
import type { DiscussionSnippet } from "../search/searchPublicDiscussion";

const BriefSchema = z.object({ summary: z.string(), what_they_do: z.string() });

const PROMPT = `You write a short, honest company brief for someone preparing for an
interview there.

Rules:
- Base the brief ONLY on the provided content. If the content is thin or empty, say so
  plainly in the summary (e.g. "Limited public information was found about this
  company") rather than inventing detail. A fabricated brief is worse than an honest,
  short one.
- "what_they_do" is 1-3 sentences on the company's product/business.
- "summary" additionally covers hiring/interview-process info if it was found in the
  content, and public discussion of interviews if provided.

Return JSON: { "summary": string, "what_they_do": string }`;

/**
 * Generates the company_brief section from crawled pages + any public discussion
 * found. Honest-by-construction: the prompt explicitly forbids inventing content when
 * input is thin, per the brief's edge-case requirement (no hiring page / no discussion
 * found -> an honest brief, not fabrication).
 */
export async function generateBrief(
  companyPages: CrawledPage[],
  discussion: DiscussionSnippet[]
): Promise<{ summary: string; what_they_do: string; sources: string[] }> {
  const pageText = companyPages.length
    ? companyPages.map((p) => `--- ${p.url} ---\n${p.text.slice(0, 3000)}`).join("\n\n")
    : "(no company pages could be retrieved)";
  const discussionText = discussion.length
    ? discussion.map((d) => `- ${d.title}: ${d.snippet}`).join("\n")
    : "(no public discussion of the interview process was found)";

  const prompt = withUntrustedContent(PROMPT, `COMPANY PAGES:\n${pageText}\n\nPUBLIC DISCUSSION:\n${discussionText}`);
  const brief = await generateJSON(prompt, (raw) => BriefSchema.parse(JSON.parse(raw)));

  return { ...brief, sources: companyPages.map((p) => p.url) };
}
