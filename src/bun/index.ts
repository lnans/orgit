import { BrowserWindow, Updater } from 'electrobun/bun'
import { webviewRPC } from './electrobun-server'

const DEV_SERVER_PORT = 5173
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`

// Check if Vite dev server is running for HMR
async function getMainViewUrl(): Promise<string> {
  const channel = await Updater.localInfo.channel()
  if (channel === 'dev') {
    try {
      await fetch(DEV_SERVER_URL, { method: 'HEAD' })
      console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`)
      return DEV_SERVER_URL
    } catch {
      console.log("Vite dev server not running. Run 'bun run dev:hmr' for HMR support.")
    }
  }
  return 'views://mainview/index.html'
}

// Create the main application window
export const mainWindow = new BrowserWindow({
  title: 'Orgit',
  url: await getMainViewUrl(),
  frame: {
    width: 900,
    height: 700,
    x: 200,
    y: 200,
  },
  styleMask: {
    Resizable: true,
    Borderless: true,
    Closable: true,
    FullSizeContentView: true,
  },
  trafficLightOffset: {
    y: 6,
    x: 6,
  },
  titleBarStyle: 'hiddenInset',
  rpc: webviewRPC,
})
