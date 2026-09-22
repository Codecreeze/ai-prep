import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import pLimit from "p-limit";
import { runPipeline } from "../src/server/pipeline/orchestrator";

type Case = { id: string; jd: string; company_url: string; days: number };
type KitResult =
  | { id: string; status: "ok"; kit: unknown; error: null }
  | { id: string; status: "failed"; kit: null; error: { code: string; message: string } };

// Bounded concurrency: keeps 5-cases-in-15-minutes achievable without overwhelming
// the LLM/free-tier rate limit (which withRetry backoff already absorbs per-call,
// but running all 5 fully in parallel would still spike request volume unnecessarily).
const CONCURRENCY = 2;

function parseArgs(argv: string[]): { input: string; output: string } {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const input = get("--input");
  const output = get("--output");
  if (!input || !output) {
    throw new Error("Usage: npm run evaluate -- --input <cases.json> --output <kits.json>");
  }
  return { input, output };
}

function errorCodeFor(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/SSRF_BLOCKED|UNRESOLVABLE_HOST|INVALID_URL/.test(message)) return "COMPANY_UNREACHABLE";
  if (/LLM_NOT_CONFIGURED/.test(message)) return "LLM_NOT_CONFIGURED";
  if (/INVALID_KIT/.test(message)) return "INVALID_KIT_GENERATED";
  if (/429|rate.?limit|quota/i.test(message)) return "LLM_RATE_LIMITED";
  return "UNKNOWN_ERROR";
}

async function runCase(c: Case): Promise<KitResult> {
  try {
    const kit = await runPipeline({ jd: c.jd, companyUrl: c.company_url, days: c.days });
    return { id: c.id, status: "ok", kit, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { id: c.id, status: "failed", kit: null, error: { code: errorCodeFor(err), message } };
  }
}

async function main() {
  const { input, output } = parseArgs(process.argv.slice(2));
  const cases: Case[] = JSON.parse(await readFile(input, "utf-8"));

  const limit = pLimit(CONCURRENCY);
  // Runs every case regardless of earlier failures — one bad case must not abort the run.
  const results = await Promise.all(cases.map((c) => limit(() => runCase(c))));

  const output_ = { version: "1.0", generated_at: new Date().toISOString(), kits: results };
  await writeFile(output, JSON.stringify(output_, null, 2), "utf-8");

  const okCount = results.filter((r) => r.status === "ok").length;
  console.log(`Wrote ${results.length} kit(s) to ${output} (${okCount} ok, ${results.length - okCount} failed)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
