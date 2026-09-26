<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ui.nearplate

Frontend for NearPlate. Next.js (App Router) + React 19 + Tailwind CSS 4, styled with a **Nuxt UI-style design system** (semantic colors, `--ui-*` tokens, `color` / `variant` / `size` component API). It is a React port of Nuxt UI's design language, not the Nuxt UI library itself (which is Vue-only).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build (`output: "standalone"`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` / `format:check` | Prettier write / check |

Definition of done: `lint`, `typecheck`, `format:check` and `build` all pass.

## Structure and responsibilities

| Path | Owns |
| --- | --- |
| `app/` | Routing only: layouts, pages, route handlers. Keep thin; compose components. |
| `components/ui/` | Design-system primitives (Button, Badge, Card, Input, ...). No business logic or data fetching. |
| `components/providers/` | Client-side context providers (theme). |
| `features/<domain>/` | Domain modules: their own components, hooks, api, types. Not created until needed. |
| `hooks/` | Shared, domain-agnostic React hooks. |
| `lib/` | Pure utilities (`cn`) and theme constants (`lib/theme`). |
| `config/` | Static app configuration (`site.ts`). |
| `types/` | Shared TypeScript types. |

## Design system

- Style with **semantic tokens only**: `bg-default`, `bg-elevated`, `text-muted`, `text-highlighted`, `border-accented`, `bg-primary`, `text-error`, ... Never use raw palette classes (`bg-slate-800`) or hex values in components.
- Tokens live in `app/globals.css` (`--ui-*`, light in `:root`, dark in `.dark`). To re-theme, change the palette aliases there.
- Each component defines its theme with `tailwind-variants` (`tv`) next to the component, exposing `color`, `variant`, `size`. Colors set a CSS variable (e.g. `--btn-color`) so variants are written once. Export the theme (`buttonTheme`) and prop types.
- Merge classes with `cn()` from `@/lib/utils`; the consumer's `className` always goes last.
- Colors and variants are enumerated in `lib/theme/colors.ts`.
- Dark mode is class-based via `next-themes` (press `d` to toggle in the app).

## Conventions

- Server Components by default; add `"use client"` only for state, effects or browser APIs.
- Named exports, `@/` absolute imports, no `index.ts` barrels.
- Immutable updates; no `console.log`; validate external input at boundaries.
- Commit format: `<type>: <description>` (feat, fix, refactor, docs, test, chore, perf, ci).

## Delivery

- CI (`.github/workflows/ci.yml`): quality (lint, typecheck, format) -> build, plus a Docker image build.
- `Dockerfile`: multi-stage, Node 22 alpine, standalone output, non-root user, healthcheck. Build with `docker build -t ui-nearplate .`.
