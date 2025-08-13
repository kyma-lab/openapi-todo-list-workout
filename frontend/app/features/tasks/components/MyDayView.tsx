'use client'

import { useTasks, useCategories } from '@/app/shared/hooks'
import { TaskList, DateSelector } from '@/app/shared/components'
import { useAppStore, selectSelectedDate } from '@/app/shared/stores'

interface MyDayViewProps {
  onEdit?: (taskId: string) => void
}

export default function MyDayView({ onEdit }: MyDayViewProps) {
  const { data: tasks = [], isLoading, error } = useTasks()
  const { data: categories = [] } = useCategories()
  const selectedDate = useAppStore(selectSelectedDate)
  const { setSelectedDate } = useAppStore()
  
  // Use selected date or default to today
  const targetDate = selectedDate || new Date().toISOString().split('T')[0]
  
  // Filter logic: Show only tasks with the specific target date
  const targetTasks = tasks.filter(task => {
    // Show only tasks with the target date - tasks without dates should not appear
    return task.dueDate === targetDate
  })
  
  // Get display name for the selected date
  const getDateDisplayName = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00') // Ensure local date
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return "Today's Tasks"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow's Tasks"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday's Tasks"
    } else {
      return `${date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      })}`
    }
  }
  
  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

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
        <h1 className="text-3xl font-bold text-center text-primary-dark mb-2">
          {getDateDisplayName(targetDate)}
        </h1>
        <p className="text-center text-muted-foreground">
          You have {targetTasks.length} tasks for this day.
        </p>
      </div>
      
      <div className="max-w-4xl">
        {/* 5-day date selector */}
        <DateSelector 
          selectedDate={targetDate}
          onDateChange={handleDateChange}
        />
        
        <TaskList 
          tasks={targetTasks}
          categories={categories}
          emptyMessage="No tasks scheduled for this day"
          onEdit={onEdit}
        />
      </div>
    </div>
  )
}