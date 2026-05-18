import { Utils } from 'electrobun'
import path from 'node:path'

export const CONFIG_DIR = path.join(Utils.paths.home, '.config', 'orgit')
export const STATE_FILE = path.join(CONFIG_DIR, 'state.json')
export const DEFAULT_WORKSPACE = path.join(CONFIG_DIR, 'workspace')
