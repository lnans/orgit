import { RepositoryDto } from './repository-dto'

export type AppStateDto = {
  workspacePath: string
  repositories: RepositoryDto[]
  selectedRepository?: RepositoryDto
}
