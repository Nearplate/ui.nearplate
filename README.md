# ui.nearplate

NearPlate frontend: Next.js (App Router), React 19, Tailwind CSS 4, and a Nuxt UI-style design system.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run format` / `format:check` | Prettier |

## Project structure

```
app/                  routing: layouts, pages
components/ui/        design-system primitives
components/providers/ context providers
features/             domain modules
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
docker run --rm -p 3000:3000 ui-nearplate
```
