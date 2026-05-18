import { useAppStore } from '@client/store'
import type { MainRPC, Repository } from '@shared/types'
import { Electroview } from 'electrobun/view'

const rpc = Electroview.defineRPC<MainRPC>({
  maxRequestTime: 5000,
  handlers: {
    requests: {},
    messages: {
      syncAppState: ({ appState }) => {
        useAppStore.getState().syncAppState(appState)
      },
    },
  },
})

const electroview = new Electroview({ rpc })

export const mainProcess = {
  onDoubleClickTitleBar: () => electroview.rpc?.send.onDoubleClickTitleBar({}),
  onSelectRepository: (repository?: Repository) => electroview.rpc?.send.onSelectRepository({ repository }),
}
