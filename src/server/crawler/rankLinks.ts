export type CandidateLink = { url: string; text: string };
export type RankedLink = CandidateLink & { score: number };

// Keyword signals, not exact paths — the brief is explicit that a fixed path list
// (e.g. hardcoding "/careers") is not sufficient, since companies bury hiring info
// at /jobs, a handbook, an engineering blog, etc. Scored by how strongly the URL
// path and link text suggest "hiring/interview info" vs "what the company does".
const HIRING_SIGNALS = ["career", "job", "hiring", "hire", "interview", "handbook", "apply", "work-with-us", "join"];
const ABOUT_SIGNALS = ["about", "company", "team", "mission", "who-we-are"];
const BLOG_SIGNALS = ["blog", "engineering", "eng-blog", "life-at"];
const NOISE_SIGNALS = ["privacy", "terms", "cookie", "login", "signin", "cart", "legal", "sitemap"];

function score(link: CandidateLink): number {
  const haystack = `${link.url.toLowerCase()} ${link.text.toLowerCase()}`;
  if (NOISE_SIGNALS.some((s) => haystack.includes(s))) return -100;
  let points = 0;
  for (const s of HIRING_SIGNALS) if (haystack.includes(s)) points += 10;
  for (const s of BLOG_SIGNALS) if (haystack.includes(s)) points += 4;
  for (const s of ABOUT_SIGNALS) if (haystack.includes(s)) points += 3;
  return points;
}

/** Ranks candidate links by how likely they are to contain hiring/company info. Highest first. */
export function rankLinks(links: CandidateLink[]): RankedLink[] {
  return links
    .map((link) => ({ ...link, score: score(link) }))
    .filter((l) => l.score > -100)
    .sort((a, b) => b.score - a.score);
}
