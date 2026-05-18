import type { AppState, Repository } from '@shared/types'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { CONFIG_DIR, DEFAULT_WORKSPACE, STATE_FILE } from './paths'
import { reconcileSelectedRepository, shouldPersistState } from './reconcile'

export function loadStateFromDisk(): AppState {
  ensureConfigDir()

  if (!existsSync(STATE_FILE)) {
    const initial = defaultState()
    saveStateToDisk(initial)
    return initial
  }

  try {
    const raw: unknown = JSON.parse(readFileSync(STATE_FILE, 'utf-8'))
    const parsed = parseState(raw)
    const state = reconcileSelectedRepository(parsed)

    if (shouldPersistState(parsed, state)) {
      saveStateToDisk(state)
    }

    return state
  } catch (error) {
    console.error('Failed to read state file. Using defaults.', error)
    const initial = defaultState()
    saveStateToDisk(initial)
    return initial
  }
}

export function saveStateToDisk(state: AppState) {
  ensureConfigDir()
  try {
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
  } catch (error) {
    console.error('Failed to persist state file.', error)
  }
}

function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }
}

function defaultState(): AppState {
  return {
    workspacePath: DEFAULT_WORKSPACE,
    repositories: [],
  }
}

function parseState(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object') {
    return defaultState()
  }

  const record = raw as Record<string, unknown>
  return {
    workspacePath: typeof record.workspacePath === 'string' ? record.workspacePath : DEFAULT_WORKSPACE,
    repositories: parseRepositories(record.repositories),
    selectedRepository: parseRepository(record.selectedRepository),
  }
}

function parseRepositories(raw: unknown): Repository[] {
  if (!Array.isArray(raw)) {
    return []
  }
  return raw.map(parseRepository).filter((repo): repo is Repository => repo !== undefined)
}

function parseRepository(raw: unknown): Repository | undefined {
  if (!raw || typeof raw !== 'object') {
    return undefined
  }

  const record = raw as Record<string, unknown>
  if (typeof record.name !== 'string' || typeof record.path !== 'string' || typeof record.branch !== 'string') {
    return undefined
  }

  return { name: record.name, path: record.path, branch: record.branch }
}
