# 01 — Kit Schema & Validation

**File:** `src/server/validation/kitSchema.ts`

## What
A Zod schema that mirrors Appendix A of the assessment brief field-for-field
(`source`, `company_brief`, `role`, `questions`, `flashcards`, `schedule`,
`coverage`), plus a `validateKit()` function that does two layers of checking.

## Why
The brief is explicit that the kit structure is one of only two things in the whole
assessment that's non-negotiable — field names must match exactly, because Trao runs
your pipeline against job descriptions you haven't seen and checks the output shape.
Getting this schema wrong breaks the automated grading pass regardless of how good the
rest of the app is. So this was built first, directly from the brief's JSON example,
rather than inferred from "what seems reasonable."

## How
- Zod's `.safeParse()` handles shape/type checking (required fields present, enums
  constrained to `must|nice`, `technical|behavioural|domain`, etc., `minutes` and
  `difficulty` forced to integers — the brief explicitly calls out "integer minutes,
  no floats").
- A second manual pass (`validateKit`) checks referential integrity that Zod's
  structural typing can't express on its own: every `question.requirement_ids` and
  `flashcard.requirement_ids` must point at a requirement id that actually exists in
  the same kit, and every `schedule.days[].question_ids` must point at a real
  question id. The brief calls this out directly: "every `question_ids` entry in the
  schedule must refer to a question that exists."
- Also checks `schedule.days.length === schedule.days_available` — the brief requires
  the number of days in the schedule to equal the number of days requested.

## Trade-offs
- **Zod vs manual type guards:** Zod was chosen over hand-written validation
  functions because it gives both compile-time types (`z.infer<...>`) and runtime
  validation from one definition, so the TypeScript types used everywhere else in the
  codebase (`Requirement`, `Question`, etc.) can never drift out of sync with the
  actual validation rules — a real risk if they were maintained as two separate
  things (a `type` and a separate `validate()` function).
- **Referential-integrity errors treated as hard failures, not warnings:** the brief
  frames stable ids and consistent references as "what makes coverage checkable
  rather than a matter of opinion" — so a kit with a dangling reference is not
  considered a valid kit, full stop, rather than something to log and ship anyway.
  This is stricter than the bare minimum but matches what's clearly being tested for.
