import { RepositoryDto } from '@shared/repository-dto'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

class GitService {
  // List git repositories in a given workspace path
  // only include real repositories (i.e., folders containing a .git folder)
  getRepositories(workspacePath: string): RepositoryDto[] {
    // ensure workspacepath exists, create it if it doesn't
    if (!existsSync(workspacePath)) {
      console.warn(`Workspace path ${workspacePath} does not exist. Creating it.`)
      try {
        mkdirSync(workspacePath, { recursive: true })
      } catch (error) {
        console.error(`Failed to create workspace directory at ${workspacePath}:`, error)
        return []
      }
    }

    const entries = readdirSync(workspacePath, { withFileTypes: true })
    const repositories: RepositoryDto[] = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const repoPath = join(workspacePath, entry.name)
        const gitPath = join(repoPath, '.git')

        if (statSync(gitPath).isDirectory()) {
          // Read the current branch from .git/HEAD
          const headFile = readFileSync(join(gitPath, 'HEAD'), 'utf-8').trim()
          const branchMatch = headFile.match(/ref: refs\/heads\/(.+)/)
          const branch = branchMatch ? branchMatch[1] : 'unknown'

          repositories.push({
            name: entry.name,
            branch,
            path: repoPath,
          })
        }
      }
    }

    return repositories.sort((a, b) => a.name.localeCompare(b.name))
  }
}

export const gitService = new GitService()
