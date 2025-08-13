'use client'

import { useState, useEffect, useCallback } from 'react'
import WelcomePage from './features/welcome/page'
import { AppLayout } from './shared/components'
import TaskForm from './shared/components/forms/task-form'
import { useAppStore, selectCurrentView, selectSearchQuery } from './shared/stores'
import { useTasks } from './shared/hooks'
import { Task } from './shared/types'
import { 
  MyDayView, 
  ImportantView, 
  ActiveView, 
  AllView, 
  CategoryView, 
  SearchResultsView 
} from './features/tasks/components'


export default function Home() {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  
  const currentView = useAppStore(selectCurrentView)
  const searchQuery = useAppStore(selectSearchQuery)
  const { setCurrentView, setSearchQuery } = useAppStore()
  const { data: tasks = [] } = useTasks()
  
  // Check if user is actively searching
  const isSearching = searchQuery.trim().length > 0

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setEditingTask(task)
      setShowTaskForm(true)
    }
  }

  const handleCloseForm = useCallback(() => {
    setShowTaskForm(false)
    setEditingTask(null)
  }, [])

  const handleTaskSuccess = useCallback(() => {
    handleCloseForm()
  }, [handleCloseForm])


  const handleAddNewTask = useCallback(() => {
    setEditingTask(null) // Clear any editing task
    setShowTaskForm(true)
  }, [])

  const renderCurrentView = () => {
    if (isSearching) {
      return <SearchResultsView onEdit={handleEditTask} />
    }

    switch (currentView) {
      case 'my-day':
        return <MyDayView onEdit={handleEditTask} />
      case 'important':
        return <ImportantView onEdit={handleEditTask} />
      case 'active':
        return <ActiveView onEdit={handleEditTask} />
      case 'all':
        return <AllView onEdit={handleEditTask} />
      case 'category':
        return <CategoryView onEdit={handleEditTask} />
      case 'welcome':
        return <WelcomePage />
      default:
        return <MyDayView onEdit={handleEditTask} /> // Default to My Day instead of Welcome
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts if not in an input field or if it's a form
      const target = event.target as HTMLElement
      const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true'
      
      // Handle Escape key to clear search or close form
      if (event.key === 'Escape') {
        if (showTaskForm) {
          handleCloseForm()
        } else if (searchQuery) {
          setSearchQuery('')
        }
        return
      }

      // Don't handle other shortcuts if in input field (unless it's specific shortcuts)
      if (isInInput && event.key !== 'Escape') return
      
      // Keyboard shortcuts
      if (event.key.toLowerCase() === 'n' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleAddNewTask()
      } else if (event.key.toLowerCase() === 'q' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        // Focus search input
        const searchInput = document.querySelector('input[placeholder="Search tasks..."]') as HTMLInputElement
        searchInput?.focus()
      } else if (event.key.toLowerCase() === 't' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        setCurrentView('my-day')
        setSearchQuery('') // Clear search when changing views
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showTaskForm, searchQuery, setCurrentView, setSearchQuery, handleAddNewTask, handleCloseForm])

  // Show welcome screen first
  if (currentView === 'welcome') {
    return <WelcomePage />
  }

  // Show fullscreen task form if open
  if (showTaskForm) {
    return (
      <TaskForm
        task={editingTask || undefined}
        onClose={handleCloseForm}
        onSuccess={handleTaskSuccess}
      />
    )
  }

  // Show main app with two-column layout
  return (
    <AppLayout onAddNewTask={handleAddNewTask}>
      {renderCurrentView()}
    </AppLayout>
  )
}
