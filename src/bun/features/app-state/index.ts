import type { AppState, Repository } from '@shared/types'
import { listRepositories } from '../repositories'
import { loadStateFromDisk, saveStateToDisk } from './persistence'
import { reconcileSelectedRepository, shouldPersistState } from './reconcile'

export function createAppState() {
  let state = loadStateFromDisk()
  state = refreshState(state)

  function commit(next: AppState) {
    const previous = state
    state = reconcileSelectedRepository(next)

    if (shouldPersistState(previous, state)) {
      saveStateToDisk(state)
    }

    return structuredClone(state)
  }

  return {
    get(): AppState {
      return structuredClone(state)
    },

    initialize(): AppState {
      state = refreshState(state)
      return structuredClone(state)
    },

    selectRepository(repository: Repository | null | undefined): AppState {
      return commit({
        ...state,
        selectedRepository: repository ?? undefined,
      })
    },

    refreshRepositories(): AppState {
      return commit({
        ...state,
        repositories: listRepositories(state.workspacePath),
      })
    },
  }
}

function refreshState(current: AppState): AppState {
  const next = reconcileSelectedRepository({
    ...current,
    repositories: listRepositories(current.workspacePath),
  })

  if (shouldPersistState(current, next)) {
    saveStateToDisk(next)
  }

  return next
}
