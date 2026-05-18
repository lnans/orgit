import type { AppState } from '@shared/types'

export function reconcileSelectedRepository(state: AppState): AppState {
  if (!state.selectedRepository) {
    return state
  }

  const selectedStillExists = state.repositories.some((repo) => repo.path === state.selectedRepository!.path)
  if (selectedStillExists) {
    return state
  }

  return { ...state, selectedRepository: undefined }
}

export function shouldPersistState(before: AppState, after: AppState): boolean {
  if (before.selectedRepository !== after.selectedRepository) {
    return true
  }

  return JSON.stringify(before.repositories) !== JSON.stringify(after.repositories)
}
