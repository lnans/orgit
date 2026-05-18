import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@client/components/ui/sidebar'
import { Text } from '@client/components/ui/text'
import { Title } from '@client/components/ui/title'
import { RepositoryMenu } from '@client/features/repositories/components/repository-menu'
import { mainProcess } from '@client/rpc'
import { useAppStore } from '@client/store'
import { FolderOpen } from 'lucide-react'
import { I18nextProvider } from 'react-i18next'
import { ScrollArea } from './components/ui/scroll-area'
import { TooltipProvider } from './components/ui/tooltip'
import { i18next } from './lib/i18n'

function App() {
  const workspacePath = useAppStore((state) => state.workspacePath)

  return (
    <div className="h-dvh overflow-hidden relative">
      <SidebarProvider className="absolute inset-0 overflow-hidden">
        {/* Header bar */}
        <div
          onDoubleClick={mainProcess.onDoubleClickTitleBar}
          className="absolute top-0 left-0 right-0 h-10 z-50 inline-flex items-center justify-end bg-sidebar border-b px-2 electrobun-webkit-app-region-drag"
        >
          <SidebarTrigger
            variant="ghost"
            size="icon-lg"
            className="cursor-pointer text-sidebar-ring hover:text-sidebar-ring electrobun-webkit-app-region-no-drag"
          />
        </div>

        {/* Content between header and footer */}
        <div className="absolute top-10 bottom-6 left-0 right-0 flex flex-row overflow-hidden">
          <Sidebar className="pt-10">
            <SidebarContent>
              <ScrollArea className="h-full">
                <RepositoryMenu />
              </ScrollArea>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 overflow-auto">
            <Title variant="h3">Orgit</Title>
            <Text>Welcome to Orgit, your personal Git client.</Text>
          </main>
        </div>

        {/* Footer bar */}
        <div className="absolute left-0 bottom-0 right-0 h-6 z-50 inline-flex items-center bg-sidebar border-t px-2 gap-1">
          <FolderOpen size={10} className="text-sidebar-ring" />
          <Text className="text-[10px]" variant="muted">
            {workspacePath || '-'}
          </Text>
        </div>
      </SidebarProvider>
    </div>
  )
}

function Root() {
  return (
    <I18nextProvider i18n={i18next}>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </I18nextProvider>
  )
}

export { Root }
