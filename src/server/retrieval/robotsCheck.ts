import { assertUrlIsSafe } from "./urlValidator";

type RobotsRules = { disallow: string[] };

// robots.txt is served as text/plain, so this bypasses fetchPage's html-only content-type
// gate with its own minimal, permissive fetch rather than loosening that gate for every caller.
async function fetchRobotsTxt(url: string): Promise<string | null> {
  try {
    const safeUrl = await assertUrlIsSafe(url);
    const res = await fetch(safeUrl, { headers: { "User-Agent": "ai-interview-prep-kit-bot/1.0" } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// Simple robots.txt parser scoped to the generic "*" user-agent group — enough to
// respect the brief's "respect robots.txt" requirement without a full RFC 9309 parser.
function parseRobots(text: string): RobotsRules {
  const lines = text.split("\n").map((l) => l.trim());
  const disallow: string[] = [];
  let inWildcardGroup = false;
  for (const line of lines) {
    if (/^user-agent:\s*\*/i.test(line)) inWildcardGroup = true;
    else if (/^user-agent:/i.test(line)) inWildcardGroup = false;
    else if (inWildcardGroup && /^disallow:/i.test(line)) {
      const path = line.split(":").slice(1).join(":").trim();
      if (path) disallow.push(path);
    }
  }
  return { disallow };
}

/** Returns true if `path` is allowed to be crawled per the site's robots.txt. */
export async function isAllowedByRobots(origin: string, path: string): Promise<boolean> {
  const text = await fetchRobotsTxt(new URL("/robots.txt", origin).toString());
  if (text === null) return true; // no robots.txt / unreachable => nothing to obey, default allow
  const rules = parseRobots(text);
  return !rules.disallow.some((rule) => path.startsWith(rule));
}
