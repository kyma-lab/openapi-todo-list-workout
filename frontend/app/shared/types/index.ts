export type { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskFilter } from './task'
export type { Category, CreateCategoryDto, UpdateCategoryDto } from './category'
export { CATEGORY_ICON_SUGGESTIONS } from './category'

// Global app state types
export interface AppState {
  sidebarOpen: boolean
  currentView: ViewType
  searchQuery: string
  selectedDate: string | null
  selectedCategoryId: string | null // NEW
}

export type ViewType = 'my-day' | 'important' | 'active' | 'all' | 'category' | 'welcome'

// API response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}