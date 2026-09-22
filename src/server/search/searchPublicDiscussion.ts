export type DiscussionSnippet = { title: string; url: string; snippet: string };

// Provider-abstracted so the search backend (Tavily free tier here) can be swapped
// without touching pipeline code — mirrors the same pattern as the LLM client.
async function searchViaTavily(query: string): Promise<DiscussionSnippet[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, query, max_results: 5 }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return [];

  const data = (await res.json()) as { results?: { title: string; url: string; content: string }[] };
  return (data.results ?? []).map((r) => ({ title: r.title, url: r.url, snippet: r.content.slice(0, 500) }));
}

/**
 * Best-effort search for public discussion of a company's interview process.
 * Never throws — an unconfigured provider or a failed search both resolve to an
 * empty array, which the pipeline treats honestly as "nothing found" rather than
 * fabricating discussion content, per the brief's edge-case handling.
 */
export async function searchPublicDiscussion(companyName: string): Promise<DiscussionSnippet[]> {
  const query = `${companyName} interview process questions experience`;
  try {
    return await searchViaTavily(query);
  } catch {
    return [];
  }
}
