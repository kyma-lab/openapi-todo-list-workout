import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { Todo } from '../api/types';

/**
 * Then/Dann Steps - Assertions
 */

Then('sollte ich eine leere Todo-Liste sehen', async function (this: CustomWorld) {
  // Prüfe ob keine Task-Items vorhanden sind
  const taskItems = this.page!.locator('[data-testid^="task-item-"]');
  await expect(taskItems).toHaveCount(0);
});

Then('sollte ich das Todo {string} in der Liste sehen', async function (this: CustomWorld, todoTitle: string) {
  await expect(this.page!.getByText(todoTitle)).toBeVisible();
});

Then('ich sollte das Todo {string} in der Liste sehen', async function (this: CustomWorld, todoTitle: string) {
  await expect(this.page!.getByText(todoTitle)).toBeVisible();
});

Then('sollte ich das Todo {string} nicht in der Liste sehen', async function (this: CustomWorld, todoTitle: string) {
  await expect(this.page!.getByText(todoTitle)).not.toBeVisible();
});

Then('ich sollte das Todo {string} nicht in der Liste sehen', async function (this: CustomWorld, todoTitle: string) {
  await expect(this.page!.getByText(todoTitle)).not.toBeVisible();
});

Then('sollte ich {int} Todo(s) in der Liste sehen', async function (this: CustomWorld, count: number) {
  // Zähle alle Task-Items
  const todos = this.page!.locator('[data-testid^="task-item-"]');
  await expect(todos).toHaveCount(count);
});

Then('ich sollte {int} Todo(s) in der Liste sehen', async function (this: CustomWorld, count: number) {
  // Zähle alle Task-Items
  const todos = this.page!.locator('[data-testid^="task-item-"]');
  await expect(todos).toHaveCount(count);
});

Then('das Todo {string} sollte in der Datenbank existieren', async function (this: CustomWorld, todoTitle: string) {
  const todos = await this.todoApi!.getTodos({ q: todoTitle });
  expect(todos).toHaveLength(1);
  expect(todos[0].title).toBe(todoTitle);
});

Then('das Todo {string} sollte nicht in der Datenbank existieren', async function (this: CustomWorld, todoTitle: string) {
  const todos = await this.todoApi!.getTodos({ q: todoTitle });
  expect(todos).toHaveLength(0);
});

Then('sollte das Todo {string} in der UI als erledigt markiert sein', async function (this: CustomWorld, todoTitle: string) {
  // Finde das Todo-Item anhand des Titels
  const todoItem = this.page!.locator(`[data-testid^="task-item-"]`, { hasText: todoTitle });
  const checkbox = todoItem.locator('[data-testid^="task-checkbox-"]');
  await expect(checkbox).toBeChecked();
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
  expect(Array.isArray(todos)).toBe(true);
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
