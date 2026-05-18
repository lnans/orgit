import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@client/components/ui/sidebar'
import { useAppStore } from '@client/store'
import { useTranslation } from 'react-i18next'
import { RepositoryMenuItem } from './repository-menu-item'
import { RepositoryMenuLabel } from './repository-menu-label'

function RepositoryMenu() {
  const { t } = useTranslation()
  const repositories = useAppStore((state) => state.repositories)

  return (
    <SidebarGroup>
      <RepositoryMenuLabel label={t('repositories')} />

      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {repositories.map((repository) => (
            <RepositoryMenuItem key={repository.name} name={repository.name} branch={repository.branch} />
          ))}
          {repositories.length === 0 && (
            <div className="flex items-center justify-center p-4 text-muted-foreground font-semibold text-[10px] w-full">
              {t('noData')}
            </div>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export { RepositoryMenu }
