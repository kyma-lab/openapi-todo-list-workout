'use client'

import { Task, Category } from '../../types'
import TaskItem from './task-item'
import NoTasksOverlay from '../ui/no-tasks-overlay'

interface TaskListProps {
  tasks: Task[]
  categories?: Category[] // NEW: Categories for name lookup
  emptyMessage?: string
  onEdit?: (taskId: string) => void
}

export default function TaskList({
  tasks,
  categories = [],
  emptyMessage = 'Keine Aufgaben gefunden',
  onEdit,
}: TaskListProps) {
  return (
    <div className="relative">
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            categories={categories}
            onEdit={onEdit}
          />
        ))}
      </div>
      
      <NoTasksOverlay
        show={tasks.length === 0}
        message={emptyMessage}
        icon={
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-muted-foreground/20 rounded-full" />
          </div>
        }
      />
    </div>
  )
}