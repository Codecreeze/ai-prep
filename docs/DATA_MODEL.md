# Data Model

## 1. MongoDB Collections

### `users`
```ts
{
  _id: ObjectId,
  email: string,          // unique, lowercase
  passwordHash: string,   // bcrypt
  createdAt: Date,
}
```

### `sessions` (if not using a signed-cookie-only approach)
```ts
{
  _id: ObjectId,
  userId: ObjectId,
  expiresAt: Date,
  createdAt: Date,
}
```
Decision: prefer a signed, HTTP-only cookie holding a JWT (userId + exp) to avoid a DB
round-trip per request — no separate `sessions` collection needed unless server-side
revocation is required. Document choice in README.

### `kits`
```ts
{
  _id: ObjectId,
  userId: ObjectId,          // owner — every query scoped by this
  status: "pending" | "ready" | "failed",
  progress: {
    stage: string,           // e.g. "crawling_company", "generating_questions"
    error: string | null,
  },
  input: {
    jd: string,
    companyUrl: string,
    days: number,
  },
  kit: KitSchema | null,      // Appendix A shape, see kit-schema.md; null until ready
  editState: {                 // parallel map, not embedded in kit.* to keep Appendix A pure
    questions: Record<questionId, "generated" | "edited" | "pinned">,
    flashcards: Record<flashcardId, "generated" | "edited" | "pinned">,
    brief: "generated" | "edited" | "pinned",
    schedule: "generated" | "edited" | "pinned",
  },
  practice: {
    coveredCardIds: string[],
    confidence: Record<flashcardId, 1 | 2 | 3 | 4 | 5>,
    lastSessionAt: Date | null,
  },
  createdAt: Date,
  updatedAt: Date,
}
```

Rationale for keeping `editState` separate from the Appendix A `kit` object: Appendix
A's field names/shape must match exactly, so we don't pollute it with our own
bookkeeping fields — `editState` lives alongside it in the same Mongo document instead.

## 2. Kit Schema (Appendix A — exact, do not rename fields)

See `docs/reference/kit-schema.md` for the literal structure copied from the brief.
This is implemented as a Zod schema in `src/server/validation/kitSchema.ts` and is the
single source of truth used to validate both the web-app pipeline output and the batch
`evaluate` output before either is written anywhere.

## 3. Indexes

- `users.email` — unique index.
- `kits.userId` — index (list-my-kits query, and ownership check on every kit read).
- `kits.userId + input.companyUrl + input.jd` — non-unique index to support duplicate
  submission detection (hash of jd+companyUrl compared before creating a new pending
  kit; if an identical pending/ready kit exists for the same user, surface it instead
  of re-running the pipeline).

## 4. Duplicate Submission Handling

Compute `dedupeHash = sha256(normalizedJd + normalizedCompanyUrl)` on create. If a kit
with the same `userId + dedupeHash` already exists and is `ready`, return that kit
(with a flag `duplicate: true`) instead of regenerating — saves LLM quota and matches
the brief's edge-case list ("the same description and company are submitted twice").
User can still explicitly hit "regenerate" if they want a fresh run.
