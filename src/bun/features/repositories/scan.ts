import type { Repository } from '../../../shared/types'
import { mapWithConcurrency } from '../../lib/map-with-concurrency'
import { Dirent, existsSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { getCurrentBranch, isRepositoryRoot } from './git'
import { listWorktrees } from './worktrees'

export type ListRepositoriesOptions = {
  /** When false, worktrees load with zeroed diff stats (faster first paint). */
  includeDiffStats?: boolean
  concurrency?: number
}

const DEFAULT_CONCURRENCY = 4

export async function listRepositories(workspacePath: string, options: ListRepositoriesOptions = {}): Promise<Repository[]> {
  if (!ensureWorkspaceExists(workspacePath)) {
    return []
  }

  const includeDiffStats = options.includeDiffStats ?? true
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY

  let entries: Dirent[]
  try {
    entries = readdirSync(workspacePath, { withFileTypes: true })
  } catch (error) {
    console.error(`Failed to read workspace path ${workspacePath}.`, error)
    return []
  }

  const repoPaths = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(workspacePath, entry.name))
    .filter((repoPath) => isRepositoryRoot(repoPath))

  const repositories = await mapWithConcurrency(repoPaths, concurrency, async (repoPath) => {
    const resolvedRepoPath = path.resolve(repoPath)
    return {
      name: path.basename(resolvedRepoPath),
      branch: getCurrentBranch(resolvedRepoPath),
      path: resolvedRepoPath,
      worktrees: await listWorktrees(resolvedRepoPath, { includeDiffStats }),
    }
  })

  return repositories.sort((a, b) => a.name.localeCompare(b.name))
}

function ensureWorkspaceExists(workspacePath: string): boolean {
  if (existsSync(workspacePath)) {
    return true
  }

  try {
    mkdirSync(workspacePath, { recursive: true })
    console.warn(`Workspace path ${workspacePath} did not exist and was created.`)
    return true
  } catch (error) {
    console.error(`Failed to create workspace path ${workspacePath}.`, error)
    return false
  }
}
