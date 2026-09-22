# Reference — Kit Structure (Appendix A, verbatim from brief)

Field names must match exactly. This is the contract used to build the Zod schema in
`src/server/validation/kitSchema.ts`.

```json
{
  "source": {
    "company": "",
    "company_url": "",
    "role": "",
    "location": "",
    "jd_chars": 0,
    "researched_at": "",
    "pages_used": ["https://..."]
  },
  "company_brief": {
    "summary": "",
    "what_they_do": "",
    "sources": ["https://..."]
  },
  "role": {
    "title": "",
    "seniority": "",
    "responsibilities": [""],
    "requirements": [
      {
        "id": "r1",
        "text": "5+ years with React",
        "kind": "technical",
        "priority": "must"
      }
    ]
  },
  "questions": [
    {
      "id": "q1",
      "requirement_ids": ["r1"],
      "category": "technical",
      "prompt": "",
      "answer_outline": "",
      "difficulty": 2
    }
  ],
  "flashcards": [
    {
      "id": "f1",
      "front": "",
      "back": "",
      "requirement_ids": ["r1"]
    }
  ],
  "schedule": {
    "days_available": 5,
    "days": [
      { "day": 1, "focus": "", "question_ids": ["q1"], "minutes": 60 }
    ]
  },
  "coverage": { "uncovered_requirement_ids": [], "passes": 2 }
}
```

Enums:
- `role.requirements[].kind`: `technical | behavioural | domain`
- `role.requirements[].priority`: `must | nice`
- `questions[].category`: `technical | behavioural | system-design | company-fit`
- `questions[].difficulty`: integer `1..3`
- `schedule.days[].minutes`: integer (no floats)

Rules:
- Every requirement has a stable `id`; every question's `requirement_ids` references
  real requirement ids.
- Every `schedule.days[].question_ids` entry must reference a question that exists.
- `priority` reflects the posting's own wording ("required" = must, "bonus points for"
  = nice) — not inferred loosely.
