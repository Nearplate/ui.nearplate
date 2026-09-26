# ui.nearplate

NearPlate frontend: Next.js (App Router), React 19, Tailwind CSS 4, and a Nuxt UI-style design system.

## Getting started

```bash
cp .env.example .env.local   # point API_BASE_URL at api.nearplate
npm install
npm run dev        # http://localhost:3400
```

The API must allow `http://localhost:3400` as its CORS origin and magic-link base URL (its default).

| Script | Purpose |
| --- | --- |
| `npm test` | Vitest |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run format` / `format:check` | Prettier |

## Project structure

```
app/                  routing: layouts, pages
components/ui/        design-system primitives
components/layout/    header, footer, bento grid
features/auth/        API client, server actions, session, forms
proxy.ts              token refresh + route gating
hooks/  lib/  config/  types/
```

See [AGENTS.md](./AGENTS.md) for responsibilities and design-system rules.

## Design system

Semantic colors (`primary`, `secondary`, `success`, `info`, `warning`, `error`, `neutral`) and `--ui-*` tokens in `app/globals.css`, following Nuxt UI naming. Components take `color`, `variant` and `size`:

```tsx
import { Button } from "@/components/ui/button"

<Button color="primary" variant="soft" size="lg">Order now</Button>
```

## Docker

```bash
docker build -t ui-nearplate .
docker run --rm -p 3400:3000 -e API_BASE_URL=http://host.docker.internal:3000/v1 ui-nearplate
```
