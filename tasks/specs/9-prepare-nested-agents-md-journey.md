# 9 — Prepare for nested AGENTS.md and journey tests

## Problem

This frontend's `AGENTS.md` still carries repository-global rules (commits,
secrets, branches, harness setup) that the root `AGENTS.md` of a mattstack
checkout owns, and it says nothing about the generated API client or the
Playwright journey conventions the backend JOURNEYS gate reads. Without a JSON
report, the gate cannot map a failing journey step.

## Files owned

- `AGENTS.md`
- `playwright.config.ts`
- `tasks/specs/9-prepare-nested-agents-md-journey.md`

## Acceptance

- [ ] `AGENTS.md` keeps frontend facts only: package manager, dev/build/test
      commands, generated API client rules, Playwright conventions. Commit,
      secret and branch rules are gone.
- [ ] `AGENTS.md` documents the `@J-NNN` test tag and the
      `test.step('J-NNN-S<n>: ...')` step title convention.
- [ ] `playwright.config.ts` keeps its existing reporters and adds a `json`
      reporter writing `test-results/journeys.json`.
- [ ] No `CLAUDE.md` or tool-specific agent adapter is tracked.

## Gate

```bash
bun run lint          # pass
bun run format:check  # pass
bun run typecheck     # pass
bun run build         # pass
bun run api:check     # pass
bun run check-conventions
bun run check-dependencies
bun run check-agent-docs
```

`bun run gauntlet` covers these static checks plus the unit suite; the
agent-run rule for this task forbids running unit tests, so each static check
ran on its own. The change ships the Playwright config only, so
`bun run test:e2e` was not run.
