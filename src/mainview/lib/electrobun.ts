import { useAppStore } from '@client/stores/app-store'
import { type MainRPCDto } from '@shared/rpc-dto'
import { Electroview } from 'electrobun/view'

// RPC calls recevied from the main process
const rpc = Electroview.defineRPC<MainRPCDto>({
  maxRequestTime: 5000,
  handlers: {
    requests: {},
    messages: {
      initAppState: ({ appState }) => {
        useAppStore.getState().actions.loadAppState(appState)
      },
      repositoriesUpdates: ({ repositories }) => {
        useAppStore.getState().actions.setRepositories(repositories)
      },
    },
  },
})

// Create an instance of Electroview to be used for sending RPC calls to the main process
const electrobun = new Electroview({ rpc })
export const server = {
  handleDoubleClickTitleBar: () => electrobun.rpc?.send('handleDoubleClickTitleBar', {}),
}
