import { Card, CardContent } from '@client/components/ui/card'
import { SidebarMenuItem } from '@client/components/ui/sidebar'
import { Text } from '@client/components/ui/text'
import { cn } from '@client/lib/utils'
import { useAppStore, useSelectedWorktreePath } from '@client/store'
import { Worktree } from '@shared/types'
import { cva } from 'class-variance-authority'
import { FileBracesIcon, Minus, Plus } from 'lucide-react'

const worktreeMenuItemVariants = cva('pt-0.5 pb-1 mx-2 gap-0 rounded-sm cursor-pointer hover:bg-secondary transition-all', {
  variants: {
    isSelected: {
      true: 'bg-secondary',
      false: '',
    },
  },
})

type WorktreeMenuItemProps = {
  worktree: Worktree
}

function WorktreeMenuItem({ worktree }: WorktreeMenuItemProps) {
  const selectedWorktreePath = useSelectedWorktreePath()
  const selectWorktree = useAppStore((state) => state.selectWorktree)

  const isSelected = selectedWorktreePath === worktree.path
  const hasChanges = worktree.linesAdded > 0 || worktree.linesRemoved > 0 || worktree.filesModified > 0

  return (
    <SidebarMenuItem onClick={() => selectWorktree(worktree.path)}>
      <Card className={cn(worktreeMenuItemVariants({ isSelected }))}>
        <CardContent className="px-2">
          <div className="flex flex-col w-full flex-1 gap-1">
            <Text className="font-medium text-[10px]">{worktree.name}</Text>

            {hasChanges && (
              <div className="inline-flex items-center gap-1">
                <GitStat className="text-green-600" number={worktree.linesAdded} icon={<Plus size={10} />} />
                <GitStat className="text-red-600" number={worktree.linesRemoved} icon={<Minus size={10} />} />
                <GitStat
                  className="text-neutral-400 gap-0.5"
                  number={worktree.filesModified}
                  icon={<FileBracesIcon size={10} />}
                />
              </div>
            )}

            {!hasChanges && <Text className="text-[10px] text-muted-foreground">No changes</Text>}
          </div>
        </CardContent>
      </Card>
    </SidebarMenuItem>
  )
}

function GitStat({ className, number, icon }: { className?: string; number: number; icon: React.ReactNode }) {
  if (number === 0) return null
  return (
    <div className={cn('inline-flex items-center text-[10px]', className)}>
      {icon}
      {number}
    </div>
  )
}

export { WorktreeMenuItem }
