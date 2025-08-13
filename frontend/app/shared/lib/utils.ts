import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Task } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date for display in different contexts
 */
export function formatDate(dateString: string, format: 'full' | 'short' | 'time' = 'full'): string {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (format === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Check if it's today, yesterday, or tomorrow
  const dayDiff = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Tomorrow'
  if (dayDiff === -1) return 'Yesterday'

  // For other dates
  if (format === 'short') {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.completed) return false

  const now = new Date()
  const dueDate = new Date(task.dueDate)

  // If there's a specific time, include it
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':').map(Number)
    dueDate.setHours(hours, minutes, 0, 0)
  } else {
    // If no time specified, consider it due at end of day
    dueDate.setHours(23, 59, 59, 999)
  }

  return now > dueDate
}

/**
 * Check if a task is due today
 */
export function isTaskDueToday(task: Task): boolean {
  if (!task.dueDate) return false

  const today = new Date()
  const dueDate = new Date(task.dueDate)

  return (
    today.getFullYear() === dueDate.getFullYear() &&
    today.getMonth() === dueDate.getMonth() &&
    today.getDate() === dueDate.getDate()
  )
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }) as T
}

/**
 * Calculate completion percentage for categories
 */
export function calculateCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}