import type { AppState, SelectedWorktreePaths } from '@shared/types'
import { getSelectedWorktreePath } from '../../../shared/selection'

export function reconcileAppState(state: AppState): AppState {
  let next: AppState = {
    ...state,
    selectedWorktreePaths: pruneSelectedWorktreePaths(state.repositories, state.selectedWorktreePaths),
  }

  if (next.selectedRepositoryPath) {
    const repositoryStillExists = next.repositories.some((repo) => repo.path === next.selectedRepositoryPath)
    if (!repositoryStillExists) {
      next = { ...next, selectedRepositoryPath: undefined }
    }
  }

  const selectedWorktreePath = getSelectedWorktreePath(next)
  if (!selectedWorktreePath) {
    return next
  }

  const selectedRepository = next.repositories.find((repo) => repo.path === next.selectedRepositoryPath)
  const worktreeStillExists = selectedRepository?.worktrees.some((worktree) => worktree.path === selectedWorktreePath)

  if (!worktreeStillExists && next.selectedRepositoryPath) {
    const selectedWorktreePaths = { ...next.selectedWorktreePaths }
    delete selectedWorktreePaths[next.selectedRepositoryPath]
    return { ...next, selectedWorktreePaths }
  }

  return next
}

function pruneSelectedWorktreePaths(
  repositories: AppState['repositories'],
  selectedWorktreePaths: SelectedWorktreePaths
): SelectedWorktreePaths {
  const pruned: SelectedWorktreePaths = {}

  for (const [repositoryPath, worktreePath] of Object.entries(selectedWorktreePaths)) {
    const repository = repositories.find((repo) => repo.path === repositoryPath)
    if (!repository) {
      continue
    }

    if (repository.worktrees.some((worktree) => worktree.path === worktreePath)) {
      pruned[repositoryPath] = worktreePath
    }
  }

  return pruned
}

export function shouldPersistState(before: AppState, after: AppState): boolean {
  return (
    before.workspacePath !== after.workspacePath ||
    before.selectedRepositoryPath !== after.selectedRepositoryPath ||
    JSON.stringify(before.selectedWorktreePaths) !== JSON.stringify(after.selectedWorktreePaths)
  )
}
