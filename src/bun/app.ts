import { Utils } from 'electrobun/bun'
import { createAppState } from './features/app-state/index'
import { createRpc } from './rpc'
import { createMainWindow } from './window'

export async function startApp() {
  const appState = createAppState()

  const rpc = createRpc({
    onDoubleClickTitleBar: ({ mainWindow }) => {
      mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
    },
    onSelectRepository: ({ repositoryPath }) => appState.selectRepository(repositoryPath),
    onSelectWorktree: ({ worktreePath }) => appState.selectWorktree(worktreePath),
  })

  const mainWindow = await createMainWindow(rpc)
  rpc.setMainWindow(mainWindow)

  mainWindow.on('close', () => Utils.quit())

  mainWindow.webview.on('dom-ready', async () => {
    rpc.syncAppState(await appState.initialize())
    rpc.syncAppState(await appState.refreshRepositories())
    console.log('Main view is ready')
  })
}
