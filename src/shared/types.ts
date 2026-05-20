import { RPCSchema } from 'electrobun'

export type Worktree = {
  name: string
  path: string
}

export type Repository = {
  name: string
  path: string
  branch: string
  worktrees: Worktree[]
}

export type SelectedWorktreePaths = Record<string, string>

export type PersistedState = {
  workspacePath: string
  selectedRepositoryPath?: string
  selectedWorktreePaths: SelectedWorktreePaths
}

export type AppState = PersistedState & {
  repositories: Repository[]
}

export type MainRPC = {
  bun: RPCSchema<{
    requests: Record<string, never>
    messages: {
      onDoubleClickTitleBar: {}
      onSelectRepository: {
        repositoryPath: string | null | undefined
      }
      onSelectWorktree: {
        worktreePath: string | null | undefined
      }
    }
  }>
  webview: RPCSchema<{
    requests: Record<string, never>
    messages: {
      syncAppState: {
        appState: AppState
      }
    }
  }>
}
