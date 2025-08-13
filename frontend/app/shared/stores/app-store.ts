'use client'

import { create } from 'zustand'
import { AppState, ViewType } from '../types'

interface AppStore extends AppState {
  // Actions
  setSidebarOpen: (open: boolean) => void
  setCurrentView: (view: ViewType, categoryId?: string | null) => void // NEW: Optional parameter
  setSearchQuery: (query: string) => void
  setSelectedDate: (date: string | null) => void
  
  // Computed getters
  isSearchActive: () => boolean
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  sidebarOpen: false,
  currentView: 'welcome',
  searchQuery: '',
  selectedDate: null,
  selectedCategoryId: null, // NEW

  // Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setCurrentView: (view, categoryId = null) => set({ 
    currentView: view, 
    selectedCategoryId: categoryId 
  }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSelectedDate: (date) => set({ selectedDate: date }),

  // Computed getters
  isSearchActive: () => {
    const state = get()
    return state.searchQuery.length > 0
  },
}))

// Selectors for performance optimization
export const selectSidebarOpen = (state: AppStore) => state.sidebarOpen
export const selectCurrentView = (state: AppStore) => state.currentView
export const selectSearchQuery = (state: AppStore) => state.searchQuery
export const selectSelectedDate = (state: AppStore) => state.selectedDate
export const selectSelectedCategoryId = (state: AppStore) => state.selectedCategoryId // NEW