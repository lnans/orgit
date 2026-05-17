import { Utils } from 'electrobun'
import { webviewRPC } from './electrobun-server'
import { mainWindow } from './index'
import { appStateService } from './services/app-state-service'
import { gitService } from './services/git-service'

// Quit the app when the main window is closed
mainWindow.on('close', () => {
  Utils.quit()
})

mainWindow.webview.on('dom-ready', () => {
  const state = appStateService.state
  const repositories = gitService.getRepositories(state.workspacePath)
  appStateService.updateRepositories(repositories)
  webviewRPC.send('initAppState', { appState: state })
  console.log('Main view is ready')
})
