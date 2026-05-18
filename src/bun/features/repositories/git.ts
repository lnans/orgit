import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

export const DETACHED_HEAD = '(detached)'
export const UNKNOWN_BRANCH = '(unknown)'

/** True when this folder is a repository root (`.git` directory), not a linked worktree. */
export function isRepositoryRoot(repoPath: string): boolean {
  const gitEntryPath = path.join(repoPath, '.git')
  if (!existsSync(gitEntryPath)) {
    return false
  }

  try {
    return statSync(gitEntryPath).isDirectory()
  } catch {
    return false
  }
}

export function getCurrentBranch(repoPath: string): string {
  const headPath = path.join(repoPath, '.git', 'HEAD')
  if (!existsSync(headPath)) {
    return UNKNOWN_BRANCH
  }

  try {
    const headFile = readFileSync(headPath, 'utf-8').trim()
    const branchMatch = headFile.match(/^ref:\s+refs\/heads\/(.+)$/)
    return branchMatch ? branchMatch[1] : DETACHED_HEAD
  } catch (error) {
    console.warn(`Unable to read git HEAD for ${repoPath}`, error)
    return UNKNOWN_BRANCH
  }
}
