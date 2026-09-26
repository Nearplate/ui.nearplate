@AGENTS.md

## Claude Code notes

- Before writing Next.js code, read the matching guide under `node_modules/next/dist/docs/01-app/` (this Next.js version differs from training data).
- After UI changes, run `npm run lint && npm run typecheck && npm run build`, and check the demo page (`npm run dev`) in light and dark mode.
- Do not reintroduce shadcn artifacts (`components.json`, `cva`, `--primary`-style variables). The design system is Nuxt UI-style; see "Design system" in `AGENTS.md`.
