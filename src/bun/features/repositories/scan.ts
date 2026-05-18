import type { Repository } from '@shared/types'
import { Dirent, existsSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { getCurrentBranch, isRepositoryRoot } from './git'

export function scanRepositories(workspacePath: string): Repository[] {
  ensureWorkspaceExists(workspacePath)

  let entries: Dirent[]
  try {
    entries = readdirSync(workspacePath, { withFileTypes: true })
  } catch (error) {
    console.error(`Failed to read workspace path ${workspacePath}.`, error)
    return []
  }

  const repositories: Repository[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const repoPath = path.join(workspacePath, entry.name)
    if (!isRepositoryRoot(repoPath)) {
      continue
    }

    repositories.push({
      name: entry.name,
      branch: getCurrentBranch(repoPath),
      path: repoPath,
    })
  }

  return repositories.sort((a, b) => a.name.localeCompare(b.name))
}

function ensureWorkspaceExists(workspacePath: string) {
  if (existsSync(workspacePath)) {
    return
  }

  try {
    mkdirSync(workspacePath, { recursive: true })
    console.warn(`Workspace path ${workspacePath} did not exist and was created.`)
  } catch (error) {
    console.error(`Failed to create workspace path ${workspacePath}.`, error)
  }
}
