import { Card, CardContent } from '@client/components/ui/card'
import { SidebarMenuItem } from '@client/components/ui/sidebar'
import { Text } from '@client/components/ui/text'
import { cn } from '@client/lib/utils'
import { useAppStore, useSelectedWorktreePath } from '@client/store'
import { cva } from 'class-variance-authority'
import { Folder } from 'lucide-react'

const worktreeMenuItemVariants = cva('pt-0.5 pb-1 mx-2 gap-0 rounded-sm cursor-pointer hover:bg-secondary transition-all', {
  variants: {
    isSelected: {
      true: 'bg-secondary',
      false: '',
    },
  },
})

type WorktreeMenuItemProps = {
  name: string
  path: string
}

function WorktreeMenuItem({ name, path }: WorktreeMenuItemProps) {
  const selectedWorktreePath = useSelectedWorktreePath()
  const selectWorktree = useAppStore((state) => state.selectWorktree)

  const isSelected = selectedWorktreePath === path
  return (
    <SidebarMenuItem onClick={() => selectWorktree(path)}>
      <Card className={cn(worktreeMenuItemVariants({ isSelected }))}>
        <CardContent className="px-2">
          <div className="inline-flex w-full flex-1 items-center justify-between gap-2">
            <Text className="font-medium text-[10px]">{name}</Text>
            <div className="inline-flex min-w-0 max-w-[55%] items-center gap-1">
              {/* TODO: rework this to display git status instead in another commit */}
              <Folder height={10} width={10} className="shrink-0 text-muted-foreground" />
              <Text variant="muted" className="truncate text-[10px]">
                {path}
              </Text>
            </div>
          </div>
        </CardContent>
      </Card>
    </SidebarMenuItem>
  )
}

export { WorktreeMenuItem }
