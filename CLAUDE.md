@AGENTS.md

## Claude Code notes

- Before writing Next.js code, read the matching guide under `node_modules/next/dist/docs/01-app/` (this Next.js version differs from training data).
- After changes, run `npm run lint && npm run typecheck && npm test && npm run build`. For UI work also check `/ui` (component gallery) and the pages in `npm run dev`.
- To test auth end to end, run `../api.nearplate` (its `.env` points CORS and magic links at :3400) and read the magic link from its log when `RESEND_API_KEY` is unset.
- Write tests first for new logic (Vitest, `*.test.ts(x)` beside the source).
- Do not reintroduce shadcn artifacts (`components.json`, `cva`, `--primary`-style variables). The design system is Nuxt UI-style; see "Design system" in `AGENTS.md`.
