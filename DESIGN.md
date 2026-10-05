# Design direction

A useful starter should feel like an open notebook, not a finished marketing template. This interface uses warm paper, quiet ink, a clear cobalt action color, and mint/coral accents. The home page is an actual entry point to the existing account and dashboard routes; it does not invent usage statistics, customers, or backend data.

## Edit map

- `src/index.css`: semantic color tokens, layout, typography, responsive rules, focus treatment, dark scheme, reduced motion.
- `tailwind.config.js`: the cobalt `primary` scale shared by existing buttons and forms.
- `src/pages/HomePage.tsx`: hero copy, authentication-aware calls to action, starter checklist, feature data, and closing account link.
- `src/components/Layout.tsx`: brand, navigation, account actions, skip link, footer.
- `src/components/ui/`: keep using the existing Button, Badge, Card, Input, Alert, and Spinner primitives. The home page reuses Card and Badge instead of introducing a second component system.
- `src/components/ui/Image.tsx`: each requested source starts its own keyed loading lifecycle, resetting placeholder and fallback state without mutating refs during render.
- Login and registration reuse semantic account surfaces, text, links, and feedback tokens in both schemes. React Hook Form and Zod own field validation and submission state; success comes from the real account backend, not a demo handler.

## Palette

| Token       | Light     | Dark      | Purpose                                  |
| ----------- | --------- | --------- | ---------------------------------------- |
| `--paper`   | `#f7f5ef` | `#171c1a` | Page canvas                              |
| `--surface` | `#fffefa` | `#222925` | Cards and forms                          |
| `--ink`     | `#20251f` | `#f2f1e9` | Primary text                             |
| `--muted`   | `#62675e` | `#b7beb5` | Supporting copy                          |
| `--line`    | `#dedfd5` | `#414b43` | Quiet separators                         |
| `--cobalt`  | `#334bcc` | `#a5b4fc` | Links, emphasis, focus                   |
| `--mint`    | `#e2eee5` | `#293e32` | Checklist markers and secondary surfaces |
| `--coral`   | `#f6d9ca` | `#563a30` | Closing editorial note                   |

Filled primary buttons retain a dark cobalt background and white labels in both schemes. The operating-system preference selects the scheme; no persistence or theme-toggle dependency is needed. Existing gray/white surfaces in account pages receive dark-scheme mappings so the shared shell does not strand those routes in light mode.

## Composition and hierarchy

Use the system sans-serif stack; no remote font request is required. The hero has a fluid 40–66px heading, tight tracking, and readable 18px supporting copy. Eyebrows are small uppercase labels, never substitutes for headings. Content has a 1200px maximum width and generous 80px desktop opening space. The only offset shadow belongs to the starter checklist; feature cards rely on borders rather than heavy elevation.

The hero and checklist share two columns on wide screens. Below 900px they stack, and the feature grid becomes two columns. Below 600px the feature grid becomes one column, margins reduce to 20px, and account actions occupy a separate navigation row. All routes remain accessible on small screens, including dashboard, profile, login, registration, and logout.

## Interaction and accessibility

- Keep route changes as real router links; use Button for actions such as logout.
- Use one main heading, labeled sections, and semantic lists for ordered steps.
- The skip link targets the main landmark, and active navigation uses `aria-current` supplied by NavLink.
- Links and buttons have visible keyboard focus. Primary account links have at least 44px target height; ordinary text links retain underlines.
- Decorative arrows and indices are hidden from assistive technology. Status badges contain meaningful text, not color alone.
- No autoplay, parallax, or entrance animation is necessary. Reduced-motion preferences disable incidental transitions and loading motion.
- Check long account email addresses and narrow screens before changing the navigation.

## Quality tools

Oxc handles linting and formatting; React Doctor checks React health. Tool versions are pinned in `package.json` and catalogued in `DEPENDENCIES.md`. The built-in TypeScript, React, and JSX accessibility plugins are enabled, along with Rules of Hooks and exhaustive dependencies. React Compiler-only refs, purity, incompatible-library, and set-state-in-effect checks are explicitly disabled because this starter does not configure React Compiler; this is not an exemption from ordinary hooks or accessibility rules. The unrelated Unicorn empty-file restriction is also disabled to keep the migration scoped.

Before shipping, run the documented quality scripts and inspect home/account routes at mobile and desktop sizes, in both color schemes, with keyboard navigation and reduced motion.
