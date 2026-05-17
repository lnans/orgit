import { AppStateDto } from '@shared/app-state-dto'
import { Utils } from 'electrobun'
import { existsSync, mkdirSync, readFileSync } from 'fs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const APP_NAME = 'orgit'
const CONFIG_DIR_NAME = '.config'
const STATE_FILE_NAME = 'state.json'
const WORKSPACE_DIR_NAME = 'workspace'

class AppStateService {
  private _state: AppStateDto

  constructor() {
    this._state = this.createIfNotExist()
  }

  get state(): AppStateDto {
    return this._state
  }

  public updateRepositories(repositories: AppStateDto['repositories']) {
    this._state.repositories = repositories
  }

  private createIfNotExist(): AppStateDto {
    const configPath = path.join(Utils.paths.home, CONFIG_DIR_NAME, APP_NAME)
    if (!existsSync(configPath)) {
      mkdirSync(path.dirname(configPath), { recursive: true })
    }
    const stateFilePath = path.join(configPath, STATE_FILE_NAME)
    if (!existsSync(stateFilePath)) {
      const initialState: AppStateDto = {
        workspacePath: path.join(configPath, WORKSPACE_DIR_NAME),
        repositories: [],
      }
      writeFileSync(stateFilePath, JSON.stringify(initialState, null, 2))
      return initialState
    }
    const stateDataStr = readFileSync(stateFilePath, 'utf-8')
    const stateData = JSON.parse(stateDataStr)
    return {
      workspacePath: stateData.workspacePath ?? path.join(configPath, WORKSPACE_DIR_NAME),
      repositories: stateData.repositories ?? [],
    }
  }
}

const appStateService = new AppStateService()

export { appStateService }
