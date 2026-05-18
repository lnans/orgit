import { Card, CardContent } from '@client/components/ui/card'
import { SidebarMenuItem } from '@client/components/ui/sidebar'
import { Text } from '@client/components/ui/text'
import { cn } from '@client/lib/utils'
import { useAppStore } from '@client/store'
import { cva } from 'class-variance-authority'
import { GitBranch } from 'lucide-react'

const repositoryMenuItemVariants = cva('pt-0.5 pb-1 mx-2 gap-0 rounded-sm cursor-pointer hover:bg-secondary transition-all', {
  variants: {
    isSelected: {
      true: 'bg-secondary',
      false: '',
    },
  },
})

type RepositoryMenuItemProps = {
  name: string
  branch: string
}

function RepositoryMenuItem({ name, branch }: RepositoryMenuItemProps) {
  const selectedRepository = useAppStore((state) => state.selectedRepository)
  const selectRepository = useAppStore((state) => state.selectRepository)

  const isSelected = selectedRepository?.name === name
  return (
    <SidebarMenuItem onClick={() => selectRepository(name)}>
      <Card className={cn(repositoryMenuItemVariants({ isSelected }))}>
        <CardContent className="px-2">
          <div className="inline-flex w-full flex-1 items-center justify-between">
            <Text className="font-medium text-[10px]">{name}</Text>
            <div className="inline-flex items-center gap-1">
              <GitBranch height={10} width={10} className="text-muted-foreground" />
              <Text variant="muted" className="text-[10px]">
                {branch}
              </Text>
            </div>
          </div>
        </CardContent>
      </Card>
    </SidebarMenuItem>
  )
}

export { RepositoryMenuItem }
