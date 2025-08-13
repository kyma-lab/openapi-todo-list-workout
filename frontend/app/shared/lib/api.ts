import { ApiResponse } from '../types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        )
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        0
      )
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Custom ApiError class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const apiClient = new ApiClient()

// Specific API endpoints
export const api = {
  // Tasks
  getTasks: () => apiClient.get('/todos'),
  getTask: (id: string) => apiClient.get(`/todos/${id}`),
  createTask: (data: any) => apiClient.post('/todos', data),
  updateTask: (id: string, data: any) => apiClient.patch(`/todos/${id}`, data),
  deleteTask: (id: string) => apiClient.delete(`/todos/${id}`),

  // Categories (if backend supports them)
  getCategories: () => apiClient.get('/categories'),
  getCategory: (id: string) => apiClient.get(`/categories/${id}`),
  createCategory: (data: any) => apiClient.post('/categories', data),
  updateCategory: (id: string, data: any) => apiClient.patch(`/categories/${id}`, data),
  deleteCategory: (id: string) => apiClient.delete(`/categories/${id}`),
}