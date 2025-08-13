'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Search,
  Sun,
  Star,
  List,
  Archive,
  Plus,
  CheckCircle2,
  Briefcase,
  User,
  ShoppingCart,
  Menu,
  X,
  Loader2,
} from 'lucide-react'
import { useAppStore, selectCurrentView, selectSearchQuery, selectSidebarOpen, selectSelectedCategoryId } from '../../stores'
import { useCategories, useTasks } from '../../hooks'
import { cn, calculateCompletionPercentage } from '../../lib'
interface SidebarProps {
  onAddNewTask?: () => void
}

export default function Sidebar({ onAddNewTask }: SidebarProps = {}) {
  
  const currentView = useAppStore(selectCurrentView)
  const searchQuery = useAppStore(selectSearchQuery)
  const sidebarOpen = useAppStore(selectSidebarOpen)
  const selectedCategoryId = useAppStore(selectSelectedCategoryId) // NEW
  const { setCurrentView, setSearchQuery, setSidebarOpen } = useAppStore()

  // Fetch data from API
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: tasks = [] } = useTasks()

  // Calculate navigation counts from tasks (memoized for performance)
  const navigationCounts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      today: tasks.filter(task => task.dueDate === today).length,
      important: tasks.filter(task => task.important).length,
      active: tasks.filter(task => !task.completed).length,
      all: tasks.length, // Total count of all tasks
    }
  }, [tasks])

  const navigationItems = [
    {
      id: 'my-day' as const,
      label: 'My Day',
      icon: Sun,
      count: navigationCounts.today,
    },
    {
      id: 'important' as const,
      label: 'Important',
      icon: Star,
      count: navigationCounts.important,
    },
    {
      id: 'active' as const,
      label: 'Active',
      icon: List,
      count: navigationCounts.active,
    },
    {
      id: 'all' as const,
      label: 'All',
      icon: Archive,
      count: navigationCounts.all,
    },
  ]

  // Process categories with task counts
  const categoriesWithCounts = categories.map(category => {
    const categoryTasks = tasks.filter(task => task.categoryId === category.id)
    const completedTasks = categoryTasks.filter(task => task.completed)
    const completionPercentage = calculateCompletionPercentage(completedTasks.length, categoryTasks.length)

    // Dynamic icon selection based on category name
    const getIconComponent = (iconName: string, categoryName: string) => {
      // First try the provided iconName
      const iconMap: Record<string, any> = {
        'Briefcase': Briefcase,
        'User': User,
        'ShoppingCart': ShoppingCart,
        'List': List,
      }
      
      if (iconMap[iconName]) {
        return iconMap[iconName]
      }
      
      // Dynamic selection based on category name
      const name = categoryName.toLowerCase()
      if (name.includes('work') || name.includes('office') || name.includes('job')) {
        return Briefcase
      }
      if (name.includes('personal') || name.includes('self') || name.includes('me')) {
        return User
      }
      if (name.includes('shop') || name.includes('buy') || name.includes('purchase') || name.includes('grocery')) {
        return ShoppingCart
      }
      
      // Default fallback
      return List
    }

    return {
      ...category,
      taskCount: categoryTasks.length,
      completedCount: completedTasks.length,
      completionPercentage,
      icon: getIconComponent(category.icon, category.name),
      color: category.color || 'bg-primary',
    }
  })

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          {/* Premium checkmark logo with gradient and drop shadow */}
          <div className="relative">
            <div
              className={cn(
                'w-10 h-10 bg-gradient-to-br from-primary to-primary-medium rounded-lg shadow-lg',
                'flex items-center justify-center transition-transform duration-200',
                'hover:scale-105 hover:shadow-xl cursor-pointer'
              )}
            >
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">Tasks</h1>
        </div>

        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          data-testid="sidebar-close-button"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
        {/* Global Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-background"
            data-testid="search-input"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start h-12 text-left group',
                  isActive
                    ? 'bg-teal text-white hover:bg-teal/90'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
                data-testid={`nav-${item.id}`}
                onClick={() => {
                  // Reset selectedCategoryId when navigating away from categories
                  if (item.id as string !== 'category') {
                    setCurrentView(item.id, undefined)
                  } else {
                    setCurrentView(item.id)
                  }
                }}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {item.count > 0 && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'ml-auto',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-transparent text-gray-600'
                    )}
                  >
                    {item.count}
                  </Badge>
                )}
              </Button>
            )
          })}
        </nav>

        {/* My Categories Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider">
              My categories {categoriesWithCounts.length}
            </h3>
            {categoriesLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>

          <div className="space-y-3">
            {categoriesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              categoriesWithCounts.map((category) => {
                const Icon = category.icon
                // Check if category view AND ID matches
                const isActive = currentView === 'category' && selectedCategoryId === category.id

                return (
                  <Card
                    key={category.id}
                    className={cn(
                      'p-4 cursor-pointer transition-all duration-200 hover:shadow-sm',
                      isActive ? 'bg-primary text-white' : 'hover:bg-gray-50'
                    )}
                    data-testid={`category-card-${category.id}`}
                    // Pass category ID when clicking
                    onClick={() => setCurrentView('category', category.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        isActive ? 'bg-white/30' : 'bg-[#34d169]/10'
                      )}>
                        <Icon className={cn(
                          'w-5 h-5',
                          isActive ? 'text-white' : 'text-[#34d169]'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{category.name}</h4>
                        <span className={cn(
                          "text-xs",
                          isActive ? "text-white/70" : "text-muted-foreground"
                        )}>
                          {category.taskCount} Tasks
                        </span>
                      </div>
                      
                      {/* Progress Ring Chart - Right aligned */}
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
                          <circle
                            cx="20"
                            cy="20"
                            r="18"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className={cn(
                              isActive ? "text-white/20" : "text-gray-200"
                            )}
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r="18"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={`${category.completionPercentage * 1.13} 113`}
                            className={cn(
                              isActive ? "text-white" : "text-[#34d169]"
                            )}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={cn(
                            "text-xs font-semibold",
                            isActive ? "text-white" : "text-foreground"
                          )}>
                            {category.completionPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Add New Task Button */}
      <div className="p-6 border-t border-border">
        <Button 
          className="w-full h-12 bg-teal hover:bg-teal/90 text-white font-semibold"
          data-testid="add-new-task-button"
          onClick={() => onAddNewTask?.()}
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Task
        </Button>
      </div>
    </div>
  )
}