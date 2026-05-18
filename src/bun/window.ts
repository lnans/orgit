import { BrowserWindow, Updater } from 'electrobun/bun'
import type { WebviewRPC } from './rpc'

const DEV_SERVER_URL = 'http://localhost:5173'
const MAIN_VIEW_URL = 'views://mainview/index.html'

async function resolveMainViewUrl(): Promise<string> {
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
  return MAIN_VIEW_URL
}

export async function createMainWindow(rpc: WebviewRPC) {
  return new BrowserWindow({
    title: 'Orgit',
    url: await resolveMainViewUrl(),
    frame: { width: 900, height: 700, x: 200, y: 200 },
    styleMask: {
      Resizable: true,
      Borderless: true,
      Closable: true,
      FullSizeContentView: true,
    },
    trafficLightOffset: { y: 6, x: 6 },
    titleBarStyle: 'hiddenInset',
    rpc,
  })
}
