import { mainProcess } from '@client/rpc'
import { PERSISTED_STATE_VERSION, type AppState } from '@shared/types'
import { getSelectedWorktreePath } from '@shared/selection'
import { create } from 'zustand'

type AppStore = AppState & {
  syncAppState: (appState: AppState) => void
  selectRepository: (path: string) => void
  selectWorktree: (path: string) => void
}

export const useAppStore = create<AppStore>()((set) => ({
  version: PERSISTED_STATE_VERSION,
  workspacePath: '',
  repositories: [],
  selectedRepositoryPath: undefined,
  selectedWorktreePaths: {},
  syncAppState: (appState) => set(() => ({ ...appState })),
  selectRepository: (path) => {
    mainProcess.onSelectRepository(path)
  },
  selectWorktree: (path) => {
    mainProcess.onSelectWorktree(path)
  },
}))

export function useSelectedRepository() {
  return useAppStore((state) => state.repositories.find((repository) => repository.path === state.selectedRepositoryPath))
}

export function useSelectedWorktreePath() {
  return useAppStore((state) => getSelectedWorktreePath(state))
}
