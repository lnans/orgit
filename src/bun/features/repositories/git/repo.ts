import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { DETACHED_HEAD, runGit, UNKNOWN_BRANCH } from './run'

export function hasHeadCommit(repoPath: string): boolean {
  return runGit(repoPath, ['rev-parse', '--verify', '-q', 'HEAD']).ok
}

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
  const current = runGit(repoPath, ['branch', '--show-current'])
  if (current.ok && current.stdout) {
    return current.stdout
  }

  const head = runGit(repoPath, ['rev-parse', '--abbrev-ref', 'HEAD'])
  if (!head.ok || !head.stdout) {
    return UNKNOWN_BRANCH
  }

  if (head.stdout === 'HEAD') {
    return DETACHED_HEAD
  }

  return head.stdout
}
