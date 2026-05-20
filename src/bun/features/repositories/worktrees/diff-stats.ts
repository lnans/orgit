import { EMPTY_WORKTREE_DIFF_STATS, type WorktreeDiffStats } from '../../../../shared/types'
import { EMPTY_TREE, hasHeadCommit, runGit } from '../git'

export const UNTRACKED_FILE_CAP = 50

export function parseDiffNumStat(output: string): WorktreeDiffStats {
  let filesModified = 0
  let linesAdded = 0
  let linesRemoved = 0

  for (const line of output.split('\n')) {
    if (!line.trim()) {
      continue
    }

    const [added, removed] = line.split('\t')
    if (added === undefined || removed === undefined) {
      continue
    }

    filesModified += 1
    if (added !== '-') {
      linesAdded += Number.parseInt(added, 10) || 0
    }
    if (removed !== '-') {
      linesRemoved += Number.parseInt(removed, 10) || 0
    }
  }

  return { filesModified, linesAdded, linesRemoved }
}

/** Committed state on main (empty tree when main has no commits yet). */
export function getMainBaselineRef(mainRepoPath: string): string {
  if (!hasHeadCommit(mainRepoPath)) {
    return EMPTY_TREE
  }

  const head = runGit(mainRepoPath, ['rev-parse', 'HEAD'])
  return head.ok ? head.stdout : EMPTY_TREE
}

export function getWorktreeDiffStats(worktreePath: string, mainBaselineRef: string): WorktreeDiffStats {
  // Diff this worktree's checkout (index + working tree) against main's committed
  // state — not main's staged index, which can add phantom removals for files
  // that only exist on main (e.g. foo.txt staged on main, absent in branch-1).
  const diff = runGit(worktreePath, ['diff', '--numstat', mainBaselineRef])
  if (!diff.ok) {
    return EMPTY_WORKTREE_DIFF_STATS
  }

  const stats = parseDiffNumStat(diff.stdout)
  addUntrackedDiffStats(worktreePath, stats)
  return stats
}

function addUntrackedDiffStats(worktreePath: string, stats: WorktreeDiffStats): void {
  const untracked = runGit(worktreePath, ['ls-files', '--others', '--exclude-standard'])
  if (!untracked.ok || !untracked.stdout) {
    return
  }

  const filePaths = untracked.stdout.split('\n').filter(Boolean)
  const cappedPaths = filePaths.slice(0, UNTRACKED_FILE_CAP)

  for (const filePath of cappedPaths) {
    // git diff <baseline> ignores untracked paths; --no-index compares /dev/null to the file.
    // Exit code 1 is normal when the file differs from /dev/null.
    const fileDiff = runGit(worktreePath, ['diff', '--no-index', '--numstat', '/dev/null', filePath])
    if (!fileDiff.stdout) {
      continue
    }

    const fileStats = parseDiffNumStat(fileDiff.stdout)
    stats.filesModified += fileStats.filesModified
    stats.linesAdded += fileStats.linesAdded
    stats.linesRemoved += fileStats.linesRemoved
  }
}
