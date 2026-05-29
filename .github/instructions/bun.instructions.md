---
applyTo: "src/bun/**"
---

# Bun main process

You are editing the Electrobun **main process** (Bun runtime). This code runs outside the browser webview.

## Rules

- Never import React or webview modules.
- Import shared code with **relative paths** (e.g. `../../../shared/types`). Bun does not resolve `@shared/*` at runtime.
- Git, filesystem, and PTY logic belong here only — never duplicate in `src/mainview/`.
- Expose each feature through `features/<domain>/index.ts`; wire handlers in `rpc.ts` and lifecycle in `app.ts`.
- Push state to the webview via RPC sync messages defined in `src/shared/types.ts` (`MainRPC`).

## Patterns

- App state: `createAppState()` in `features/app-state/` — mutate, reconcile, persist.
- Terminal: PTY sessions keyed by tab UUID from the webview; manager in `features/terminal/`.
- Config: watch `~/.config/orgit/config.json`, push `syncAppConfig`.
- Logs: tail `orgit.log` when the UI opens the log panel.

## Tests

Colocate `*.test.ts`. Prefer testing pure parsers and reconcile logic. Use `bun:test`.

Run: `bun test src/bun` and `bun run typecheck`.
