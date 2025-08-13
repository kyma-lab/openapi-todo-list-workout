'use client'

import { useTasks, useCategories } from '@/app/shared/hooks'
import { TaskList } from '@/app/shared/components'
import { useAppStore, selectSearchQuery } from '@/app/shared/stores'

interface SearchResultsViewProps {
  onEdit?: (taskId: string) => void
}

export default function SearchResultsView({ onEdit }: SearchResultsViewProps) {
  const { data: tasks = [], isLoading, error } = useTasks()
  const { data: categories = [] } = useCategories()
  const searchQuery = useAppStore(selectSearchQuery)
  
  // Filter tasks based on search query
  const searchResults = tasks.filter(task => {
    const query = searchQuery.toLowerCase()
    return (
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.categoryId?.toLowerCase().includes(query)
    )
  })

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
        <h1 className="text-3xl font-bold text-primary-dark mb-2">
          Search Results
        </h1>
        <p className="text-muted-foreground">
          Found {searchResults.length} tasks matching &ldquo;{searchQuery}&rdquo;
        </p>
      </div>
      
      <div className="max-w-4xl">
        <TaskList 
          tasks={searchResults}
          categories={categories}
          emptyMessage={`No tasks found matching "${searchQuery}"`}
          onEdit={onEdit}
        />
      </div>
    </div>
  )
}