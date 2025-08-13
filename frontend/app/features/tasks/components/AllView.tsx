'use client'

import { useTasks, useCategories } from '@/app/shared/hooks'
import { TaskList } from '@/app/shared/components'

interface AllViewProps {
  onEdit?: (taskId: string) => void
}

export default function AllView({ onEdit }: AllViewProps) {
  const { data: tasks = [], isLoading, error } = useTasks()
  const { data: categories = [] } = useCategories()

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
        <h1 className="text-3xl font-bold text-primary-dark mb-2">All Tasks</h1>
        <p className="text-muted-foreground">All tasks including completed ones</p>
      </div>
      
      <div className="max-w-4xl">
        <TaskList 
          tasks={tasks}
          categories={categories}
          emptyMessage="No tasks found"
          onEdit={onEdit}
        />
      </div>
    </div>
  )
}