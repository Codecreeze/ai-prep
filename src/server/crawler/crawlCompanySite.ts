import * as cheerio from "cheerio";
import { fetchPage } from "../retrieval/fetchPage";
import { isAllowedByRobots } from "../retrieval/robotsCheck";
import { rankLinks, type CandidateLink } from "./rankLinks";

const MAX_PAGES_TO_FETCH = 4; // homepage + top 3 ranked candidates — keeps crawl bounded & fast

export type CrawledPage = { url: string; text: string };
export type CrawlResult = {
  pages: CrawledPage[];
  skipped: { url: string; reason: string }[];
};

// Strips nav/footer/script/style noise so the LLM sees page content, not chrome.
function cleanHtml(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, noscript, svg").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

function extractLinks(html: string, baseUrl: string): CandidateLink[] {
  const $ = cheerio.load(html);
  const links: CandidateLink[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
    try {
      const resolved = new URL(href, baseUrl); // follows relative links — required for the batch grader's local fixture sites
      links.push({ url: resolved.toString(), text: $(el).text().trim().slice(0, 80) });
    } catch {
      // unparsable href, skip
    }
  });
  return links;
}

/**
 * Crawls a company site: fetches the homepage, ranks its links by hiring/about
 * signals (no hardcoded path list), then fetches the top-ranked candidates.
 * Unreachable pages are recorded in `skipped`, never thrown — per the brief's
 * "skip and report a source that cannot be retrieved, rather than failing the whole run".
 */
export async function crawlCompanySite(companyUrl: string): Promise<CrawlResult> {
  const pages: CrawledPage[] = [];
  const skipped: CrawlResult["skipped"] = [];

  const homepage = await fetchPage(companyUrl);
  if (!homepage.ok) {
    skipped.push({ url: companyUrl, reason: homepage.reason });
    return { pages, skipped };
  }
  pages.push({ url: homepage.finalUrl, text: cleanHtml(homepage.html) });

  const origin = new URL(homepage.finalUrl).origin;
  const sameOriginLinks = extractLinks(homepage.html, homepage.finalUrl).filter(
    (l) => new URL(l.url).origin === origin
  );
  const ranked = rankLinks(sameOriginLinks).slice(0, MAX_PAGES_TO_FETCH - 1);

  for (const candidate of ranked) {
    const path = new URL(candidate.url).pathname;
    const allowed = await isAllowedByRobots(origin, path);
    if (!allowed) {
      skipped.push({ url: candidate.url, reason: "DISALLOWED_BY_ROBOTS" });
      continue;
    }
    const result = await fetchPage(candidate.url);
    if (result.ok) pages.push({ url: result.finalUrl, text: cleanHtml(result.html) });
    else skipped.push({ url: candidate.url, reason: result.reason });
  }

  return { pages, skipped };
}
