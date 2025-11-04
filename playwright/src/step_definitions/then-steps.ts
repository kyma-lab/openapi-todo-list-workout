import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/custom-world';
import { Todo } from '../generated/types/models';
import { TodoPage } from '../pages/todo-page';

/**
 * Then/Dann Steps - Assertions
 */

Then('sollte ich eine leere Todo-Liste sehen', async function (this: CustomWorld) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.expectTodoCount(0);
});

Then('ich (sollte )das Todo {string} in der Liste sehen', async function (this: CustomWorld, todoTitle: string) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.expectTodoVisible(todoTitle);
});

Then('ich (sollte )das Todo {string} nicht in der Liste sehen', async function (this: CustomWorld, todoTitle: string) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.expectTodoNotVisible(todoTitle);
});

Then('ich (sollte ){int} Todo(s) in der Liste sehen', async function (this: CustomWorld, count: number) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.expectTodoCount(count);
});

Then('sollte ich {int} Todo(s) in der Liste sehen', async function (this: CustomWorld, count: number) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.expectTodoCount(count);
});

Then('das Todo {string} sollte in der Datenbank existieren', async function (this: CustomWorld, todoTitle: string) {
  const todos = await this.todoApi!.getTodos({ q: todoTitle });
  expect(todos).toHaveLength(1);
  expect(todos[0].title).toBe(todoTitle);
});

Then('sollte das Todo {string} als erledigt markiert sein', async function (this: CustomWorld, todoTitle: string) {
  // UI check
  const todoPage = new TodoPage(this.page!);
  await todoPage.expectTodoCompleted(todoTitle);

  // Database check
  const todos = await this.todoApi!.getTodos({ q: todoTitle });
  expect(todos).toHaveLength(1);
  expect(todos[0].completed).toBe(true);
});

Then('sollte das Todo {string} nicht mehr existieren', async function (this: CustomWorld, todoTitle: string) {
  // UI check
  const todoPage = new TodoPage(this.page!);
  await todoPage.expectTodoNotVisible(todoTitle);

  // Database check
  const todos = await this.todoApi!.getTodos({ q: todoTitle });
  expect(todos).toHaveLength(0);
});

Then('das Todo {string} sollte nicht in der Datenbank existieren', async function (this: CustomWorld, todoTitle: string) {
  const todos = await this.todoApi!.getTodos({ q: todoTitle });
  expect(todos).toHaveLength(0);
});

Then('sollte das Todo {string} in der UI als erledigt markiert sein', async function (this: CustomWorld, todoTitle: string) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.expectTodoCompleted(todoTitle);
});

Then('das Todo {string} sollte in der Datenbank als erledigt markiert sein', async function (this: CustomWorld, todoTitle: string) {
  const todos = await this.todoApi!.getTodos({ q: todoTitle });
  expect(todos).toHaveLength(1);
  expect(todos[0].completed).toBe(true);
});

// API-spezifische Then-Steps

Then('sollte die API-Antwort den Status {int} haben', function (this: CustomWorld, expectedStatus: number) {
  expect(this.parameters.lastApiResponse?.status).toBe(expectedStatus);
});

Then('das erstellte Todo sollte eine ID haben', function (this: CustomWorld) {
  expect(this.parameters.lastCreatedTodo?.id).toBeDefined();
  expect(typeof this.parameters.lastCreatedTodo?.id).toBe('number');
});

Then('das Todo sollte in der Datenbank existieren', async function (this: CustomWorld) {
  const todoId = this.parameters.lastCreatedTodo?.id;
  expect(todoId).toBeDefined();

  const todo = await this.todoApi!.getTodoById(todoId!);
  expect(todo).toBeDefined();
  expect(todo.id).toBe(todoId);
});

Then('ich sollte {int} Todo(s) von der API erhalten', function (this: CustomWorld, expectedCount: number) {
  const todos = this.parameters.lastApiResponse?.data;
  expect(todos, 'API response data should be an array').toBeInstanceOf(Array);
  expect(todos).toHaveLength(expectedCount);
});

Then('der Todo-Titel sollte weiterhin {string} sein', function (this: CustomWorld, expectedTitle: string) {
  const todo = this.parameters.lastApiResponse?.data;
  expect(todo.title).toBe(expectedTitle);
});

Then('alle Todos sollten die Kategorie {string} haben', function (this: CustomWorld, expectedCategory: string) {
  const todos = this.parameters.lastApiResponse?.data as Todo[];
  expect(Array.isArray(todos)).toBe(true);

  for (const todo of todos) {
    expect(todo.category).toBe(expectedCategory);
  }
});
