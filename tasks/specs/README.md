# Specs

`agent-run` works from one spec per change. Specs are plain Markdown, named
`<issue>-<slug>.md` after the GitHub issue they resolve (for example
`4-agent-instructions.md`).

Every spec has these sections:

- **Goal** — the user-visible outcome and why it matters.
- **Files owned** — the exact paths the change may edit or create. Anything
  outside the list is out of scope; update the spec before touching it.
- **Acceptance** — observable criteria that prove the goal is met.
- **Gate** — the commands that must pass before the branch is pushed.

The gate is `bun run gauntlet`, plus `bun run build` and `bun run test:e2e` for
browser behavior. Report the commands and their real output in the pull
request; never claim a check that did not run.

`AGENTS.md` holds the repository rules that apply to every spec; do not repeat
them here.
