import { mainProcess } from '@client/rpc'
import type { AppState } from '@shared/types'
import { create } from 'zustand'

type AppStore = AppState & {
  syncAppState: (appState: AppState) => void
  selectRepository: (name: string) => void
}

export const useAppStore = create<AppStore>()((set, get) => ({
  workspacePath: '',
  repositories: [],
  selectedRepository: undefined,
  syncAppState: (appState) => set(() => ({ ...appState })),
  selectRepository: (name) => {
    const repository = get().repositories.find((repo) => repo.name === name)
    mainProcess.onSelectRepository(repository)
  },
}))
