# Rules Index

These rules are strict and override default behavior for this project. They apply to
Claude and to every subagent working in this repo. Pradeep reviews and may amend
these — if a rule changes, update the file here rather than relying on chat memory.

- [00-git-and-commits.md](./00-git-and-commits.md) — Claude never commits/pushes; flags checkpoints instead
- [01-react-and-frontend.md](./01-react-and-frontend.md) — no useEffect/useRef unless justified, 1 component/file, arrow functions, short files, 1-line comments
- [02-state-management.md](./02-state-management.md) — useState → Zustand (shared) → React Query (server state), no prop drilling past 3 levels
- [03-code-quality.md](./03-code-quality.md) — no over-engineering, DRY/KISS/YAGNI, deterministic logic stays out of the LLM
- [04-explainability-and-devlog.md](./04-explainability-and-devlog.md) — every feature gets a devlog entry: what/why/how/trade-offs, so Pradeep can explain it himself

See also `docs/` for the project planning docs (PRD, TRD, architecture, pipeline
design, API spec, data model, test plan, roadmap) and `devlog/` for the running build
log.
