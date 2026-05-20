import type { AppState, MainRPC } from '@shared/types'
import { BrowserView } from 'electrobun'

type WindowControls = {
  isMaximized(): boolean
  unmaximize(): void
  maximize(): void
}

type RpcHandlers = {
  onDoubleClickTitleBar: (params: { mainWindow: WindowControls }) => void
  onSelectRepository: (params: { repositoryPath: string | null | undefined }) => AppState
  onSelectWorktree: (params: { worktreePath: string | null | undefined }) => AppState
}

export type WebviewRPC = ReturnType<typeof createRpc>

export function createRpc(handlers: RpcHandlers) {
  let mainWindow: WindowControls | undefined

  const rpc = BrowserView.defineRPC<MainRPC>({
    maxRequestTime: 5000,
    handlers: {
      messages: {
        onDoubleClickTitleBar: () => {
          if (mainWindow) {
            handlers.onDoubleClickTitleBar({ mainWindow })
          }
        },
        onSelectRepository: ({ repositoryPath }) => {
          const appState = handlers.onSelectRepository({ repositoryPath })
          rpc.send.syncAppState({ appState })
        },
        onSelectWorktree: ({ worktreePath }) => {
          const appState = handlers.onSelectWorktree({ worktreePath })
          rpc.send.syncAppState({ appState })
        },
      },
      requests: {},
    },
  })

  return {
    ...rpc,
    setMainWindow: (window: WindowControls) => {
      mainWindow = window
    },
    syncAppState: (appState: AppState) => {
      rpc.send.syncAppState({ appState })
    },
  }
}
