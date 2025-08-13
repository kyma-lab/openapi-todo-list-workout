'use client'

import { useTasks, useCategories } from '@/app/shared/hooks'
import { TaskList } from '@/app/shared/components'
import { useAppStore, selectSelectedCategoryId } from '@/app/shared/stores'

interface CategoryViewProps {
  onEdit?: (taskId: string) => void
}

export default function CategoryView({ onEdit }: CategoryViewProps) {
  const { data: tasks = [], isLoading, error } = useTasks()
  const { data: categories = [] } = useCategories()
  const selectedCategoryId = useAppStore(selectSelectedCategoryId)
  
  const category = categories.find(c => c.id === selectedCategoryId)
  const categoryTasks = tasks.filter(task => task.categoryId === selectedCategoryId)

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

  if (!category) {
    return <div className="p-8">Please select a category from the sidebar.</div>
  }
  
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-dark mb-2">{category.name}</h1>
        <p className="text-muted-foreground">Tasks in this category</p>
      </div>
      
      <div className="max-w-4xl">
        <TaskList 
          tasks={categoryTasks}
          categories={categories}
          emptyMessage="No tasks in this category"
          onEdit={onEdit}
        />
      </div>
    </div>
  )
}