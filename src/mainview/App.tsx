import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider } from '@client/components/ui/sidebar'
import { Text } from '@client/components/ui/text'
import { Title } from '@client/components/ui/title'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { ScrollArea } from './components/ui/scroll-area'
import { TooltipProvider } from './components/ui/tooltip'
import { RepositoryMenu } from './features/repositories/components/repository-menu'
import { server } from './lib/electrobun'
import { i18next } from './lib/i18n'
import { useAppStore } from './stores/app-store'

function App() {
  const { t } = useTranslation()
  const workspacePath = useAppStore((state) => state.workspacePath)

  return (
    <div className="min-h-screen">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader
            onDoubleClick={server.handleDoubleClickTitleBar}
            className="inline-flex justify-center h-10 electrobun-webkit-app-region-drag"
          />
          <SidebarContent>
            <ScrollArea className="h-full">
              <RepositoryMenu />
            </ScrollArea>
          </SidebarContent>
          <SidebarFooter className="border-t">
            <Text variant="muted" className="text-[10px]">
              {t('workspace')}: {workspacePath}
            </Text>
          </SidebarFooter>
        </Sidebar>
        <main>
          <Title variant="h3">Orgit</Title>
          <Text>Welcome to Orgit, your personal Git client.</Text>
        </main>
      </SidebarProvider>
    </div>
  )
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18next}>
      <TooltipProvider>{children}</TooltipProvider>
    </I18nextProvider>
  )
}

export { App, Providers }
