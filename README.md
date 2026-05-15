# React + Tailwind + Vite Electrobun Template

A fast Electrobun desktop app template with React, Tailwind CSS, and Vite for hot module replacement (HMR).

## TODO

1. Update all dependencies to latest versions
2. Add a Linter (ESLint) and Formatter (Prettier)
3. Base Layout of the app with drag windows and titlebar hidden
4. LETS GOOOO

Orgit
The Orbit Control Room for your Git Worktrees & AI Agents.
Powered by Electron, Bun, and node-pty.

## Synop

Orgit (Organization + Git) is a premium macOS desktop application designed to manage multiple Git worktrees across different repositories in parallel.

The interface is split into 3 panels:

a left sidebar to select a repository,
a second sidebar to navigate between the selected repository’s worktrees,
a large main panel containing an integrated terminal automatically opened in the active worktree directory.

The experience should feel ultra-fluid, minimal, and deeply “native macOS”, with design inspirations from Linear, Raycast, and Warp.

The visual direction combines a premium macOS aesthetic with inspirations from developer themes like One Dark and Dracula:
slightly bluish charcoal backgrounds, cyan/orange/purple accents, soft contrast, subtle glow effects, elegant terminal styling, modern typography, smooth animations, and an overall dark “developer cockpit” atmosphere focused on parallel development and productivity.

## Getting Started

```bash
# Install dependencies
bun install

# Development without HMR (uses bundled assets)
bun run dev

# Development with HMR (recommended)
bun run dev:hmr

# Build for production
bun run build

# Build for production release
bun run build:prod
```

## How HMR Works

When you run `bun run dev:hmr`:

1. **Vite dev server** starts on `http://localhost:5173` with HMR enabled
2. **Electrobun** starts and detects the running Vite server
3. The app loads from the Vite dev server instead of bundled assets
4. Changes to React components update instantly without full page reload

When you run `bun run dev` (without HMR):

1. Electrobun starts and loads from `views://mainview/index.html`
2. You need to rebuild (`bun run build`) to see changes

## Project Structure

```
├── src/
│   ├── bun/
│   │   └── index.ts        # Main process (Electrobun/Bun)
│   └── mainview/
│       ├── App.tsx         # React app component
│       ├── main.tsx        # React entry point
│       ├── index.html      # HTML template
│       └── index.css       # Tailwind CSS
├── electrobun.config.ts    # Electrobun configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json
```

## Customizing

- **React components**: Edit files in `src/mainview/`
- **Tailwind theme**: Edit `tailwind.config.js`
- **Vite settings**: Edit `vite.config.ts`
- **Window settings**: Edit `src/bun/index.ts`
- **App metadata**: Edit `electrobun.config.ts`
