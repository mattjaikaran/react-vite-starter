import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { generateApi } from './api-generate'

const COMMITTED = 'src/api/generated'

async function files(root: string, directory = root): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) return files(root, path)
      if (!entry.isFile()) throw new Error(`Unexpected generated entry: ${path}`)
      return [relative(root, path)]
    })
  )
  return paths.flat().sort()
}

const temporary = await mkdtemp(join(tmpdir(), 'starter-api-check-'))
try {
  const fresh = join(temporary, 'generated')
  await generateApi(fresh)
  const [expected, actual] = await Promise.all([files(fresh), files(COMMITTED)])
  const drift: string[] = []
  const expectedSet = new Set(expected)
  const actualSet = new Set(actual)

  for (const path of expected) {
    if (!actualSet.has(path)) {
      drift.push(`Missing: ${path}`)
      continue
    }
    const [left, right] = await Promise.all([
      readFile(join(fresh, path)),
      readFile(join(COMMITTED, path)),
    ])
    if (!left.equals(right)) drift.push(`Changed: ${path}`)
  }
  for (const path of actual) {
    if (!expectedSet.has(path)) drift.push(`Extra: ${path}`)
  }

  if (drift.length) {
    console.error(`Generated API drift. Run \`bun run api:generate\`.\n${drift.join('\n')}`)
    process.exitCode = 1
  } else console.log('Generated API matches the OpenAPI contract.')
} finally {
  await rm(temporary, { recursive: true, force: true })
}
