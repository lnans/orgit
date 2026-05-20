import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@client/components/ui/sidebar'
import { useSelectedRepository } from '@client/store'
import { useTranslation } from 'react-i18next'
import { WorktreeMenuItem } from './worktree-menu-item'
import { WorktreeMenuLabel } from './worktree-menu-label'

function WorktreeMenu() {
  const { t } = useTranslation()
  const selectedRepository = useSelectedRepository()
  const worktrees = selectedRepository?.worktrees ?? []

  return (
    <SidebarGroup>
      <WorktreeMenuLabel label={t('worktrees')} />

      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {worktrees.map((worktree) => (
            <WorktreeMenuItem key={worktree.path} worktree={worktree} />
          ))}
          {worktrees.length === 0 && (
            <div className="flex w-full items-center justify-center p-4 text-[10px] font-semibold text-muted-foreground">
              {selectedRepository ? t('noData') : t('selectRepositoryFirst')}
            </div>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export { WorktreeMenu }
