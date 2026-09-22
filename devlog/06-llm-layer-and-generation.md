# 06 — LLM Layer & Generation (Phase 3)

**Files:** `src/server/llm/client.ts`, `src/server/llm/rateLimiter.ts`,
`src/server/llm/withRetry.ts`, `src/server/extraction/extractRequirements.ts`,
`src/server/generation/generateBrief.ts`, `generateQuestions.ts`,
`generateFlashcards.ts`, `categoryRouter.ts`, `ids.ts`

## What
The whole LLM-facing layer: a Gemini client wrapper with rate limiting + retry, and
four generation functions (extract requirements, write the company brief, generate
questions per requirement+category, generate flashcards from the question bank).

## Why
This is where free-tier reliability and prompt-injection safety both live — the brief
warns explicitly that "a pipeline that falls over the first time a provider says
'slow down' is the most common way to lose points here," and that fetched/pasted text
must be treated as data, never instructions.

## How

**`rateLimiter.ts`** — a token-bucket limiter capping outbound calls to N/minute
(configurable via `LLM_REQUESTS_PER_MINUTE`), so the pipeline paces itself proactively
instead of only reacting after a 429.

**`withRetry.ts`** — exponential backoff + jitter wrapping every LLM call, retrying
transient failures (429 rate-limit, 503 "briefly unavailable", network errors) and
NOT retrying non-transient ones (bad API key) to avoid wasting time on something that
can't succeed. (This was tightened mid-build after a live 503 exposed a gap — see
entry 07.)

**`client.ts`** — `generateJSON()` is the single choke point every generation function
goes through: acquires a rate-limit slot, calls Gemini with `responseMimeType:
"application/json"`, and on a parse/validation failure, retries once with the parse
error appended to the prompt asking for a corrected response — directly handling the
brief's "model returns invalid JSON or an incomplete kit" edge case.
`withUntrustedContent()` wraps every piece of fetched/pasted text in an explicit
`<<<CONTENT>>>...<<<END CONTENT>>>` boundary telling the model not to follow
instructions found inside it — the prompt-injection defense the brief calls out as
"not theoretical here."

**`extractRequirements.ts`** — one LLM call, explicit instruction not to invent
requirements a thin JD doesn't contain, ids assigned by our own code afterward (never
by the model) so id stability is guaranteed.

**`categoryRouter.ts` + `generateQuestions.ts`** — decides which question categories
make sense per requirement (behavioural requirement → behavioural + company-fit
questions; a must-have technical requirement → technical + system-design; a
nice-to-have technical one → technical only, no forced system-design question out of
something minor), then issues one LLM call per (requirement, category) pair, per the
brief's explicit instruction that these shouldn't share a call/prompt.

**`generateFlashcards.ts`** — one call over the whole question bank (unlike
questions, flashcards don't need per-requirement prompt variation, so batching saves
calls/tokens), then deterministically maps each flashcard back to its source
question's requirement ids.

## Trade-offs
- **One call per (requirement, category) vs one big call for everything:** costs more
  API calls, but is what the brief explicitly asks for, and gives materially better
  question quality since each prompt is narrowly focused rather than asking the model
  to juggle 10 different framings at once. `categoryRouter` bounds the blowup so this
  doesn't multiply unnecessarily.
- **JSON-repair via re-prompting vs a JSON-repair library** (e.g. `jsonrepair`): a
  library could patch minor syntax errors without a second network round-trip.
  Re-prompting was chosen because Gemini's structured-output mode
  (`responseMimeType: "application/json"`) already makes malformed JSON rare, so a
  cheap fallback beats adding a dependency for a rare case (YAGNI).
- **Rate limiter is proactive (token bucket) AND reactive (retry-on-429), not just
  one or the other:** the bucket avoids tripping the limit in the common case; retry
  handles it when the limiter's configured rate estimate is wrong (e.g. an
  unexpectedly low provider quota — which is exactly what happened, see entry 07).
