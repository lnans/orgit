import { RepositoryDto } from '@shared/repository-dto'
import { RPCSchema } from 'electrobun'
import { AppStateDto } from './app-state-dto'

export type MainRPCDto = {
  // functions that execute in the main process
  bun: RPCSchema<{
    requests: Record<string, never>
    messages: {
      handleDoubleClickTitleBar: {}
    }
  }>
  // functions that execute in the browser context
  webview: RPCSchema<{
    requests: Record<string, never>
    messages: {
      initAppState: {
        appState: AppStateDto
      }
      repositoriesUpdates: {
        repositories: RepositoryDto[]
      }
    }
  }>
}
