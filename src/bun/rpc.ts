import type { AppState, MainRPC, Repository } from '@shared/types'
import { BrowserView } from 'electrobun'

type WindowControls = {
  isMaximized(): boolean
  unmaximize(): void
  maximize(): void
}

type RpcHandlers = {
  onDoubleClickTitleBar: (params: { mainWindow: WindowControls }) => void
  onSelectRepository: (params: { repository: Repository | null | undefined }) => AppState
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
        onSelectRepository: ({ repository }) => {
          const appState = handlers.onSelectRepository({ repository })
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
