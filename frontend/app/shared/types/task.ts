export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  important: boolean
  dueDate?: string
  dueTime?: string
  categoryId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  important?: boolean
  dueDate?: string
  dueTime?: string
  categoryId?: string
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  completed?: boolean
  important?: boolean
  dueDate?: string
  dueTime?: string
  categoryId?: string
}

export type TaskStatus = 'active' | 'completed' | 'overdue'

export type TaskFilter = 'all' | 'active' | 'important' | 'today' | 'category'