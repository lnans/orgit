import type { AppState, PersistedState, SelectedWorktreePaths } from '@shared/types'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { CONFIG_DIR, DEFAULT_WORKSPACE, STATE_FILE } from './paths'

export function loadPersistedState(): PersistedState {
  ensureConfigDir()

  if (!existsSync(STATE_FILE)) {
    const initial = defaultPersistedState()
    savePersistedState(initial)
    return initial
  }

  try {
    const raw: unknown = JSON.parse(readFileSync(STATE_FILE, 'utf-8'))
    return parsePersistedState(raw)
  } catch (error) {
    console.error('Failed to read state file. Using defaults.', error)
    const initial = defaultPersistedState()
    savePersistedState(initial)
    return initial
  }
}

export function savePersistedState(state: PersistedState) {
  ensureConfigDir()
  try {
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
  } catch (error) {
    console.error('Failed to persist state file.', error)
  }
}

export function toPersistedState(state: AppState): PersistedState {
  return {
    workspacePath: state.workspacePath,
    selectedRepositoryPath: state.selectedRepositoryPath,
    selectedWorktreePaths: state.selectedWorktreePaths,
  }
}

function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }
}

function defaultPersistedState(): PersistedState {
  return {
    workspacePath: DEFAULT_WORKSPACE,
    selectedWorktreePaths: {},
  }
}

function parsePersistedState(raw: unknown): PersistedState {
  if (!raw || typeof raw !== 'object') {
    return defaultPersistedState()
  }

  const record = raw as Record<string, unknown>
  return {
    workspacePath: typeof record.workspacePath === 'string' ? record.workspacePath : DEFAULT_WORKSPACE,
    selectedRepositoryPath: parseOptionalPath(record.selectedRepositoryPath),
    selectedWorktreePaths: parseSelectedWorktreePaths(record),
  }
}

function parseSelectedWorktreePaths(record: Record<string, unknown>): SelectedWorktreePaths {
  return parseWorktreePathsMap(record.selectedWorktreePaths)
}

function parseWorktreePathsMap(raw: unknown): SelectedWorktreePaths {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {}
  }

  const map: SelectedWorktreePaths = {}
  for (const [repositoryPath, worktreePath] of Object.entries(raw)) {
    if (typeof repositoryPath === 'string' && typeof worktreePath === 'string' && worktreePath.length > 0) {
      map[repositoryPath] = worktreePath
    }
  }

  return map
}

function parseOptionalPath(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}
