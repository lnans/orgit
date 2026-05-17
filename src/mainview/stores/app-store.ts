import { AppStateDto } from '@shared/app-state-dto'
import { RepositoryDto } from '@shared/repository-dto'
import { create } from 'zustand'

type AppStateActions = {
  actions: {
    loadAppState: (appState: AppStateDto) => void
    setRepositories: (repositories: RepositoryDto[]) => void
    selectRepository: (repository: string) => void
  }
}

type AppState = AppStateDto & AppStateActions

export const useAppStore = create<AppState>()((set) => ({
  workspacePath: '',
  repositories: [],
  selectedRepository: undefined,
  actions: {
    loadAppState: (appState) => set(() => ({ ...appState })),
    setRepositories: (repositories) =>
      set((state) => {
        if (!state.selectedRepository && repositories.length > 0) {
          state.selectedRepository = repositories[0]
        }
        return { repositories: repositories }
      }),
    selectRepository: (repository) =>
      set((state) => {
        const selectedRepo = state.repositories.find((repo) => repo.name === repository)
        return { selectedRepository: selectedRepo }
      }),
  },
}))
