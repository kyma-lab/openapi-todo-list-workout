'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Category } from '../types'

// Backend category format
interface BackendCategory {
  id: number
  name: string
  description?: string
  createdAt: string
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.getCategories()
      console.log('Backend categories response:', response)
      // Extract categories from ApiResponse
      const backendCategories = response.data as BackendCategory[]
      console.log('Parsed backend categories:', backendCategories)
      
      const transformedCategories = backendCategories.map((cat): Category => ({
        id: String(cat.id),
        name: cat.name,
        icon: '📁', // Default icon for now
        color: 'bg-primary', // Default color
        taskCount: 0, // Will be calculated elsewhere
        completedCount: 0, // Will be calculated elsewhere
        createdAt: cat.createdAt,
        updatedAt: cat.createdAt, // Backend doesn't have updatedAt
      }))
      
      console.log('Transformed categories for frontend:', transformedCategories)
      return transformedCategories
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      const response = await api.getCategory(id)
      return response.data as Category
    },
    enabled: !!id,
  })
}