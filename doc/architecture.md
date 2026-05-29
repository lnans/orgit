# Architecture

Orgit is an [Electrobun](https://electrobun.dev) desktop app: a **Bun main process** owns Git, disk, and PTY sessions; a **React webview** mirrors state over RPC and never touches Git or the filesystem directly.

**Vite** builds the webview to `dist/`; **Electrobun** bundles the main process and copies views for production (`electrobun.config.ts`).

## Process split

| Layer | Path | Responsibility |
| ----- | ---- | -------------- |
| Main | `src/bun/` | App state, persistence, Git scans, PTY, config and log file I/O |
| Webview | `src/mainview/` | React UI, xterm.js terminals, Zustand mirrors |
| Shared | `src/shared/` | Types, RPC schema (`MainRPC`), config parsing, pure helpers |

## Principles

1. **Main owns state** — Selections and the repository list live in Bun. The Zustand store only applies `syncAppState` snapshots.
2. **Feature folders** — Each domain exposes a small `index.ts`; implementation splits into `components/`, `hooks/`, `lib/`, and `store.ts` as it grows.
3. **Pure components** — Leaf UI components receive data and callbacks via props; containers wire Zustand and RPC.
4. **Reconcile after every mutation** — Invalid repo/worktree selections are dropped when the scan result changes.
5. **Persist user choices only** — `~/.config/orgit/state.json` stores workspace path and selections; `repositories` are always rescanned.
6. **User preferences in config** — `~/.config/orgit/config.json` controls terminal appearance (fonts, colors). Changes reload while the app is running.

## Domain model

A **repository** is a direct child of the workspace whose `.git` is a **directory** (root checkout, not a linked worktree). Each **worktree** entry is a linked checkout; diff stats compare that checkout to main's committed `HEAD`.

## Data flow

```
UI click → store.select* → mainview/rpc → bun/rpc → app-state → syncAppState → store.syncAppState → UI
```

Terminal and log panel use the same RPC bridge with feature-specific messages (see below).

### RPC messages (`shared/types.ts`)

| Direction | Message | Purpose |
| --------- | ------- | ------- |
| Webview → Main | `onSelectRepository` | Change selected repo |
| Webview → Main | `onSelectWorktree` | Change selected worktree |
| Webview → Main | `onDoubleClickTitleBar` | Toggle maximize |
| Webview → Main | `onSetLogPanelOpen` | Start/stop log file watcher |
| Webview → Main | `onTerminalAttach` | Spawn/attach PTY for a tab |
| Webview → Main | `onTerminalClose` | Close PTY session |
| Webview → Main | `onTerminalInput` | Send keystrokes to active PTY |
| Webview → Main | `onTerminalResize` | Resize active PTY |
| Main → Webview | `syncAppState` | Push full `AppState` |
| Main → Webview | `syncAppConfig` | Push `AppConfig` (terminal theme) |
| Main → Webview | `syncLogContent` | Push log file contents |
| Main → Webview | `syncTerminalOutput` | Push PTY stdout to xterm |
| Main → Webview | `syncTerminalExit` | Notify session exit code |

### State ownership

| State | Owner | Location |
| ----- | ----- | -------- |
| Repos, selections | Main | `bun/features/app-state/` |
| Terminal theme | Main | `bun/features/config/` → `config.json` |
| Terminal tabs | Webview | `mainview/features/terminal/store.ts` |
| Log panel open | Webview | `mainview/features/logs/store.ts` |
| PTY sessions | Main | `bun/features/terminal/` |

### Startup (`app.ts`, on `dom-ready`)

1. **`initialize()`** — Fast scan: repos + worktrees **without** diff stats (zeros).
2. **`refreshRepositories()`** — Full scan: computes per-worktree line/file stats (heavier Git work).
3. **`configSync.start()`** — Watch `config.json` and push to webview.

Both scan steps call `syncAppState` so the UI paints quickly, then updates with stats.

### App state API (`createAppState`)

| Method | Description |
| ------ | ----------- |
| `initialize()` | Fast repository scan |
| `refreshRepositories()` | Full scan with diff stats |
| `selectRepository(path?)` | Select/clear repo; reconcile + persist |
| `selectWorktree(path?)` | Select/clear worktree for current repo |

Internal flow: `applyState` → `reconcileAppState` → persist if `workspacePath`, `selectedRepositoryPath`, or `selectedWorktreePaths` changed.
