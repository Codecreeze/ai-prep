# Research & Generation Pipeline Design

This is the part the brief says it cares about most. This doc details the sequencing,
what's deterministic vs LLM-driven, and the coverage-loop stop condition.

## 1. Pipeline Steps (in order)

| # | Step | LLM? | Input | Output |
|---|------|------|-------|--------|
| 1 | `extractRequirements(jd)` | Yes | raw JD text | `Requirement[]` with stable ids, `kind` (technical/behavioural/domain), `priority` (must/nice) |
| 2 | `crawlCompanySite(companyUrl)` | No (heuristic ranking) | company URL | ranked list of candidate URLs (homepage, about, careers/jobs/hiring/handbook/blog-guess) |
| 3 | `fetchAndClean(url)` × N | No | candidate URL | cleaned text (nav/footer/script stripped), or skip+log if unreachable |
| 4 | `findHiringInfo(pages)` | Yes (light) | cleaned company pages | which page(s), if any, describe the hiring/interview process; may be "none found" |
| 5 | `searchPublicDiscussion(companyName)` | No (search API) then Yes (summarize) | company name | snippets of public interview-process discussion, or "none found" |
| 6 | `generateBrief(companyPages, hiringInfo, discussion)` | Yes | steps 3-5 outputs | `company_brief` object |
| 7 | `generateQuestions(requirement, category)` per (requirement × relevant categories) | Yes, separate call per pairing | one requirement + one category | `Question[]` for that pairing, each referencing the requirement id |
| 8 | `generateFlashcards(questions)` | Yes | question bank | `Flashcard[]`, each referencing requirement ids |
| 9 | `checkCoverage(requirements, questions)` | **No — deterministic** | requirements + questions | `uncovered_requirement_ids` (requirements, esp. `must`, with zero referencing question) |
| 10 | Second pass: `generateQuestions` for each uncovered requirement | Yes | gap requirement | new questions, merged in |
| 11 | Repeat 9-10 up to `MAX_PASSES` | — | — | stop when `uncovered_requirement_ids` empty OR pass limit hit |
| 12 | `buildSchedule(requirements, questions, days)` | **No — deterministic** | requirements+questions+days | `schedule` object, exactly `days` entries |
| 13 | `validateKit(kit)` | No | assembled kit | Zod-validated final object or structured error |

## 2. Why Requirement × Category Are Separate LLM Calls

The brief explicitly calls this out: "a requirement like five years of React leads to
technical questions while mentoring junior engineers leads to behavioural ones; the two
should not come from the same call with the same instructions." Each call therefore:
- Takes exactly one requirement + one target category as input.
- Uses a category-specific prompt template (technical vs behavioural vs system-design
  vs company-fit have materially different instructions/examples).
- Is skipped for nonsensical pairings (e.g. don't force a system-design question out of
  a requirement like "familiarity with Jira").

A lightweight router decides, per requirement, which categories are worth generating
for (based on `requirement.kind` and free-text heuristics), rather than blindly doing
the full cross-product — this keeps LLM call volume bounded, which matters for the
free-tier token/minute limit.

## 3. Coverage Check — Deterministic, Not the Model's Call

```ts
function checkCoverage(requirements: Requirement[], questions: Question[]) {
  const covered = new Set(questions.flatMap(q => q.requirement_ids));
  const uncovered = requirements
    .filter(r => r.priority === "must")   // nice-to-haves don't block coverage
    .filter(r => !covered.has(r.id))
    .map(r => r.id);
  return uncovered;
}
```
Pure function, unit-tested directly. This is exactly the kind of arithmetic/lookup the
brief says must not be handed to the model.

## 4. Second-Pass Stop Condition

`MAX_PASSES = 2` (configurable). After pass 1: check coverage → if gaps, run pass 2
targeted only at gap requirements → check coverage again. If still gaps after
`MAX_PASSES`, **stop and report honestly**: `coverage.uncovered_requirement_ids` is
populated in the final kit rather than silently dropped or infinitely retried. Two
passes is chosen because: pass 1 covers the obvious case, pass 2 handles the model
skipping/misformatting a requirement first time; a requirement still uncovered after a
second, requirement-targeted attempt is more likely a genuinely unanswerable/odd
requirement (e.g. a vague or contradictory JD line) than a fixable prompt issue —
further retries burn free-tier quota for diminishing return. Documented in README.

## 5. Deterministic Scheduling

```ts
function buildSchedule(requirements: Requirement[], questions: Question[], days: number) {
  // 1. Weight each question: priority (must>nice) desc, then difficulty desc.
  // 2. Sort descending by weight -> hardest/highest-priority first.
  // 3. Bucket into `days` buckets round-robin/greedy by estimated minutes-per-day budget,
  //    front-loading heavier material into earlier days.
  // 4. Guarantee: every `must` requirement's question(s) appear in some day.
  // 5. minutes per day entry = sum of constituent question estimated minutes (integer).
}
```
Edge cases:
- `days = 1`: everything must-have compressed into day 1; nice-to-haves dropped or
  appended if time budget allows — documented trade-off.
- `days = 60`: material spread thin with review/buffer days; avoid empty-content days
  by clustering topics with spaced review rather than literally 1 question/day.

## 6. Honesty Over Fabrication

- Thin JD (few extractable requirements) → `role.requirements` is short; pipeline does
  **not** pad it with invented requirements. `company_brief.summary` for an
  under-researched company states plainly that little public information was found,
  rather than inventing detail.
- `source.pages_used` and a companion skip-log record exactly what was and wasn't
  retrieved, so gaps are visible/auditable, not hidden.

## 7. Rate-Limit & Retry Strategy

- All LLM/search calls go through `llm/withRetry(fn, {maxRetries, baseDelayMs})` —
  exponential backoff + jitter, specifically catching 429/rate-limit responses and
  respecting a `Retry-After` header when present.
- A token-bucket limiter caps outbound LLM calls/minute to stay under the provider's
  free-tier ceiling, queuing rather than bursting.
- Batch mode bounds concurrency (e.g. `p-limit(2)` across cases) so 5 parallel cases
  don't multiply rate-limit pressure past what backoff can absorb inside the 15-minute
  budget.
