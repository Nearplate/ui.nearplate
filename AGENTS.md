<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ui.nearplate

Frontend for NearPlate. Next.js (App Router) + React 19 + Tailwind CSS 4, styled with a **Nuxt UI-style design system** (semantic colors, `--ui-*` tokens, `color` / `variant` / `size` component API). It is a React port of Nuxt UI's design language, not the Nuxt UI library itself (which is Vue-only).

## Commands

| Command                           | Purpose                                                                |
| --------------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`                     | Dev server on :3400 (matches the API's CORS origin and magic-link URL) |
| `npm run build`                   | Production build (`output: "standalone"`)                              |
| `npm run lint`                    | ESLint                                                                 |
| `npm run typecheck`               | `tsc --noEmit`                                                         |
| `npm test`                        | Vitest + Testing Library                                               |
| `npm run format` / `format:check` | Prettier write / check                                                 |

Definition of done: `lint`, `typecheck`, `format:check`, `test` and `build` all pass.

Environment: copy `.env.example`. `API_BASE_URL` (default `http://localhost:3030/v1`) points at `../api.nearplate`. Google sign-in needs no client-side config: the API holds the OAuth client id/secret and redirects the browser directly.

## Structure and responsibilities

| Path                 | Owns                                                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`               | Routing only: layouts, pages, route handlers. Keep thin; compose components.                                                                                   |
| `components/ui/`     | Design-system primitives (Button, Badge, Card, Input, ...). No business logic or data fetching.                                                                |
| `app/(site)/`        | Pages with the site header/footer (home, account, onboarding). `app/(auth)/` is the split-screen auth shell; `app/(dev)/ui` is a component gallery (dev only). |
| `components/layout/` | App shell pieces (header, footer, bento grid).                                                                                                                 |
| `features/<domain>/` | Domain modules: their own components, hooks, api, types. `features/auth` holds the API client, server actions, session cookies and forms.                      |
| `proxy.ts`           | Next 16 proxy (formerly middleware): refreshes an expired access token and gates `/account`, `/onboarding`. Optimistic only.                                   |
| `test/`              | Vitest setup. Tests live next to the code as `*.test.ts(x)`.                                                                                                   |
| `hooks/`             | Shared, domain-agnostic React hooks.                                                                                                                           |
| `lib/`               | Pure utilities (`cn`) and theme constants (`lib/theme`).                                                                                                       |
| `config/`            | Static app configuration (`site.ts`).                                                                                                                          |
| `types/`             | Shared TypeScript types.                                                                                                                                       |

## Design system

- Style with **semantic tokens only**: `bg-default`, `bg-elevated`, `text-muted`, `text-highlighted`, `border-accented`, `bg-primary`, `text-error`, ... Never use raw palette classes (`bg-slate-800`) or hex values in components.
- Tokens live in `app/globals.css` (`--ui-*`). To re-theme, change the palette aliases there.
- Look: **compact brutalist**. Light mode only, neutral (near-black) primary on a paper background, square corners (`--ui-radius: 0`), 2px black borders, no soft shadows. `bg-highlight` (lime) is the single accent; use it sparingly. Display type is `font-display` (Anton, uppercase), labels and buttons are `font-mono` uppercase.
- Each component defines its theme with `tailwind-variants` (`tv`) next to the component, exposing `color`, `variant`, `size`. Colors set a CSS variable (e.g. `--btn-color`) so variants are written once. Export the theme (`buttonTheme`) and prop types.
- Merge classes with `cn()` from `@/lib/utils`; the consumer's `className` always goes last.
- Colors and variants are enumerated in `lib/theme/colors.ts`.

## Auth (api.nearplate)

- The browser never sees tokens. Server actions call the API server-to-server (`lib/api/client.ts`) and store `np_at` (access), `np_rt` (refresh) and `np_guest` in httpOnly cookies.
- Supported: magic link (`/auth`, landing `/auth/magic?token=` posts the token from JS so link scanners can't burn it), Google via Authorization Code + PKCE (`startGoogleAction` redirects to `GET /auth/google`, then `app/(auth)/auth/google/callback/route.ts` posts to `POST /auth/google/verify`), guest, refresh (in `proxy.ts`), logout, `/users/me` read and update, onboarding.
- API errors are only `{statusCode}`; map status codes to messages in `features/auth/actions.ts`.
- Signup role (`user` | `restaurant`) is chosen on `/auth`; `admin` is never sent.

## Conventions

- Server Components by default; add `"use client"` only for state, effects or browser APIs.
- Named exports, `@/` absolute imports, no `index.ts` barrels.
- Immutable updates; no `console.log`; validate external input at boundaries.
- Commit format: `<type>: <description>` (feat, fix, refactor, docs, test, chore, perf, ci).

## Delivery

- CI (`.github/workflows/ci.yml`): quality (lint, typecheck, format, test) -> build, plus a Docker image build.
- `Dockerfile`: multi-stage, Node 22 alpine, standalone output, non-root user, healthcheck. Build with `docker build -t ui-nearplate .`.
