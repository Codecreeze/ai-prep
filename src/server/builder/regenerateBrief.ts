import type { Kit } from "../validation/kitSchema";
import { generateBrief } from "../generation/generateBrief";
import { crawlCompanySite } from "../crawler/crawlCompanySite";
import { searchPublicDiscussion } from "../search/searchPublicDiscussion";
import type { KitEditState } from "./editState";

/**
 * Re-runs company research + brief generation from scratch. Caller is responsible
 * for checking editState.brief !== "pinned" before calling this (route layer — see
 * API_SPEC.md's regenerate-brief force-confirmation rule for the "edited" case).
 */
export async function regenerateBrief(kit: Kit, editState: KitEditState): Promise<{ kit: Kit; editState: KitEditState }> {
  const companyName = (() => {
    try {
      return new URL(kit.source.company_url).hostname.replace(/^www\./, "").split(".")[0];
    } catch {
      return kit.source.company;
    }
  })();

  const [crawl, discussion] = await Promise.all([
    crawlCompanySite(kit.source.company_url),
    searchPublicDiscussion(companyName),
  ]);
  const brief = await generateBrief(crawl.pages, discussion);

  return {
    kit: { ...kit, company_brief: brief, source: { ...kit.source, pages_used: crawl.pages.map((p) => p.url) } },
    editState: { ...editState, brief: "generated" },
  };
}
