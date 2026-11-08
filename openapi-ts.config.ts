import { defineConfig } from '@hey-api/openapi-ts'

// Standalone projects use the vendored fixture. mattstack monorepos point at
// the producer's document, for example:
//   OPENAPI_INPUT=../backend/docs/openapi/openapi.json bun run api:generate
const input = process.env.OPENAPI_INPUT ?? 'backend/docs/openapi/openapi.json'

export default defineConfig({
  input,
  output: 'src/api/generated',
  plugins: [
    '@hey-api/typescript',
    '@hey-api/client-axios',
    '@hey-api/sdk',
    {
      name: 'zod',
      compatibilityVersion: 4,
      requests: true,
      responses: true,
      definitions: true,
    },
    '@tanstack/react-query',
  ],
})
