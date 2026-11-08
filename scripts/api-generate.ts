import { rm } from 'node:fs/promises'
import { createClient } from '@hey-api/openapi-ts'
import config from '../openapi-ts.config'

/**
 * Regenerate the OpenAPI client. `OPENAPI_INPUT` selects the contract
 * document; `output` overrides the committed destination (used by `api:check`).
 */
export async function generateApi(output?: string) {
  const resolved = await config
  const destination = output ?? resolved.output
  await rm(destination, { recursive: true, force: true })
  await createClient({ ...resolved, output: destination })
}

if (import.meta.main) await generateApi()
