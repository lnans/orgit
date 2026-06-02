# Project structure

## Repository layout

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
│       └── logs/                # Tail per-run session log when panel is open
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
        ├── terminal/            # xterm.js tabs, fit, Unicode11
        └── logs/                # Log panel UI
```

## Feature folder convention

Each mainview (and main-process) feature follows:

```
features/<domain>/
├── index.ts          # Public API — import from here outside the feature
├── components/
├── hooks/
├── store.ts          # Feature-local Zustand (if needed)
└── lib/              # Pure helpers (parsers, selectors, xterm utilities)
```

Tests are colocated as `*.test.ts` next to the file they cover. Run with `bun test`.

## Imports

| Context | Shared | Local |
| ------- | ------ | ----- |
| `src/bun/**` | Relative paths, e.g. `../../../shared/types` | Relative |
| `src/mainview/**` | `@shared/*` (Vite) | `@client/*` |

Bun does not resolve `tsconfig` path aliases at runtime.

Import feature internals from `@client/features/<domain>` (the feature `index.ts`), not deep paths.
