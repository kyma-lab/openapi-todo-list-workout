'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Task, CreateTaskDto, UpdateTaskDto, Category } from '../types'
import { useCategories } from './use-categories'

// Backend task format
interface BackendTask {
  id: number
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
  category?: string
  important: boolean
  dueDate?: string | null
}

// Transform backend task to frontend format
function transformBackendTask(task: BackendTask, categories: Category[] = []): Task {
  // Find category by name instead of hardcoding
  const category = categories.find(cat => 
    cat.name.toLowerCase() === task.category?.trim().toLowerCase()
  )
  
  // Removed debug logging
  
  return {
    id: String(task.id),
    title: task.title,
    description: task.description || '',
    completed: task.completed,
    important: task.important,
    dueDate: task.dueDate || undefined, // null becomes undefined
    dueTime: '', // Backend doesn't separate date/time
    categoryId: category ? category.id : '', // Use found category ID
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }
}

// Removed mapCategoryIdToName - using dynamic category lookup instead

export function useTasks() {
  // Load categories for transformation
  const { data: categories = [] } = useCategories()

  return useQuery({
    queryKey: ['tasks', categories], // Add categories to query key
    queryFn: async () => {
      try {
        const response = await api.getTasks()
        // Extract tasks from ApiResponse
        const backendTasks = response.data as BackendTask[]
      
        // Pass categories to transformation function
        const transformedTasks = backendTasks.map(task => transformBackendTask(task, categories))
        return transformedTasks
      } catch (error) {
        console.error('Error fetching tasks:', error)
        throw error
      }
    },
    enabled: !!categories.length, // Enable only when categories are loaded
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const response = await api.getTask(id)
      const backendTask = response.data as BackendTask
      
      return transformBackendTask(backendTask, [])
    },
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTaskDto) => {
      // Get cached categories to find the correct name
      const categories = queryClient.getQueryData<Category[]>(['categories']) || []
      const categoryName = categories.find(cat => cat.id === data.categoryId)?.name || ''
      
      // Transform frontend format to backend format
      const backendData = {
        title: data.title,
        description: data.description,
        category: categoryName, // Send name to backend
        important: data.important,
        dueDate: data.dueDate || null,
      }
      
      const response = await api.createTask(backendData)
      const backendTask = response.data as BackendTask
      
      // Transform backend response to frontend format
      return transformBackendTask(backendTask, categories)
    },
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskDto }) => {
      // Get cached categories to find the correct name
      const categories = queryClient.getQueryData<Category[]>(['categories']) || []
      
      // Transform frontend format to backend format
      const backendData = {
        ...data,
        category: data.categoryId ? categories.find(cat => cat.id === data.categoryId)?.name || '' : undefined
      }
      // Remove categoryId as backend doesn't expect it
      delete (backendData as any).categoryId
      
      const response = await api.updateTask(id, backendData)
      const backendTask = response.data as BackendTask
      
      return transformBackendTask(backendTask, categories)
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.deleteTask(id)
      return id
    },
    onSuccess: (id) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.removeQueries({ queryKey: ['tasks', id] })
    },
  })
}