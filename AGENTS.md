# AGENTS.md

Guidance for LLMs working in the Orgit repository.

## What this project is

Orgit is a **desktop Git workspace manager**: scan a folder for repositories and linked worktrees, show change stats, and run integrated terminals per checkout. It is a native app built with [Electrobun](https://electrobun.dev) (Bun main process + embedded webview).

**Primary platform:** macOS. Other platforms may work but are not the focus.

## Architecture

```
┌─────────────────────────────────────┐
│  src/mainview/  (React UI)          │  ← Vite, Tailwind, xterm.js
│  @/client/*                         │
└────────────── RPC / webview ────────┘
┌─────────────────────────────────────┐
│  src/bun/  (main process)           │  ← Git, filesystem, logging, state
│  @/server/*                         │
└─────────────────────────────────────┘
         ▲
         │ shared DTOs & utils
┌────────┴────────┐
│  src/shared/    │
│  @/shared/*     │
└─────────────────┘
```

**Security rule:** Git commands and disk access belong in `src/bun/` only. The UI in `src/mainview/` should stay thin and call into the main process — do not run `git` or read the workspace from the webview.

User data lives under Electrobun’s `<userDataPath>/orgit/` (workspace folder, `state.json`, logs). See `src/bun/constants.ts`.

## Directory layout

| Path | Role |
|------|------|
| `src/bun/` | Main process entry (`index.ts`), window setup, features (logger, fs, app state) |
| `src/mainview/` | React app (Vite root), styles, UI components |
| `src/shared/types/` | DTOs shared between processes (`RepositoryDto`, `WorktreeDto`, `AppStateDto`) |
| `tests/` | Bun tests; `tests/test-setup.ts` preloads fs mocks |
| `electrobun.config.ts` | App metadata, build copy from `dist/` to `views/mainview/` |

## Path aliases

| Alias | Maps to | Used in |
|-------|---------|---------|
| `@/server/*` | `src/bun/*` | Main process, tests |
| `@/client/*` | `src/mainview/*` | UI (also `@/client` in Vite) |
| `@/shared/*` | `src/shared/*` | Both sides |
| `@/tests` | `tests/test-mocks` | Tests only |

## Commands

```bash
bun install              # install dependencies
bun run dev:hmr          # dev with Vite HMR + Electrobun (preferred)
bun run dev              # Electrobun watch only
bun run test             # run tests
bun run typecheck        # tsc --noEmit
bun run fmt              # Biome format + lint fix
bun run validate         # fmt + typecheck + test (run before finishing work)
bun run build:canary     # production build (canary channel)
```

## Code conventions

- **TypeScript** with `strict: true`. No unused locals/parameters.
- **Formatting:** Biome — tabs for TS/JS, double quotes, organize imports on save via `bun run fmt`.
- **Errors in main-process I/O:** Use the `Result<T>` discriminated union in `src/bun/types/server.types.ts` (`isSuccess` / `isError`). Prefer `FsManager` for file operations that should return `Result`; check existing patterns in `src/bun/features/`.
- **UI stack:** React 19, Tailwind CSS 4, shadcn/ui (`components.json` — aliases under `@/client/components`). xterm.js for terminals when implemented.
- **State:** Zustand and react-i18next are dependencies; follow existing patterns when adding UI state.

Keep changes **small and focused**. Match naming, imports, and structure of neighboring files. Do not add comments for obvious code.

## Testing

- **Runner:** Bun (`bun test`). Config in `bunfig.toml`; tests live under `tests/`.
- **Setup:** `tests/test-setup.ts` mocks `node:fs` globally; use `NODE_FS_MOCK` from `@/tests`.
- **Coverage:** 80% threshold (`bun run coverage`).
- **Style:** Describe blocks per class/feature; assert `Result` with `isSuccess` / `isError` narrowing (see `tests/bun/features/fs-manager.test.ts`).

Add tests for non-trivial main-process logic. Skip tests that only restate types or trivial getters.

## Current state (for context)

The README describes the full product vision. Implementation is **incremental**:

- Main process: window bootstrap, logging, filesystem wrapper, app state manager exist.
- UI: `src/mainview/main.tsx` is still a minimal shell; sidebar, worktrees, and terminals are not wired up yet.
- RPC / bridge between webview and Bun is not yet established in the codebase — design new APIs in `src/bun/` and expose them to the UI when adding features.

When implementing a feature, prefer extending existing managers (`FsManager`, `AppStateManager`, `Logger`) over new abstractions unless the scope clearly requires it.

## What to avoid

- Running Git or filesystem access from `src/mainview/`.
- Large refactors or new frameworks without being asked.
- Committing unless the user explicitly requests it.
- Editing unrelated files, generated `dist/`, or `node_modules/`.
- Adding markdown docs the user did not ask for.

## Useful references

- [README.md](./README.md) — product overview and getting started
- [electrobun.config.ts](./electrobun.config.ts) — build and app identity
