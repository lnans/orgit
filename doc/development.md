# Development

## Commands

```bash
bun install
bun run dev:hmr   # Vite HMR (5173) + Electrobun dev — recommended
bun run dev       # Electrobun dev without HMR
bun test          # Unit tests (colocated *.test.ts)
bun run fmt       # Biome format + lint
bun run typecheck # TypeScript check
bun run build:canary  # vite build && electrobun build
```

## Workspace on disk

| Path | Purpose |
| ---- | ------- |
| `~/.config/orgit/state.json` | Persisted state (versioned) |
| `~/.config/orgit/config.json` | UI preferences (terminal theme, font) |
| `~/.config/orgit/logs/orgit-*.log` | Per-run application log (tailed by UI) |
| `~/.config/orgit/workspace/` | Default folder scanned for repo roots |

See [`config.example.json`](../config.example.json) in the repository root for a documented terminal configuration sample.

## App icon on macOS

```
xcode-select --install
sudo xcodebuild -license accept
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```
