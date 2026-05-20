import type { AppState, PersistedState } from '@shared/types'
import { listRepositories } from '../repositories'
import { loadPersistedState, savePersistedState, toPersistedState } from './persistence'
import { reconcileAppState, shouldPersistState } from './reconcile'

export function createAppState() {
  let state = buildAppState(loadPersistedState())

  function commit(next: AppState) {
    const previous = state
    state = reconcileAppState(next)

    if (shouldPersistState(previous, state)) {
      savePersistedState(toPersistedState(state))
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

    selectRepository(repositoryPath: string | null | undefined): AppState {
      return commit({
        ...state,
        selectedRepositoryPath: repositoryPath ?? undefined,
      })
    },

    selectWorktree(worktreePath: string | null | undefined): AppState {
      if (!state.selectedRepositoryPath) {
        return structuredClone(state)
      }

      const selectedWorktreePaths = { ...state.selectedWorktreePaths }
      if (worktreePath) {
        selectedWorktreePaths[state.selectedRepositoryPath] = worktreePath
      } else {
        delete selectedWorktreePaths[state.selectedRepositoryPath]
      }

      return commit({
        ...state,
        selectedWorktreePaths,
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

function buildAppState(persisted: PersistedState): AppState {
  return reconcileAppState({
    ...persisted,
    repositories: listRepositories(persisted.workspacePath),
  })
}

function refreshState(current: AppState): AppState {
  const next = reconcileAppState({
    ...toPersistedState(current),
    repositories: listRepositories(current.workspacePath),
  })

  if (shouldPersistState(current, next)) {
    savePersistedState(toPersistedState(next))
  }

  return next
}
