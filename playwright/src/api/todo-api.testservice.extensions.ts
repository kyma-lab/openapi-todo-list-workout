import { APIRequestContext } from '@playwright/test';
import { TodoApiTestservice } from './todo-api.testservice';
import { Todo } from './types';

/**
 * Extended API service with helper methods for testing
 * These methods are manually maintained and not auto-generated
 */
export class TodoApiTestserviceExtended extends TodoApiTestservice {
  constructor(request: APIRequestContext, baseURL?: string) {
    super(request, baseURL);
  }
  /**
   * Delete all todos (for cleanup)
   */
  async deleteAllTodos(): Promise<void> {
    const todos = await this.getTodos();

    for (const todo of todos) {
      if (todo.id) {
        await this.deleteTodo(todo.id);
      }
    }
  }

  /**
   * Create multiple todos at once
   */
  async createMultipleTodos(todos: Todo[]): Promise<Todo[]> {
    const createdTodos: Todo[] = [];

    for (const todo of todos) {
      const created = await this.createTodo(todo);
      createdTodos.push(created);
    }

    return createdTodos;
  }
}
