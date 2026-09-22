# Product Requirements Document (PRD)

## Project: AI Interview Prep Kit
**Assessment ID:** FS-AI-INTERVIEW-01 (Trao)
**Doc owner:** Pradeep Kumar
**Status:** Draft v1

---

## 1. Problem Statement

Candidates preparing for interviews have to manually piece together: what the company
actually does, what the role really requires, what kind of questions the company asks,
and how to structure their limited prep time. This is repetitive research work that an
application can do faster and more consistently than a human skimming ten browser tabs.

## 2. Goal

Build a web app where a user pastes a job description + company URL + days until
interview, and the app researches the company (crawl site, find hiring page, search for
public interview discussion), then generates a structured, editable "prep kit":
company brief, role breakdown, categorized question bank, flashcards, and a day-by-day
study schedule — then lets the user reshape and practice against it.

## 3. Non-Goals (Out of Scope)

- Job search / aggregation
- CV parsing or rewriting
- Applying to jobs
- Audio/video interview simulation
- Payments
- Team/sharing features
- Email verification, password reset, role hierarchies (auth stays minimal)

## 4. Users

Single user type: a job candidate. No admin roles, no teams. Each user sees and edits
only their own kits.

## 5. User Stories

| ID | Story | Priority |
|----|-------|----------|
| U1 | As a user, I can register and log in so my kits are private to me | Must |
| U2 | As a user, I can paste a JD + company URL + days-until-interview to create a kit | Must |
| U3 | As a user, I can upload a file of multiple JD+company pairs to batch-create kits | Must |
| U4 | As a user, I can watch generation progress with clear stages and failure states | Must |
| U5 | As a user, I can read the company brief, role breakdown, question bank, flashcards, schedule | Must |
| U6 | As a user, I can edit any field inline (question, answer outline, flashcard, brief) | Must |
| U7 | As a user, I can reorder questions and move a question between categories | Must |
| U8 | As a user, I can add or delete a question/flashcard by hand | Must |
| U9 | As a user, I can regenerate a single section without losing edits elsewhere | Must |
| U10 | As a user, I can step through flashcards, reveal answers, and rate my confidence | Must |
| U11 | As a user, I can see what's covered vs not, and get weak-spot-first ordering | Must |
| U12 | As a user, if a company site has no hiring info, I want an honest brief, not fabrication | Must |
| U13 | As a user, if my JD is a thin stub, I want a thin, honest kit, not invented requirements | Must |
| U14 (optional) | As a user, I can get a "weak spots" report / export a one-pager / mock-interview mode | Nice |

## 6. Functional Requirements Summary

See the assessment brief (`docs/reference/assignment-brief.md` — copy of source PDF
content) for exact wording. High-level buckets:

1. **Auth** — register/login/logout, session-based, protected routes, own-kits-only access.
2. **Input & Research** — JD textarea + company URL field + batch file upload; crawl
   company site (no hardcoded paths); find hiring/interview-process info; search public
   discussion of interview process; skip-and-report unreachable sources; rate-limit +
   backoff.
3. **Research & Generation Pipeline** — multi-step, not single-prompt: extract
   requirements → retrieve/clean pages → crawl & rank links → find interview discussion
   → generate questions per requirement+category → build schedule (deterministic) →
   check coverage (deterministic) → close gaps (second pass).
4. **Kit Structure** — exact schema per Appendix A (see `docs/reference/kit-schema.md`).
5. **Builder** — full CRUD + reorder + per-section regenerate with edit-preserving state
   model (generated / edited / pinned).
6. **Practice Mode** — flashcard stepper, confidence rating, coverage view, weak-spot
   ordering for next session.
7. **Schedule** — deterministic allocation across exactly N days, must-haves covered,
   hardest/highest-priority material earlier.
8. **Batch Entry Point** — `npm run evaluate -- --input cases.json --output kits.json`,
   exact I/O shape per Appendix B, must reuse production pipeline code, 5 cases in
   ≤15 min, continues past per-case failures.
9. **Edge Cases** — dead URL/404/timeout, no hiring page, thin JD, no public discussion,
   invalid LLM JSON, rate limits, duplicate submission, 1-day/60-day schedules.
10. **Security** — SSRF protection (block private/loopback in prod), content-type/size
    limits, prompt-injection resistance (fetched/pasted text is content, never
    instructions).

## 7. Success Metrics (how Trao grades this)

- **Automated (55 pts):** requirement extraction accuracy & no invention (20); coverage
  + schedule correctness (15); research/sequencing genuineness (10); robustness — run
  completes, structure validates, tests pass (10).
- **Human review (45 pts):** builder edit/reorder/regenerate-preserves-edits (15);
  interaction design — loading/empty/error, responsive, keyboard (10); code quality +
  README reasoning (10); practice mode + creative feature (10).

## 8. Constraints

- 4-day window, ~2-3 days focused work.
- Free-tier only: no paid APIs, no API keys supplied by Trao. LLM provider must have a
  genuine free tier and the pipeline must handle token-per-minute rate limiting
  gracefully (backoff/retry, not crash).
- Preferred stack: Next.js + Tailwind, Node/Express, MongoDB, JS/TS — equivalents
  allowed if justified in README.
- Deployment mandatory: both frontend and backend publicly reachable, free tier OK.
- Batch command must run from a clean clone with only documented `.env` setup, and must
  work against a company site served from `localhost` (relative-link-safe crawling).

## 9. Key Design Decisions to Defend in README

- How generated/edited/pinned state is represented (the hardest state problem).
- How many coverage passes, and stop condition.
- How practice-mode "next session" ordering works (confidence-weighted vs
  spaced-repetition).
- Why the chosen LLM provider/model, and how rate-limit backoff is implemented.
- What counts as a `failed` vs `ok` batch case.

## 10. Open Questions / Risks

- LLM free-tier throughput may bottleneck the 5-cases-in-15-min batch requirement —
  needs concurrency + backoff design validated early.
- Company hiring-page discovery is explicitly the "interesting half" — heuristic-based
  crawl+rank, not a fixed path list; risk of false negatives on obscure sites (mitigated
  by honest "not found" reporting rather than fabrication).
