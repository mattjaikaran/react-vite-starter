# Design guide

This is the authoritative repository-local guide for applying a new visual design. Update it before changing the interface; use the existing React Router layout and shared primitives rather than introducing another component system. The starter feels like an open notebook, not a finished marketing site. Light mode retains warm paper and mint/coral editorial accents; dark mode uses a pure-black canvas, neutral surfaces, and monochrome actions. Do not invent customers, statistics, or backend data.

## Design brief

Fill in or revise these decisions for each new design before implementation:

- **Direction:** intended audience, personality, reference imagery, and what to avoid. Current direction: useful, quiet, open-notebook starter.
- **Colors:** canvas, surfaces, text, borders, actions, focus, and semantic feedback in both appearances. Current palette is below; dark canvas stays pure black and actions stay monochrome.
- **Typography:** font stack, heading/body scale, weights, line heights, and hierarchy. Current: system sans-serif, fluid 40–66px hero, 18px supporting copy, tight heading tracking.
- **Layout:** content widths, spacing, grids, mobile reflow, and authenticated navigation. Current: 1200px content, two-column hero above 900px, two-column features below 900px, one column below 600px, 20px mobile margins.
- **Interactions:** hover, focus, loading, validation, disabled states, reduced motion, and keyboard behavior. Current: underlined links, visible focus, real account submissions, quiet transitions, no entrance animation.

## Source edit map

| Source                                                                                                                                                                                     | Responsibility                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/index.css`                                                                                                                                                                            | Semantic tokens, page canvas, shell/account/home composition, typography, breakpoints, focus, reduced motion, resolved-dark mappings for legacy gray/white utilities |
| `tailwind.config.js`                                                                                                                                                                       | Neutral `primary` scale; action/focus shades refer to the CSS action tokens                                                                                          |
| `src/lib/theme.ts`                                                                                                                                                                         | Shared resolved appearance, OS listener, explicit localStorage preference, DOM `data-theme`, direct toggle                                                           |
| `src/components/Layout.tsx`                                                                                                                                                                | Brand, navigation, shared appearance button for public and authenticated routes, skip link, footer                                                                   |
| `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Card.tsx`, `src/components/ui/Badge.tsx`, `src/components/ui/Alert.tsx`, `src/components/ui/Spinner.tsx` | Existing primitives: action contrast, forms, surfaces, status feedback, loading                                                                                      |
| `src/components/ui/Image.tsx`                                                                                                                                                              | Existing keyed image loading, placeholder, and fallback behavior; preserve its lifecycle                                                                             |
| `src/pages/HomePage.tsx`                                                                                                                                                                   | Hero copy, authentication-aware actions, checklist, feature data, closing account link                                                                               |
| `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`                                                                                                                                    | Account forms and feedback; React Hook Form/Zod validation and real backend submission                                                                               |
| `src/pages/DashboardPage.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/NotFoundPage.tsx`                                                                                                   | Signed-in compositions and error route; audit legacy utility classes here                                                                                            |
| `src/App.tsx`, `src/components/ProtectedRoute.tsx`, `src/lib/auth.tsx`                                                                                                                     | Existing routing/authentication contract, not a design replacement target                                                                                            |
| `e2e/home.spec.ts`, `e2e/navigation.spec.ts`, `e2e/auth.spec.ts`                                                                                                                           | Existing browser regression coverage; update affected expectations without introducing a new suite                                                                   |

## Palette and appearance invariant

| Token               | Light     | Dark      | Purpose                              |
| ------------------- | --------- | --------- | ------------------------------------ |
| `--paper`           | `#f7f5ef` | `#000000` | Page canvas                          |
| `--surface`         | `#fffefa` | `#171717` | Cards and forms                      |
| `--ink`             | `#20251f` | `#f5f5f5` | Primary text                         |
| `--muted`           | `#62675e` | `#a3a3a3` | Supporting text                      |
| `--line`            | `#dedfd5` | `#404040` | Borders                              |
| `--action`          | `#262626` | `#e5e5e5` | Actions, links, emphasis, focus      |
| `--action-contrast` | `#ffffff` | `#171717` | Filled action labels                 |
| `--action-hover`    | `#404040` | `#ffffff` | Action hover                         |
| `--mint`            | `#e2eee5` | `#262626` | Secondary surfaces/checklist markers |
| `--coral`           | `#f6d9ca` | `#303030` | Editorial note/feedback surface      |

The historical `mint` and `coral` names identify editorial roles, not colored dark surfaces. Semantic success/warning/error feedback may remain distinct; do not reintroduce blue as the action or focus theme.

With no valid `localStorage.theme` value, `src/lib/theme.ts` follows `prefers-color-scheme`, including changes while the app is open. A direct toggle stores only `light` or `dark`; that explicit choice overrides the OS and survives reload. The only visible control switches directly to the opposite appearance; never add a third System option. The module applies `html[data-theme]` before React renders. CSS `color-scheme` and legacy dark utility mappings follow that resolved attribute, not unconditional OS media queries. All routes share this resolution.

## Applying a new design

1. Update this design brief, palette, composition rules, and source map with the intended design. Keep the appearance invariant above unchanged.
2. Edit semantic tokens in `src/index.css` for both appearances, then align `tailwind.config.js`. Start with canvas/surface/text/action contrast; avoid page-local hardcoded theme colors.
3. Update the existing primitives in `src/components/ui/`. Inspect default, hover, keyboard focus, disabled, loading, validation, and feedback states in both appearances. Keep Button action labels using `--action-contrast`.
4. Apply compositions in `src/components/Layout.tsx` and the mapped pages. Preserve real router links, backend behavior, headings, labels, and authentication-aware navigation. Update legacy utility mappings only against resolved `data-theme`.
5. Adjust responsive rules in `src/index.css`. Keep long emails usable, prevent horizontal overflow, retain a reachable appearance control, and preserve the skip link/main landmark and reduced-motion behavior.
6. Update affected existing regression expectations. Run the local gates below; record actual results rather than claiming success from source inspection.
7. Perform actual browser visual checks below, revise any contrast/layout/state failures, and update this guide when the final design differs from the brief.

## Local verification commands

Use the existing pinned toolchain; do not replace Oxlint/Oxfmt or their configuration.

```sh
bun run format:check
bun run lint:strict
bun run typecheck
bun run test
bun run check-conventions
bun run check-dependencies
bun run doctor
bun run build
bun run test:e2e
```

`bun run gauntlet` combines `lint`, `typecheck`, `test`, `check-conventions`, and `check-dependencies`; it does not include the other commands above. `bun run dev` starts Vite. `bun run preview` serves the built output. `bun run test:e2e:headed` and `bun run test:e2e:ui` are available for browser investigation. Playwright targets `http://localhost:5173` and starts `bun run dev` through its existing configuration.

## Actual visual checks

Inspect `/`, `/login`, `/register`, a missing route, and authenticated `/dashboard` and `/profile` at desktop and 375px mobile widths. Signed-in checks require a working account backend and real login credentials; configure `VITE_API_URL` or the existing development proxy. Do not report protected-route visuals from a redirected login page.

- Clear `localStorage.theme`, reload with light and dark OS preferences, and change the OS preference while open. Confirm the appearance follows it before any explicit choice.
- Use the shared button named `Switch to dark mode` or `Switch to light mode`. Confirm immediate `html[data-theme]`, CSS `color-scheme`, body canvas, form controls, and readable primary action labels. In dark mode the body is `rgb(0, 0, 0)`.
- Reload after each explicit choice, change the OS to the opposite preference, and navigate between public and signed-in routes. The chosen appearance must remain unchanged, with no System UI option.
- Inspect `.site-nav`, `.account-card`, `.starter-card`, and dashboard/profile surfaces in both appearances; check monochrome focus/actions, long email wrapping, and no horizontal overflow.
- Tab through the skip link, navigation, toggle, and forms. Check active links, labels, validation errors, loading/disabled states, and reduced motion. Capture actual desktop/mobile screenshots when judging the design; command success alone is not visual verification.
