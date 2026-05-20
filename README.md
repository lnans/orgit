# Orgit

Desktop Git workspace manager built with [Electrobun](https://electrobun.dev), React, and Tailwind.

Orgit scans a workspace folder for Git repository roots, lists linked worktrees per repo, and shows diff stats against the main branch’s committed state.

## Commands

```bash
bun install
bun run dev:hmr   # Vite HMR (5173) + Electrobun dev — recommended
bun run dev       # Electrobun dev without HMR
bun test          # Unit tests (parsers, persistence, reconcile)
bun run fmt       # Prettier
```

## Architecture

Electrobun runs two sides:

- **Main process (`src/bun/`)** — Owns app state, reads/writes disk, runs Git. Source of truth.
- **Webview (`src/mainview/`)** — React UI. Mirrors state via RPC; never touches Git or the filesystem directly.

**Vite** builds the webview to `dist/`; **Electrobun** bundles the main process and copies views for production (`electrobun.config.ts`).

### Principles

1. **Main owns state** — Selections and the repository list live in Bun. The Zustand store only applies `syncAppState` snapshots.
2. **Feature folders** — Each domain exposes a small `index.ts`; implementation splits into sibling files as it grows.
3. **Reconcile after every mutation** — Invalid repo/worktree selections are dropped when the scan result changes.
4. **Persist user choices only** — `~/.config/orgit/state.json` stores workspace path and selections; `repositories` are always rescanned.

### Workspace on disk

| Path                         | Purpose                               |
| ---------------------------- | ------------------------------------- |
| `~/.config/orgit/state.json` | Persisted state (versioned)           |
| `~/.config/orgit/workspace/` | Default folder scanned for repo roots |

A **repository** is a direct child of the workspace whose `.git` is a **directory** (root checkout, not a linked worktree). Each **worktree** entry is a linked checkout; diff stats compare that checkout to main’s committed `HEAD`.

## Project layout

```
src/
├── shared/                      # Contracts (main + UI)
│   ├── types.ts                 # AppState, Repository, Worktree, MainRPC
│   ├── selection.ts             # getSelectedWorktreePath
│   └── equality.ts              # shallowEqualRecord
│
├── bun/                         # Main process
│   ├── index.ts                 # Entry → startApp()
│   ├── app.ts                   # RPC wiring, window, startup scans
│   ├── window.ts                # BrowserWindow (dev server or packaged view)
│   ├── rpc.ts                   # RPC handlers + syncAppState push
│   ├── lib/
│   │   └── map-with-concurrency.ts
│   └── features/
│       ├── app-state/
│       │   ├── index.ts         # createAppState() — public API
│       │   ├── paths.ts         # CONFIG_DIR, STATE_FILE, DEFAULT_WORKSPACE
│       │   ├── persistence.ts   # Load/save/migrate state.json
│       │   └── reconcile.ts     # Validate selections vs repositories
│       └── repositories/
│           ├── index.ts         # listRepositories
│           ├── scan.ts          # Workspace scan (parallel, async)
│           ├── git/
│           │   ├── run.ts       # runGit, runGitAsync, GitResult
│           │   └── repo.ts      # isRepositoryRoot, getCurrentBranch, …
│           └── worktrees/
│               ├── index.ts     # listWorktrees
│               ├── parse-porcelain.ts
│               └── diff-stats.ts
│
└── mainview/                    # React UI (Vite root)
    ├── main.tsx, App.tsx
    ├── rpc.ts                   # Webview RPC + mainProcess helpers
    ├── store.ts                 # Zustand mirror of AppState
    ├── lib/                     # i18n, utils
    ├── locales/
    ├── components/ui/           # shadcn-style primitives
    └── features/
        ├── repositories/        # Repository sidebar menu
        └── worktrees/           # Worktree sidebar menu
```

## Data flow

```
UI click → store.select* → mainview/rpc → bun/rpc → app-state → syncAppState → store.syncAppState → UI
```

### RPC messages (`shared/types.ts`)

| Direction      | Message                 | Purpose                  |
| -------------- | ----------------------- | ------------------------ |
| Webview → Main | `onSelectRepository`    | Change selected repo     |
| Webview → Main | `onSelectWorktree`      | Change selected worktree |
| Webview → Main | `onDoubleClickTitleBar` | Toggle maximize          |
| Main → Webview | `syncAppState`          | Push full `AppState`     |

### Startup (`app.ts`, on `dom-ready`)

1. **`initialize()`** — Fast scan: repos + worktrees **without** diff stats (zeros).
2. **`refreshRepositories()`** — Full scan: computes per-worktree line/file stats (heavier Git work).

Both steps call `syncAppState` so the UI paints quickly, then updates with stats.

### App state API (`createAppState`)

| Method                    | Description                            |
| ------------------------- | -------------------------------------- |
| `initialize()`            | Fast repository scan                   |
| `refreshRepositories()`   | Full scan with diff stats              |
| `selectRepository(path?)` | Select/clear repo; reconcile + persist |
| `selectWorktree(path?)`   | Select/clear worktree for current repo |

Internal flow: `applyState` → `reconcileAppState` → persist if `workspacePath`, `selectedRepositoryPath`, or `selectedWorktreePaths` changed.

## Imports

| Context           | Shared                                       | Local       |
| ----------------- | -------------------------------------------- | ----------- |
| `src/bun/**`      | Relative paths, e.g. `../../../shared/types` | Relative    |
| `src/mainview/**` | `@shared/*` (Vite)                           | `@client/*` |

Bun does not resolve `tsconfig` path aliases at runtime.

## Adding a feature

1. **Shared** — Types and RPC in `src/shared/types.ts` if the UI needs new messages.
2. **Main** — `src/bun/features/<domain>/` with `index.ts` as the public API; wire in `app.ts` and `bun/rpc.ts`.
3. **UI** — `src/mainview/features/<domain>/`; actions call `mainProcess.*` from `rpc.ts`, read state from `store.ts`.
4. **Tests** — Colocated `*.test.ts`; run with `bun test`.

Do not duplicate Git or filesystem logic in the webview.

## App icon on macOS

```
xcode-select --install
sudo xcodebuild -license accept
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```
