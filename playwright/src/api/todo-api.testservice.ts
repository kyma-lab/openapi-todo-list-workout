/**
 * This file was auto-generated from openapi.json
 * DO NOT MAKE DIRECT CHANGES - Use scripts/generate-api-service.js
 * Generated at: 2025-10-25T13:34:40.113Z
 */

import { APIRequestContext } from '@playwright/test';
import { Todo, TodoUpdateRequest, Category, DeleteResponse, TodoFilterParams } from './types';

/**
 * Service class for interacting with the Todo API
 * Encapsulates all API calls to the backend
 */
export class TodoApiTestservice {
  private baseURL: string;
  private apiPath = '';

  constructor(private request: APIRequestContext, baseURL: string = 'http://localhost:8080') {
    this.baseURL = baseURL;
  }

  /**
   * Get todo by ID
   */
  async getTodoById(id: number): Promise<Todo> {
    const response = await this.request.get(`${this.baseURL}${this.apiPath}/api/v1/todos/${id}`);

    if (!response.ok()) {
      throw new Error(`Failed to getTodoById: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Update todo
   */
  async updateTodo(id: number, todo: Todo): Promise<Todo> {
    const response = await this.request.put(`${this.baseURL}${this.apiPath}/api/v1/todos/${id}`, {
      data: todo,
    });

    if (!response.ok()) {
      throw new Error(`Failed to updateTodo: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Delete todo
   */
  async deleteTodo(id: number): Promise<DeleteResponse> {
    const response = await this.request.delete(`${this.baseURL}${this.apiPath}/api/v1/todos/${id}`);

    if (!response.ok()) {
      throw new Error(`Failed to deleteTodo: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Partial update todo
   */
  async patchTodo(id: number, updates: TodoUpdateRequest): Promise<Todo> {
    const response = await this.request.patch(`${this.baseURL}${this.apiPath}/api/v1/todos/${id}`, {
      data: updates,
    });

    if (!response.ok()) {
      throw new Error(`Failed to patchTodo: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Get all todos
   */
  async getTodos(params?: TodoFilterParams): Promise<Todo[]> {
    const url = new URL(`${this.baseURL}${this.apiPath}/api/v1/todos`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request.get(url.toString());

    if (!response.ok()) {
      throw new Error(`Failed to getTodos: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Create new todo
   */
  async createTodo(todo: Todo): Promise<Todo> {
    const response = await this.request.post(`${this.baseURL}${this.apiPath}/api/v1/todos`, {
      data: todo,
    });

    if (!response.ok()) {
      throw new Error(`Failed to createTodo: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await this.request.get(`${this.baseURL}${this.apiPath}/api/v1/categories`);

    if (!response.ok()) {
      throw new Error(`Failed to getCategories: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Create new category
   */
  async createCategory(category: Category): Promise<Category> {
    const response = await this.request.post(`${this.baseURL}${this.apiPath}/api/v1/categories`, {
      data: category,
    });

    if (!response.ok()) {
      throw new Error(`Failed to createCategory: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Get today's todos
   */
  async getTodaysTodos(completed?: boolean): Promise<Todo[]> {
    const url = new URL(`${this.baseURL}${this.apiPath}/api/v1/todos/today`);

    if (completed !== undefined) {
      url.searchParams.append('completed', String(completed));
    }

    const response = await this.request.get(url.toString());

    if (!response.ok()) {
      throw new Error(`Failed to getTodaysTodos: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

}
