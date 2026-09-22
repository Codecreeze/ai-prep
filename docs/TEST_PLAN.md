# Test Plan

Brief explicitly requires: "automated tests for the behaviour most worth protecting:
schedule allocation, coverage checking and structure validation." These are the floor;
additional tests are added opportunistically where cheap.

## 1. Unit Tests (must-have)

### `coverage/checkCoverage`
- All must-have requirements covered → empty uncovered list.
- One must-have uncovered → returned in list.
- Nice-to-have uncovered → NOT returned (only must-haves block coverage).
- Question with multiple `requirement_ids` covers all of them.
- Empty questions array + non-empty must-haves → all returned as uncovered.

### `scheduler/buildSchedule`
- `days = N` → output has exactly N day entries.
- Every must-have requirement's question appears in some day's `question_ids`.
- Every `question_ids` entry refers to a real question id.
- `minutes` is always an integer (no floats).
- `days = 1` → doesn't crash, compresses content sensibly.
- `days = 60` → doesn't crash, doesn't produce empty days for all of them.
- Higher-priority/harder questions land on earlier days (assert day-1 avg
  priority/difficulty ≥ later days).

### `validation/kitSchema` (Zod)
- A structurally valid kit passes.
- Missing required field (e.g. `role.requirements`) fails with a clear path.
- Wrong type (e.g. `minutes` as string/float) fails.
- `question.requirement_ids` referencing a non-existent requirement id — decide:
  fail validation or warn (document decision; likely fail, since brief says ids must
  be consistent/checkable).
- `priority` outside `must|nice` fails; `kind`/`category` enums enforced.

### `retrieval/urlValidator` (SSRF guard)
- Rejects `127.0.0.1`, `localhost`, `169.254.x.x`, private ranges in production mode.
- Allows them when `ALLOW_LOCAL_URLS=true` (batch/dev mode).
- Rejects non-http(s) schemes.

### `crawler/rankLinks`
- Given a set of links including `/careers`, `/jobs`, `/about`, `/blog/engineering`,
  ranks hiring-signal paths above generic ones.
- No hardcoded exact-path matching — test with an unconventional path (e.g.
  `/company/work-with-us`) scored via keyword heuristics, not exact match.

## 2. Integration Tests

- **Fixture company site**: a small local HTTP server (e.g. via `msw` or a tiny
  Express fixture) serving a homepage + a non-obvious hiring page + robots.txt, used to
  test `crawlCompanySite` end-to-end without hitting the real internet.
- **Mocked LLM**: pipeline orchestrator run against a stubbed LLM client that returns
  canned JSON (including one deliberately malformed response) to verify:
  - Full pipeline produces a valid kit for a normal case.
  - Malformed LLM JSON triggers retry/repair, not a crash.
  - A requirement with no question after pass 1 gets a pass-2 attempt, then is
    honestly reported if still uncovered after `MAX_PASSES`.
- **Batch script**: run `scripts/evaluate.ts` against a small `cases.json` fixture
  (including one deliberately unreachable `company_url`) and assert:
  - Output matches Appendix B shape exactly.
  - The unreachable case is `status: "failed"` with a structured `error`, other cases
    still complete (`continues after one case fails`).

## 3. Manual QA Checklist (before submission, human-review points)

- [ ] Register, login, logout; protected route redirects when signed out.
- [ ] Create kit from pasted JD + real company URL; watch progress states.
- [ ] Batch-upload a file of JD+company pairs.
- [ ] Thin JD (2 lines) produces an honest, short kit — no invented requirements.
- [ ] Company URL with no hiring page produces an honest brief, not fabrication.
- [ ] Invalid/unreachable company URL handled with a clear error, doesn't crash the kit.
- [ ] Edit a question, reorder questions, move a question to another category.
- [ ] Regenerate one category — confirm edited/pinned items in that category and edits
      in other sections all survive.
- [ ] Add a question/flashcard by hand, delete one.
- [ ] Practice mode: step through cards, rate confidence, confirm "next session" order
      reflects weak spots.
- [ ] Coverage view shows accurate covered/uncovered state.
- [ ] Responsive check at laptop + phone widths; full keyboard navigation of the
      builder and practice mode (tab order, enter/space activation, no keyboard traps).
- [ ] Duplicate JD+company submission handled per design (reuse vs flag).
- [ ] 1-day and 60-day schedule requests both produce sane, non-crashing output.
- [ ] `npm run evaluate -- --input cases.json --output kits.json` runs clean from a
      fresh clone with only `.env` populated, completes 5 cases within 15 minutes.

## 4. Tooling

- Test runner: Vitest (fast, native ESM/TS support, works well with Next.js).
- Coverage report: `vitest --coverage`, prioritizing the must-have areas above over
  raw % coverage.
