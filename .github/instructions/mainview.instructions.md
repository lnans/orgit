---
applyTo: "src/mainview/**"
---

# React webview (mainview)

You are editing the **Electrobun webview** — a Vite-built React app.

## Rules

- Never run Git commands or access the filesystem directly. Call `mainProcess.*` from `@client/rpc`.
- Use `@client/*` and `@shared/*` imports. No relative paths that reach outside mainview conventions.
- Import other features via `@client/features/<domain>` (public `index.ts`), not deep internal paths.
- **Pure leaf components** take props only. Containers wire Zustand and RPC.
- Do not modify `components/ui/` except for shadcn regeneration — no app logic there.
- User-visible strings go in `locales/en.json` (react-i18next).

## State

- Global app mirror: `store.ts` (selections, repositories) — updated only by `syncAppState`.
- Config mirror: `store/config-store.ts` — terminal theme/font from `syncAppConfig`.
- Feature stores: e.g. `features/terminal/store.ts` (tabs), `features/logs/store.ts` (panel UI).

## Terminal feature

- xterm setup lives in `features/terminal/lib/` (`create-xterm.ts`, `fit-terminal.ts`, `viewport.ts`).
- `use-terminal-session` orchestrates xterm lifecycle + RPC attach/resize; keep it thin.
- Inactive tabs stay mounted (scrollback preserved); only the active tab attaches to the PTY.

## Tests

Colocate `*.test.ts` under `lib/` or next to hooks. Mock xterm internals when testing viewport helpers.

Run: `bun test src/mainview` and `bun run typecheck`.
