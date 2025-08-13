'use client'

import { useTasks, useCategories } from '@/app/shared/hooks'
import { TaskList } from '@/app/shared/components'

interface ActiveViewProps {
  onEdit?: (taskId: string) => void
}

export default function ActiveView({ onEdit }: ActiveViewProps) {
  const { data: tasks = [], isLoading, error } = useTasks()
  const { data: categories = [] } = useCategories()
  
  const activeTasks = tasks.filter(task => !task.completed)

  if (isLoading) {
    return <div className="p-8 text-center">Loading tasks...</div>
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading tasks: {error.message}
      </div>
    )
  }
  
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-dark mb-2">Active Tasks</h1>
        <p className="text-muted-foreground">All uncompleted tasks</p>
      </div>
      
      <div className="max-w-4xl">
        <TaskList 
          tasks={activeTasks}
          categories={categories}
          emptyMessage="No active tasks"
          onEdit={onEdit}
        />
      </div>
    </div>
  )
}