import { RPCSchema } from 'electrobun'

export type Repository = {
  name: string
  path: string
  branch: string
}

export type AppState = {
  workspacePath: string
  repositories: Repository[]
  selectedRepository?: Repository
}

export type MainRPC = {
  bun: RPCSchema<{
    requests: Record<string, never>
    messages: {
      onDoubleClickTitleBar: {}
      onSelectRepository: {
        repository: Repository | null | undefined
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
