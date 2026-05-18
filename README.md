# Orgit

Desktop Git workspace manager built with [Electrobun](https://electrobun.dev), React, and Tailwind.

## Commands

```bash
bun install
bun run dev:hmr   # dev with HMR (recommended)
bun run dev       # dev without HMR
```

## Project layout

```
src/
├── shared/types.ts          # Types shared by main + UI (AppState, Repository, RPC)
│
├── bun/                     # Main process
│   ├── index.ts             # Entry
│   ├── app.ts               # Startup wiring
│   ├── window.ts            # BrowserWindow
│   ├── rpc.ts               # Electrobun RPC (main side)
│   └── features/            # One folder per domain
│       ├── app-state/       # index = public API, persistence, reconcile, …
│       └── repositories/    # index = public API, scan, git, …
│
└── mainview/                # React UI
    ├── main.tsx
    ├── App.tsx
    ├── rpc.ts               # Electrobun RPC (UI side)
    ├── store.ts             # Zustand state
    └── features/            # UI per domain — mirrors bun/features/
        └── repositories/
```

## Adding a feature

Example: worktrees

1. **Main process** — `src/bun/features/worktrees/` (start with `index.ts`, split into `scan.ts`, `git.ts`, … when it grows).
2. **Wire it** — call it from `app.ts` and expose RPC handlers in `rpc.ts` if the UI needs it.
3. **Shared types** — add DTOs to `src/shared/types.ts`.
4. **UI** — `src/mainview/features/worktrees/`.

Each feature folder exposes a small `index.ts`; keep implementation details in sibling files.

## Data flow

```
UI action → rpc.ts (webview) → rpc.ts (main) → features/* → syncAppState → store.ts
```

The main process owns persisted state; the UI only mirrors it via `syncAppState`.
