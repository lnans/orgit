import type { Worktree } from '@shared/types'
import { execSync } from 'node:child_process'
import path from 'node:path'

export function listWorktrees(repoPath: string): Worktree[] {
  try {
    const output = execSync('git worktree list --porcelain', {
      cwd: repoPath,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return parseWorktreeList(output)
  } catch (error) {
    console.warn(`Unable to list worktrees for ${repoPath}`, error)
    return []
  }
}

function parseWorktreeList(output: string): Worktree[] {
  const worktrees: Worktree[] = []

  for (const line of output.split('\n')) {
    if (!line.startsWith('worktree ')) {
      continue
    }

    const worktreePath = line.slice('worktree '.length)
    worktrees.push({
      name: path.basename(worktreePath),
      path: worktreePath,
    })
  }

  return worktrees.sort((a, b) => a.name.localeCompare(b.name))
}
