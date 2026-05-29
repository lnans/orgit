# Orgit

Desktop Git workspace manager built with [Electrobun](https://electrobun.dev), React, and Tailwind.

Orgit scans a workspace folder for Git repository roots, lists linked worktrees per repo, shows diff stats against the main branch's committed state, and provides integrated terminals and a log panel.

## Commands

```bash
bun install
bun run dev:hmr   # Vite HMR (5173) + Electrobun dev — recommended
bun run dev       # Electrobun dev without HMR
bun test          # Unit tests (colocated *.test.ts)
bun run fmt       # Biome format + lint
bun run typecheck # TypeScript check
```

## Architecture

Electrobun runs two sides:

- **Main process (`src/bun/`)** — Owns app state, reads/writes disk, runs Git, manages PTY sessions. Source of truth.
- **Webview (`src/mainview/`)** — React UI. Mirrors state via RPC; never touches Git or the filesystem directly.

**Vite** builds the webview to `dist/`; **Electrobun** bundles the main process and copies views for production (`electrobun.config.ts`).

### Principles

1. **Main owns state** — Selections and the repository list live in Bun. The Zustand store only applies `syncAppState` snapshots.
2. **Feature folders** — Each domain exposes a small `index.ts`; implementation splits into `components/`, `hooks/`, `lib/`, and `store.ts` as it grows.
3. **Pure components** — Leaf UI components receive data and callbacks via props; containers wire Zustand and RPC.
4. **Reconcile after every mutation** — Invalid repo/worktree selections are dropped when the scan result changes.
5. **Persist user choices only** — `~/.config/orgit/state.json` stores workspace path and selections; `repositories` are always rescanned.
6. **User preferences in config** — `~/.config/orgit/config.json` controls terminal appearance (fonts, colors). Changes reload while the app is running.

### Workspace on disk

| Path                          | Purpose                               |
| ----------------------------- | ------------------------------------- |
| `~/.config/orgit/state.json`  | Persisted state (versioned)           |
| `~/.config/orgit/config.json` | UI preferences (terminal theme, font) |
| `~/.config/orgit/orgit.log`   | Application log file (tailed by UI)   |
| `~/.config/orgit/workspace/`  | Default folder scanned for repo roots |

See [`config.example.json`](./config.example.json) for a documented terminal configuration sample.

A **repository** is a direct child of the workspace whose `.git` is a **directory** (root checkout, not a linked worktree). Each **worktree** entry is a linked checkout; diff stats compare that checkout to main's committed `HEAD`.

## Project layout

```
src/
├── shared/                      # Contracts (main + UI)
│   ├── types.ts                 # AppState, Repository, Worktree, MainRPC
│   ├── config.ts                # AppConfig, terminal theme, parseAppConfig
│   ├── selection.ts             # getSelectedWorktreePath
│   ├── equality.ts              # shallowEqualRecord
│   └── terminal-tab.ts          # TerminalTab type
│
├── bun/                         # Main process
│   ├── index.ts                 # Entry → startApp()
│   ├── app.ts                   # RPC wiring, window, startup scans
│   ├── window.ts                # BrowserWindow (dev server or packaged view)
│   ├── rpc.ts                   # RPC handlers + sync pushes
│   ├── lib/
│   │   ├── logger.ts
│   │   └── map-with-concurrency.ts
│   └── features/
│       ├── app-state/           # createAppState(), persistence, reconcile
│       ├── repositories/        # listRepositories, git/, worktrees/
│       ├── terminal/            # PTY manager (Bun.spawn)
│       ├── config/              # Watch config.json, push to webview
│       └── logs/                # Tail orgit.log when panel is open
│
└── mainview/                    # React UI (Vite root)
    ├── main.tsx, App.tsx
    ├── rpc.ts                   # Webview RPC + mainProcess helpers
    ├── store.ts                 # Zustand mirror of AppState
    ├── store/config-store.ts    # Zustand mirror of AppConfig
    ├── lib/                     # i18n, cn()
    ├── locales/
    ├── components/ui/           # shadcn-style primitives (no app logic)
    ├── hooks/                   # App-wide hooks only
    └── features/
        ├── repositories/        # Repository sidebar
        ├── worktrees/           # Worktree sidebar + diff stats
        ├── terminal/            # xterm.js tabs, viewport, WebGL
        └── logs/                # Log panel UI
```

Each mainview feature follows:

```
features/<domain>/
├── index.ts          # Public API — import from here outside the feature
├── components/
├── hooks/
├── store.ts          # Feature-local Zustand (if needed)
└── lib/              # Pure helpers (parsers, selectors, xterm utilities)
```

Tests are colocated as `*.test.ts` next to the file they cover. Run with `bun test`.

## Data flow

```
UI click → store.select* → mainview/rpc → bun/rpc → app-state → syncAppState → store.syncAppState → UI
```

Terminal and log panel use the same RPC bridge with feature-specific messages (see below).

### RPC messages (`shared/types.ts`)

| Direction      | Message                 | Purpose                              |
| -------------- | ----------------------- | ------------------------------------ |
| Webview → Main | `onSelectRepository`    | Change selected repo                 |
| Webview → Main | `onSelectWorktree`      | Change selected worktree             |
| Webview → Main | `onDoubleClickTitleBar` | Toggle maximize                      |
| Webview → Main | `onSetLogPanelOpen`     | Start/stop log file watcher          |
| Webview → Main | `onTerminalAttach`      | Spawn/attach PTY for a tab           |
| Webview → Main | `onTerminalClose`       | Close PTY session                    |
| Webview → Main | `onTerminalInput`       | Send keystrokes to active PTY        |
| Webview → Main | `onTerminalResize`      | Resize active PTY                    |
| Main → Webview | `syncAppState`          | Push full `AppState`                 |
| Main → Webview | `syncAppConfig`         | Push `AppConfig` (terminal theme)    |
| Main → Webview | `syncLogContent`        | Push log file contents               |
| Main → Webview | `syncTerminalOutput`    | Push PTY stdout to xterm             |
| Main → Webview | `syncTerminalExit`      | Notify session exit code             |

### State ownership

| State              | Owner   | Location                          |
| ------------------ | ------- | --------------------------------- |
| Repos, selections  | Main    | `bun/features/app-state/`         |
| Terminal theme     | Main    | `bun/features/config/` → config.json |
| Terminal tabs      | Webview | `mainview/features/terminal/store.ts` |
| Log panel open     | Webview | `mainview/features/logs/store.ts` |
| PTY sessions       | Main    | `bun/features/terminal/`          |

### Startup (`app.ts`, on `dom-ready`)

1. **`initialize()`** — Fast scan: repos + worktrees **without** diff stats (zeros).
2. **`refreshRepositories()`** — Full scan: computes per-worktree line/file stats (heavier Git work).
3. **`configSync.start()`** — Watch config.json and push to webview.

Both scan steps call `syncAppState` so the UI paints quickly, then updates with stats.

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

Import feature internals from `@client/features/<domain>` (the feature `index.ts`), not deep paths.

## Adding a feature

1. **Shared** — Types and RPC in `src/shared/types.ts` if the UI needs new messages.
2. **Main** — `src/bun/features/<domain>/` with `index.ts` as the public API; wire in `app.ts` and `bun/rpc.ts`.
3. **UI** — `src/mainview/features/<domain>/` with `index.ts`, pure components, and containers; actions call `mainProcess.*` from `rpc.ts`.
4. **Tests** — Colocated `*.test.ts`; run with `bun test`.

Do not duplicate Git or filesystem logic in the webview.

## App icon on macOS

```
xcode-select --install
sudo xcodebuild -license accept
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```
