---
applyTo: "src/shared/**"
---

# Shared contracts

Code in `src/shared/` is imported by **both** the Bun main process and the React webview.

## Rules

- Keep modules **pure** — no React, no Electrobun APIs, no filesystem side effects (except where explicitly needed and tested, e.g. config parsing).
- RPC schema and domain types live in `types.ts` (`MainRPC`, `AppState`, `Repository`, `Worktree`).
- When adding RPC messages, update **both** `src/bun/rpc.ts` and `src/mainview/rpc.ts` handlers.
- Main process imports via relative paths; webview via `@shared/*`.

## Tests

Colocate `*.test.ts` for parsers and pure helpers (`config.ts`, `equality.ts`, etc.).

Run: `bun test src/shared` and `bun run typecheck`.
