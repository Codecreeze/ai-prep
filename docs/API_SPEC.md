# API Specification (draft v1)

Base path: `/api`. All endpoints except `/auth/register` and `/auth/login` require a
valid session cookie; missing/expired session → `401`.

## Auth

### POST `/api/auth/register`
Body: `{ email: string, password: string }`
201 → `{ user: { id, email } }`
409 if email already registered.

### POST `/api/auth/login`
Body: `{ email: string, password: string }`
200 → sets HTTP-only session cookie, `{ user: { id, email } }`
401 on bad credentials.

### POST `/api/auth/logout`
200 → clears cookie.

## Kits

### POST `/api/kits`
Create one kit (single JD+company).
Body: `{ jd: string, companyUrl: string, days: number }`
202 → `{ kitId, status: "pending" }` (generation runs async)
400 on validation failure (e.g. days out of 1-60 sane range → still accepted per brief
edge cases, but flagged).

### POST `/api/kits/batch`
Body: `multipart/form-data` file upload — JSON or CSV of `{ jd, companyUrl, days }[]`.
202 → `{ kitIds: string[] }` — creates N pending kits, each processed independently.

### GET `/api/kits`
List current user's kits (summary: id, status, company, role, createdAt).

### GET `/api/kits/:id`
Full kit detail (404 if not found or not owned by caller → return 404, not 403, to
avoid leaking existence).

### GET `/api/kits/:id/status`
Lightweight polling endpoint: `{ status, progress: { stage, error } }`.

### DELETE `/api/kits/:id`
Delete a kit owned by the caller.

## Builder — edit operations

### PATCH `/api/kits/:id/company-brief`
Body: partial `{ summary?, what_they_do? }` → marks `editState.brief = "edited"`.

### POST `/api/kits/:id/questions`
Add a question by hand. Body matches question shape minus `id` (server assigns).
Marks it `editState.questions[id] = "edited"` (hand-written ≡ edited/protected).

### PATCH `/api/kits/:id/questions/:qid`
Edit a question's fields. Sets `editState.questions[qid] = "edited"` unless already
`"pinned"`.

### DELETE `/api/kits/:id/questions/:qid`

### PATCH `/api/kits/:id/questions/reorder`
Body: `{ category: string, orderedIds: string[] }` — pure ordering change, no
LLM/coverage recompute needed.

### PATCH `/api/kits/:id/questions/:qid/move`
Body: `{ toCategory: string }` — move a question to a different category.

### POST `/api/kits/:id/questions/:qid/pin` | `/unpin`

### (Equivalent CRUD/reorder/pin set for `/flashcards`)

### PATCH `/api/kits/:id/schedule`
Manual schedule edits (e.g. drag a question to a different day) — marks
`editState.schedule = "edited"`.

## Regeneration

### POST `/api/kits/:id/regenerate/company-brief`
Regenerates brief only if `editState.brief !== "pinned"`. If `"edited"`, asks for
confirmation flag `{ force: true }` in body to overwrite.

### POST `/api/kits/:id/regenerate/questions/:category`
Regenerates only `generated`-state questions in that category; `edited`/`pinned` ones
survive untouched. Re-runs coverage check afterward. Returns updated section +
`coverage`.

### POST `/api/kits/:id/regenerate/schedule`
Rebuilds schedule deterministically from current requirements/questions/days (no LLM
call — pure allocation logic); respects manual schedule edits only if `"pinned"`,
otherwise rebuilds fully (schedule regeneration is closer to "recompute" than
"re-ask-the-model").

## Coverage

### GET `/api/kits/:id/coverage`
Returns `{ uncovered_requirement_ids, passes }` — current coverage state (read-only,
mirrors the `kit.coverage` field).

## Practice Mode

### GET `/api/kits/:id/practice/next`
Returns the next-ordered queue of flashcard ids based on confidence-weighted sort
(least-confident / never-seen first).

### POST `/api/kits/:id/practice/:cardId/answer`
Body: `{ confidence: 1|2|3|4|5 }` — records confidence + marks card covered.

### GET `/api/kits/:id/practice/coverage`
Returns `{ coveredCount, totalCount, byRequirement: {...} }`.

## Error Shape (all endpoints)

```json
{ "error": { "code": "STRING_CODE", "message": "human readable" } }
```

Codes used across pipeline/API (non-exhaustive): `VALIDATION_ERROR`,
`COMPANY_UNREACHABLE`, `NO_HIRING_PAGE_FOUND`, `LLM_RATE_LIMITED`, `LLM_INVALID_JSON`,
`KIT_NOT_FOUND`, `UNAUTHORIZED`.

## Batch CLI (not HTTP — documented here for completeness)

```bash
npm run evaluate -- --input cases.json --output kits.json
```
See `docs/reference/batch-io-shape.md` for exact Appendix B I/O JSON shape.
