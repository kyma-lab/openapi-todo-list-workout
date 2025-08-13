'use client'

import { useTasks, useCategories } from '@/app/shared/hooks'
import { TaskList } from '@/app/shared/components'

interface ImportantViewProps {
  onEdit?: (taskId: string) => void
}

export default function ImportantView({ onEdit }: ImportantViewProps) {
  const { data: tasks = [], isLoading, error } = useTasks()
  const { data: categories = [] } = useCategories()
  
  const importantTasks = tasks.filter(task => task.important)

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
        <h1 className="text-3xl font-bold text-primary-dark mb-2">Important Tasks</h1>
        <p className="text-muted-foreground">Tasks marked as important</p>
      </div>
      
      <div className="max-w-4xl">
        <TaskList 
          tasks={importantTasks}
          categories={categories}
          emptyMessage="No important tasks"
          onEdit={onEdit}
        />
      </div>
    </div>
  )
}