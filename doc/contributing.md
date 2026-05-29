# Contributing features

Do not duplicate Git or filesystem logic in the webview.

1. **Shared** — Types and RPC in `src/shared/types.ts` if the UI needs new messages.
2. **Main** — `src/bun/features/<domain>/` with `index.ts` as the public API; wire in `app.ts` and `bun/rpc.ts`.
3. **UI** — `src/mainview/features/<domain>/` with `index.ts`, pure components, and containers; actions call `mainProcess.*` from `rpc.ts`.
4. **Tests** — Colocated `*.test.ts`; run with `bun test`.

See also [Architecture](./architecture.md) and [Project structure](./project-structure.md).
