#!/usr/bin/env bun
/**
 * Agent documentation gate — keeps AGENTS.md the single source of agent
 * instructions.
 *
 * Checks:
 *   1. AGENTS_PRESENT     — AGENTS.md exists at the repository root
 *   2. AGENTS_LINKS       — every relative link in AGENTS.md resolves
 *   3. AGENTS_SIZE        — AGENTS.md stays within the 200-line guidance
 *   4. CLAUDE_IMPORT      — CLAUDE.md is absent or starts with `@AGENTS.md`
 *   5. NO_CURSOR_RULES    — no legacy .cursorrules duplicate
 *   6. SKILL_FRONTMATTER  — each .claude/skills/<name>/SKILL.md declares
 *                           `name` and `description`
 *   7. SKILLS_LOCATION    — .agents/skills, when present, links to .claude/skills
 *   8. TRACKED_ARTIFACTS  — generated output and .env files are not committed
 *
 * Usage:
 *   bun run scripts/check_agent_docs.ts
 *   bun run scripts/check_agent_docs.ts --json
 *
 * Exit: 0 = agent docs are consistent, 1 = violations found.
 */

import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, relative } from 'node:path'
import { parseArgs } from 'node:util'
import { argv, exit } from 'node:process'

const PROJECT_ROOT = new URL('..', import.meta.url).pathname

const AGENTS_FILE = 'AGENTS.md'
const MAX_AGENTS_LINES = 200
const SKILLS_DIR = join('.claude', 'skills')

const ARTIFACT_PREFIXES = ['dist/', 'dist-ssr/', 'coverage/', 'playwright-report/', 'test-results/']

interface Violation {
  check: string
  filepath: string
  line: number
  message: string
}

// ── Markdown links ───────────────────────────────────────────────────

interface LinkTarget {
  target: string
  line: number
}

function collectRelativeLinks(markdown: string): LinkTarget[] {
  const links: LinkTarget[] = []
  const lines = markdown.split('\n')
  const pattern = /!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g
  for (let i = 0; i < lines.length; i++) {
    for (const match of lines[i].matchAll(pattern)) {
      const target = match[1]
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) continue
      links.push({ target, line: i + 1 })
    }
  }
  return links
}

function resolveLink(baseDir: string, target: string): string | null {
  let path: string
  try {
    path = decodeURIComponent(target.split('#')[0].split('?')[0])
  } catch {
    return null
  }
  if (!path) return null
  return join(baseDir, path)
}

// ── Checks ───────────────────────────────────────────────────────────

function checkAgentsLinks(agentsPath: string): Violation[] {
  const violations: Violation[] = []
  const lines = readFileSync(agentsPath, 'utf-8').split('\n')
  for (const link of collectRelativeLinks(lines.join('\n'))) {
    const resolved = resolveLink(PROJECT_ROOT, link.target)
    if (!resolved || !existsSync(resolved)) {
      violations.push({
        check: 'AGENTS_LINKS',
        filepath: AGENTS_FILE,
        line: link.line,
        message: `unresolved relative link "${link.target}"`,
      })
    }
  }
  return violations
}

function checkAgentsSize(agentsPath: string): Violation[] {
  const count = readFileSync(agentsPath, 'utf-8').split('\n').length
  if (count <= MAX_AGENTS_LINES) return []
  return [
    {
      check: 'AGENTS_SIZE',
      filepath: AGENTS_FILE,
      line: MAX_AGENTS_LINES + 1,
      message: `${count} lines — keep AGENTS.md under ${MAX_AGENTS_LINES}; move reference material to docs`,
    },
  ]
}

function checkClaudeImport(claudePath: string): Violation[] {
  const firstLine = readFileSync(claudePath, 'utf-8')
    .split('\n')
    .find((line) => line.trim().length > 0)
  if (firstLine?.trim() === '@AGENTS.md') return []
  return [
    {
      check: 'CLAUDE_IMPORT',
      filepath: 'CLAUDE.md',
      line: 1,
      message: 'CLAUDE.md must start with @AGENTS.md; do not copy the rules',
    },
  ]
}

interface SkillInfo {
  dir: string
  skillPath: string
}

function listSkills(): SkillInfo[] {
  const root = join(PROJECT_ROOT, SKILLS_DIR)
  if (!existsSync(root)) return []
  const skills: SkillInfo[] = []
  for (const entry of readdirSync(root)) {
    const dir = join(root, entry)
    if (!statSync(dir).isDirectory()) continue
    skills.push({ dir, skillPath: join(dir, 'SKILL.md') })
  }
  return skills
}

function checkSkillFrontmatter(skill: SkillInfo): Violation[] {
  const displayPath = relative(PROJECT_ROOT, skill.skillPath)
  if (!existsSync(skill.skillPath)) {
    return [
      {
        check: 'SKILL_FRONTMATTER',
        filepath: displayPath,
        line: 0,
        message: 'missing SKILL.md (run bun install if it links into node_modules)',
      },
    ]
  }
  const lines = readFileSync(skill.skillPath, 'utf-8').split('\n')
  if (lines[0]?.trim() !== '---') {
    return [
      {
        check: 'SKILL_FRONTMATTER',
        filepath: displayPath,
        line: 1,
        message: 'SKILL.md must start with YAML frontmatter',
      },
    ]
  }
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---')
  if (end === -1) {
    return [
      {
        check: 'SKILL_FRONTMATTER',
        filepath: displayPath,
        line: 1,
        message: 'unterminated YAML frontmatter',
      },
    ]
  }
  const frontmatter = lines.slice(1, end)
  const missing = ['name', 'description'].filter(
    (field) => !frontmatter.some((line) => new RegExp(`^${field}:\\s*\\S`).test(line))
  )
  return missing.map((field) => ({
    check: 'SKILL_FRONTMATTER',
    filepath: displayPath,
    line: 1,
    message: `frontmatter is missing "${field}"`,
  }))
}

function checkSkillsLocation(): Violation[] {
  const alias = join(PROJECT_ROOT, '.agents', 'skills')
  if (!existsSync(alias) && !isDanglingSymlink(alias)) return []
  const linkPath = relative(PROJECT_ROOT, alias)
  if (!lstatSync(alias).isSymbolicLink()) {
    return [
      {
        check: 'SKILLS_LOCATION',
        filepath: linkPath,
        line: 0,
        message: 'must be a symlink to .claude/skills; keep skills in one location',
      },
    ]
  }
  const target = join(dirname(alias), readlinkSync(alias))
  if (!existsSync(target)) {
    return [
      {
        check: 'SKILLS_LOCATION',
        filepath: linkPath,
        line: 0,
        message: 'symlink target does not resolve',
      },
    ]
  }
  return []
}

function isDanglingSymlink(path: string): boolean {
  try {
    return lstatSync(path).isSymbolicLink() && !existsSync(path)
  } catch {
    return false
  }
}

function listTrackedFiles(): string[] | null {
  const result = spawnSync('git', ['ls-files', '-z'], {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
  })
  if (result.status !== 0 || typeof result.stdout !== 'string') return null
  return result.stdout.split('\0').filter(Boolean)
}

function checkTrackedArtifacts(tracked: string[]): Violation[] {
  const violations: Violation[] = []
  for (const file of tracked) {
    const base = file.split('/').pop() ?? file
    if ((base === '.env' || base.startsWith('.env.')) && base !== '.env.example') {
      violations.push({
        check: 'TRACKED_ARTIFACTS',
        filepath: file,
        line: 0,
        message: 'environment file is committed — keep secrets out of git',
      })
      continue
    }
    const prefix = ARTIFACT_PREFIXES.find((candidate) => file.startsWith(candidate))
    if (prefix) {
      violations.push({
        check: 'TRACKED_ARTIFACTS',
        filepath: file,
        line: 0,
        message: `generated output under ${prefix} is committed — it is gitignored`,
      })
    }
  }
  return violations
}

// ── Orchestration ────────────────────────────────────────────────────

function main(): number {
  const { values } = parseArgs({
    args: argv.slice(2),
    options: {
      json: { type: 'boolean', default: false },
    },
    strict: false,
  })

  const violations: Violation[] = []
  const agentsPath = join(PROJECT_ROOT, AGENTS_FILE)

  if (!existsSync(agentsPath)) {
    violations.push({
      check: 'AGENTS_PRESENT',
      filepath: AGENTS_FILE,
      line: 0,
      message: 'missing at repository root — agent instructions must live here',
    })
  } else {
    violations.push(...checkAgentsLinks(agentsPath), ...checkAgentsSize(agentsPath))
  }

  const claudePath = join(PROJECT_ROOT, 'CLAUDE.md')
  if (existsSync(claudePath)) violations.push(...checkClaudeImport(claudePath))

  if (existsSync(join(PROJECT_ROOT, '.cursorrules'))) {
    violations.push({
      check: 'NO_CURSOR_RULES',
      filepath: '.cursorrules',
      line: 0,
      message: 'legacy rules file — fold its content into AGENTS.md and delete it',
    })
  }

  for (const skill of listSkills()) violations.push(...checkSkillFrontmatter(skill))
  violations.push(...checkSkillsLocation())

  const tracked = listTrackedFiles()
  if (tracked === null) {
    violations.push({
      check: 'TRACKED_ARTIFACTS',
      filepath: '.',
      line: 0,
      message: 'could not run git ls-files',
    })
  } else {
    violations.push(...checkTrackedArtifacts(tracked))
  }

  if (values.json) {
    console.log(
      JSON.stringify(
        {
          violations: violations.map((v) => ({
            check: v.check,
            file: v.filepath,
            line: v.line,
            message: v.message,
          })),
          count: violations.length,
        },
        null,
        2
      )
    )
  } else {
    if (violations.length === 0) {
      console.log('Agent documentation is consistent.')
    }
    for (const v of violations) {
      console.log(`[${v.check}] ${v.filepath}:${v.line} — ${v.message}`)
    }
    console.log(
      violations.length ? `\n${violations.length} violation(s) found.` : '\n0 violations.'
    )
  }

  return violations.length ? 1 : 0
}

exit(main())
