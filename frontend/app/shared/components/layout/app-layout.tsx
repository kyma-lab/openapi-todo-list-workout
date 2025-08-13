'use client'

import { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '../../lib'
import { useAppStore, selectSidebarOpen } from '../../stores'
import Sidebar from './sidebar'

interface AppLayoutProps {
  children: ReactNode
  onAddNewTask?: () => void
}

export default function AppLayout({ children, onAddNewTask }: AppLayoutProps) {
  const sidebarOpen = useAppStore(selectSidebarOpen)
  const { setSidebarOpen } = useAppStore()

  return (
    <div className="flex h-screen bg-background">
      {/* Left Column - Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 ease-in-out z-50',
          sidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full w-0 overflow-hidden', // Mobiles Verhalten: geöffnet mit Breite 80, geschlossen mit Breite 0 und Überlauf versteckt
          'md:relative md:translate-x-0 md:w-80' // Desktop-Verhalten: immer sichtbar, feste Breite 80 (überschreibt mobiles Verhalten)
        )}
      >
        <Sidebar onAddNewTask={onAddNewTask} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => useAppStore.getState().setSidebarOpen(false)}
        />
      )}

      {/* Right Column - Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Mobile header with hamburger menu */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            data-testid="hamburger-menu-button"
            className="hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary-dark">Todo Tasks</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}