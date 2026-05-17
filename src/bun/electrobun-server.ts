import { MainRPCDto } from '@shared/rpc-dto'
import { BrowserView } from 'electrobun'
import { mainWindow } from './index'

export const webviewRPC = BrowserView.defineRPC<MainRPCDto>({
  maxRequestTime: 5000,
  handlers: {
    messages: {
      handleDoubleClickTitleBar: ({}) => {
        mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
      },
    },
    requests: {},
  },
})
