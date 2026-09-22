# Reference — Batch Input/Output Shape (Appendix B, verbatim from brief)

Command (mandatory, exact): `npm run evaluate -- --input <cases.json> --output <kits.json>`

## Input (`cases.json`)

```json
[
  {
    "id": "case-01",
    "jd": "Senior Backend Engineer\n\nWe are looking for ...",
    "company_url": "http://localhost:8099/acme/",
    "days": 5
  }
]
```

Notes:
- `company_url` may point to a locally-served fixture — retrieval code must not assume
  a particular host and must follow relative links (do not hardcode `https://` or a
  specific domain anywhere in the crawler).

## Output (`kits.json`)

```json
{
  "version": "1.0",
  "generated_at": "2026-09-01T09:12:44Z",
  "kits": [
    {
      "id": "case-01",
      "status": "ok",
      "kit": { "...": "the structure from Appendix A (see kit-schema.md)" },
      "error": null
    },
    {
      "id": "case-04",
      "status": "failed",
      "kit": null,
      "error": {
        "code": "COMPANY_UNREACHABLE",
        "message": "Company site unreachable after 3 retries."
      }
    }
  ]
}
```

Rules:
- One entry per input case, in any order, keyed by the given `id`.
- `status: "ok"` even if research was partial (e.g. no hiring page found) — gaps go in
  the kit itself (`coverage`, empty `pages_used`, honest brief), not in `status`.
- `status: "failed"` reserved for cases where no kit could be produced at all.
- Must complete 5 cases within 15 minutes including any rate-limit retries.
- Must run from a clean clone with only the documented `.env` setup.
