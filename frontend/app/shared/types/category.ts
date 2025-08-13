export interface Category {
  id: string
  name: string
  icon: string
  color: string
  taskCount: number
  completedCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryDto {
  name: string
  icon?: string
  color?: string
}

export interface UpdateCategoryDto {
  name?: string
  icon?: string
  color?: string
}

// Icon suggestions based on category keywords
export const CATEGORY_ICON_SUGGESTIONS: Record<string, string> = {
  work: '💼',
  personal: '👤',
  shopping: '🛒',
  health: '🏥',
  fitness: '💪',
  education: '📚',
  travel: '✈️',
  home: '🏠',
  finance: '💰',
  hobby: '🎨',
  family: '👨‍👩‍👧‍👦',
  food: '🍽️',
}