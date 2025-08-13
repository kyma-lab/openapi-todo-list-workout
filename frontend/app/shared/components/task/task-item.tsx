'use client'

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Calendar, Clock, Trash2 } from 'lucide-react'
import { Task, Category } from '../../types'
import { cn, formatDate, isTaskOverdue, isTaskDueToday } from '../../lib'
import { useAppStore, selectCurrentView } from '../../stores'
import { useUpdateTask, useDeleteTask } from '../../hooks'

interface TaskItemProps {
  task: Task
  categories?: Category[] // NEW: Categories for name lookup
  onEdit?: (taskId: string) => void
}

export default function TaskItem({
  task,
  categories = [],
  onEdit,
}: TaskItemProps) {
  const currentView = useAppStore(selectCurrentView)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  
  const isOverdue = isTaskOverdue(task)
  const isDueToday = isTaskDueToday(task)

  // Determine priority color for the indicator bar
  const getPriorityColor = () => {
    // Completed tasks get a muted gray color
    if (task.completed) return 'bg-gray-300'
    // Important tasks get yellow indicator
    if (task.important) return 'bg-yellow-500'
    // Overdue tasks get red indicator
    if (isOverdue) return 'bg-red-400'
    // Due today gets orange indicator
    if (isDueToday) return 'bg-orange-500'
    // Use bright green as default color matching the design
    return 'bg-bright-green'
  }

  // Format date/time based on current view context
  const getDateTimeDisplay = () => {
    if (!task.dueDate) return null

    // In My Day view, show time if available, otherwise show date
    if (currentView === 'my-day' && task.dueTime) {
      return formatDate(task.dueDate, 'time')
    }

    // In other views, show full date
    return formatDate(task.dueDate, 'short')
  }

  const dateTimeDisplay = getDateTimeDisplay()

  const handleToggleComplete = () => {
    updateTask.mutate({ id: task.id, data: { completed: !task.completed } })
  }

  const handleToggleImportant = () => {
    updateTask.mutate({ id: task.id, data: { important: !task.important } })
  }

  const handleDelete = () => {
    deleteTask.mutate(task.id)
  }

  return (
    <div
      data-testid={`task-item-${task.id}`}
      className={cn(
        'group relative flex items-center p-4 bg-card border border-border rounded-lg',
        'hover:shadow-md transition-all duration-200 cursor-pointer',
        task.completed && 'opacity-60',
        isOverdue && !task.completed && 'border-orange-200 bg-orange-50/50'
      )}
      onClick={() => onEdit?.(task.id)}
    >
      {/* Priority Indicator (thin colored bar) */}
      <div
        className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-lg', getPriorityColor())}
      />

      {/* Checkbox */}
      <div className="mr-4" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          data-testid={`task-checkbox-${task.id}`}
          checked={task.completed}
          onCheckedChange={handleToggleComplete}
          className="h-5 w-5"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Task Title */}
        <h3
          className={cn(
            'font-medium text-foreground line-clamp-2',
            task.completed && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </h3>

        {/* Task Description (if available) */}
        {task.description && (
          <p
            className={cn(
              'text-sm text-muted-foreground line-clamp-1',
              task.completed && 'line-through'
            )}
          >
            {task.description}
          </p>
        )}

        {/* Metadata Line */}
        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
          {/* Date/Time Display */}
          {dateTimeDisplay && (
            <div className="flex items-center space-x-1">
              {currentView === 'my-day' && task.dueTime ? (
                <Clock className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span
                className={cn(
                  // Default time color (blau-grau wie im Design)
                  'text-slate-600',
                  // Important tasks get red time (wie im Design)
                  task.important && !task.completed && 'text-red-500 font-medium',
                  // Overdue tasks get orange time
                  isOverdue && !task.completed && 'text-orange-700 font-medium',
                  // Completed tasks get muted color
                  task.completed && 'text-muted-foreground'
                )}
              >
                {dateTimeDisplay}
              </span>
            </div>
          )}

          {/* Category Badge */}
          {task.categoryId && (
            <Badge variant="secondary" className="text-xs">
              {categories.find(cat => cat.id === task.categoryId)?.name || task.categoryId}
            </Badge>
          )}

          {/* Overdue indicator */}
          {isOverdue && !task.completed && (
            <Badge variant="outline" className="text-xs border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-100">
              Overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Important Star */}
        <Button
          data-testid={`task-star-${task.id}`}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            handleToggleImportant()
          }}
        >
          <Star
            className={cn(
              'h-4 w-4',
              task.important
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-muted-foreground hover:text-yellow-500'
            )}
          />
        </Button>

        {/* Delete Action */}
        <Button
          data-testid={`task-delete-${task.id}`}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500 transition-colors" />
        </Button>
      </div>
    </div>
  )
}