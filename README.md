# React Vite Starter

A modern React starter template with Vite, TailwindCSS, TanStack Query, and TypeScript.

## Features

- **React 19** - Modern React with concurrent features
- **Vite** - Lightning fast HMR and optimized builds
- **TypeScript** - Full type safety
- **TailwindCSS** - Utility-first CSS framework
- **TanStack Query** - Powerful data fetching and caching
- **React Router v7** - Client-side routing
- **Axios** - HTTP client with interceptors
- **oxlint + oxfmt** - Native linting and formatting
- **React Doctor** - React health checks without telemetry or supply-chain scanning
- **Bun** - Fast JavaScript runtime and package manager

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/react-vite-starter.git myapp
cd myapp
```

2. Install dependencies:

```bash
bun install
```

3. Copy environment file:

```bash
cp .env.example .env
```

4. Start development server:

```bash
bun dev
```

Visit http://localhost:5173

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Alert.tsx    # Alert/notification component
│   │   ├── Badge.tsx    # Status badges
│   │   ├── Button.tsx   # Button with variants
│   │   ├── Card.tsx     # Card container components
│   │   ├── Input.tsx    # Form input with validation
│   │   ├── Spinner.tsx  # Loading spinner
│   │   └── index.ts     # Component exports
│   ├── Layout.tsx       # Main layout with navigation
│   └── ProtectedRoute.tsx
├── lib/
│   ├── api.ts           # Axios instance and helpers
│   ├── auth.tsx         # Authentication context
│   └── utils.ts         # Utility functions
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProfilePage.tsx
│   └── NotFoundPage.tsx
├── test/
│   └── setup.ts         # Vitest setup
├── types/               # TypeScript type definitions
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles with Tailwind
```

## Scripts

```bash
bun dev        # Start development server
bun build      # Build for production
bun preview    # Preview production build
bun run lint          # Run oxlint
bun run lint:strict   # Treat lint warnings as failures
bun run lint:fix      # Apply safe lint fixes
bun run format        # Format with oxfmt
bun run format:check  # Check formatting without writing
bun run doctor        # Run React Doctor (blocking on errors)
bun typecheck  # Run TypeScript check
```

## API Integration

The template is configured to work with a Django API backend (like [django-api-starter](https://github.com/yourusername/django-api-starter)).

### Development Proxy

In development, API requests to `/api/*` are proxied to `http://localhost:8000` (see `vite.config.ts`).

### Production

Set the `VITE_API_URL` environment variable to your API URL:

```env
VITE_API_URL=https://api.example.com
```

## Authentication

The template includes a complete authentication flow:

- Login with email/password
- User registration
- JWT token management with auto-refresh
- Protected routes
- Auth context with `useAuth()` hook

Login and registration use React Hook Form with Zod validation, associated inline
errors, and real backend submissions. Registration signs in only after the API
succeeds. Protected-route redirects preserve pathname, query, and fragment when
returning from sign-in, and rejected refreshes clear auth before router navigation.

The existing backend returns bearer JWTs; access and refresh tokens remain in
`localStorage` so reloads preserve sessions. React Doctor's web-storage warning
is intentionally visible: JavaScript-readable tokens are vulnerable to XSS.
Do not deploy untrusted scripts; apply a restrictive CSP and sanitize untrusted
content. A backend-issued Secure/HttpOnly/SameSite cookie flow is the preferred
production model, but requires coordinated backend changes rather than a
frontend-only storage swap.

## UI Components

The template includes a set of reusable UI components in `src/components/ui/`:

```typescript
import { Button, Input, Card, Alert, Badge, Spinner } from '@/components/ui'

// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="danger">Danger</Button>
<Button loading>Loading...</Button>

// Input with validation
<Input label="Email" error="Invalid email" helperText="We'll never share your email" />

// Card components
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>Card content goes here</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>

// Alert variants
<Alert variant="success" title="Success!">Operation completed.</Alert>
<Alert variant="error" dismissible onDismiss={() => {}}>Something went wrong.</Alert>

// Badge
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>

// Loading spinner
<Spinner size="lg" />
```

## Styling

Uses TailwindCSS with custom utility classes defined in `src/index.css`:

- `.btn` - Base button styles
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-outline` - Outlined button
- `.input` - Form input styles
- `.label` - Form label styles

The editable warm-paper theme, responsive home composition, dark-mode behavior, and accessibility
rules are documented in [DESIGN.md](./DESIGN.md). Change the semantic tokens in `src/index.css`
and the primary palette in `tailwind.config.js` before introducing one-off colors.

Tool versions are pinned in `package.json` and listed in [DEPENDENCIES.md](./DEPENDENCIES.md).
The Oxc VS Code extension (`oxc.oxc-vscode`) provides lint diagnostics and format-on-save.
`.oxlintrc.json` enables the built-in TypeScript, React, and JSX accessibility plugins, including
Rules of Hooks and exhaustive dependencies. Generated output is excluded from both tools.

## Customization

### Adding New Pages

1. Create a new page component in `src/pages/`
2. Add the route in `src/App.tsx`

### Adding API Endpoints

Use the `api` instance from `src/lib/api.ts`:

```typescript
import { api } from '@/lib/api'

const fetchUsers = async () => {
  const { data } = await api.get('/users')
  return data
}
```

### TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
})
```

## Deployment

### Build

```bash
bun run build
```

The output will be in the `dist/` directory.

### Deploy

Deploy the `dist/` directory to any static hosting:

- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

## License

MIT
