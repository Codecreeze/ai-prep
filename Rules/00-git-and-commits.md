# Git & Commit Rules (STRICT)

1. **Claude (and any subagent) must NEVER run `git commit`, `git push`, `git add` for
   the purpose of committing, or any command that creates/modifies git history.**
   Read-only git commands (`git status`, `git diff`, `git log`) are fine for
   self-checking.
2. All commits and pushes are done **manually by Pradeep**.
3. Whenever a feature/unit of work reaches a good, working checkpoint, Claude must
   **stop and say so explicitly** — e.g. "This is a good point to commit: <what was
   built>." — and wait. Do not bundle multiple unrelated features into one
   "commit point" callout; flag each logical unit as it completes.
4. After Pradeep confirms he has committed (or says "continue"), resume work.
5. Never use `--no-verify`, `--force`, `git reset --hard`, or any destructive git
   command under any circumstance in this repo.
6. Branching strategy, PRs, etc. are Pradeep's call — Claude doesn't create branches
   unless explicitly asked.
