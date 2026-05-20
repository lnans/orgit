import { PERSISTED_STATE_VERSION, type AppState, type PersistedState, type SelectedWorktreePaths } from '../../../shared/types'
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
    version: PERSISTED_STATE_VERSION,
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
    version: PERSISTED_STATE_VERSION,
    workspacePath: DEFAULT_WORKSPACE,
    selectedWorktreePaths: {},
  }
}

export function parsePersistedState(raw: unknown): PersistedState {
  if (!raw || typeof raw !== 'object') {
    return defaultPersistedState()
  }

  const record = raw as Record<string, unknown>
  const version = typeof record.version === 'number' ? record.version : 0

  if (version > PERSISTED_STATE_VERSION) {
    console.warn(`State file version ${version} is newer than supported ${PERSISTED_STATE_VERSION}. Some fields may be ignored.`)
  }

  return migratePersistedState(version, record)
}

function migratePersistedState(version: number, record: Record<string, unknown>): PersistedState {
  // v0: no version field — same shape as v1.
  if (version < 1) {
    return {
      version: PERSISTED_STATE_VERSION,
      workspacePath: typeof record.workspacePath === 'string' ? record.workspacePath : DEFAULT_WORKSPACE,
      selectedRepositoryPath: parseOptionalPath(record.selectedRepositoryPath),
      selectedWorktreePaths: parseWorktreePathsMap(record.selectedWorktreePaths),
    }
  }

  return {
    version: PERSISTED_STATE_VERSION,
    workspacePath: typeof record.workspacePath === 'string' ? record.workspacePath : DEFAULT_WORKSPACE,
    selectedRepositoryPath: parseOptionalPath(record.selectedRepositoryPath),
    selectedWorktreePaths: parseWorktreePathsMap(record.selectedWorktreePaths),
  }
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
