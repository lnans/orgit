# Orgit — GitHub Copilot instructions

Orgit is a desktop Git workspace manager built with **Electrobun**, **Bun**, **React 19**, and **Tailwind 4**.

## Project overview

- **Main process** (`src/bun/`): owns app state, Git, filesystem, PTY terminals. Source of truth.
- **Webview** (`src/mainview/`): React UI. Mirrors state via RPC; never runs Git or touches disk directly.
- **Shared** (`src/shared/`): cross-process types, RPC schema (`MainRPC`), config parsing, pure helpers.

Vite builds the webview to `dist/`. Electrobun bundles the main process and copies views for production.

## Commands

Always prefer these before suggesting alternatives:

```bash
bun install
bun run dev:hmr      # Vite HMR (5173) + Electrobun — use for local dev
bun run dev          # Electrobun only, no HMR
bun test             # unit tests (bun:test)
bun run typecheck    # tsc --noEmit
bun run fmt          # biome check --write .
bun run build:canary # vite build && electrobun build
```

## Coding standards

- **Formatter/linter**: Biome — tabs, double quotes. Run `bun run fmt` before finishing.
- **TypeScript**: strict mode. Fix type errors; do not use `any` unless unavoidable.
- **Tests**: colocate `*.test.ts` next to the module. Use `bun:test`. Test pure `lib/` functions; mock xterm internals when needed.
- **Commits**: conventional, concise, focused on *why*.

## Architecture rules

1. Main owns persisted state (`~/.config/orgit/state.json`) and config (`config.json`).
2. UI mutations go through RPC → main → `syncAppState` / `syncAppConfig` / terminal+log sync messages.
3. Reconcile selections after every repository scan (`reconcileAppState`).
4. Feature folders expose a small public `index.ts`; keep implementation in sibling files.

### Feature folder layout (mainview and bun)

```
features/<domain>/
  index.ts
  components/
  hooks/
  store.ts      # feature-local Zustand (webview only, when needed)
  lib/          # pure functions — preferred place for testable logic
  *.test.ts
```

## React (mainview)

- **Pure components**: leaf UI receives data + callbacks via props.
- **Containers**: read Zustand / call RPC, pass props to pure children.
- **Imports**: `@client/*`, `@shared/*`. Cross-feature imports via `@client/features/<domain>`.
- **Do not** put business logic in `components/ui/` (shadcn-generated primitives).
- **i18n**: user-facing strings in `src/mainview/locales/en.json`.

## Bun main process

- Import `shared/` with relative paths (no tsconfig aliases at runtime).
- Git and filesystem code stays under `src/bun/features/repositories/` and related modules.
- Wire new RPC handlers in `src/bun/rpc.ts` and `src/mainview/rpc.ts`; update `MainRPC` in `src/shared/types.ts`.

## Adding a feature (checklist)

1. Types + RPC messages in `src/shared/types.ts` if the UI needs new main↔webview messages.
2. Main implementation in `src/bun/features/<domain>/index.ts`; register in `app.ts` and `rpc.ts`.
3. UI in `src/mainview/features/<domain>/index.ts`; actions via `mainProcess.*`.
4. Colocated tests + `bun test` + `bun run typecheck`.

## References

- Full layout and RPC table: `README.md`
- Cursor-specific rules: `.cursorrules`, `.cursor/rules/orgit-architecture.mdc`
