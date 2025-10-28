import { When, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { Todo, TodoUpdateRequest } from '../api/types';

/**
 * When/Wenn Steps - Aktionen
 */

When('ich zur Todo-Anwendung navigiere', async function (this: CustomWorld) {
  await this.page!.goto('http://localhost:3000');
  // Warte bis die Seite geladen ist
  await this.page!.waitForLoadState('networkidle');
});

When('ich ein neues Todo mit folgenden Details erstelle:', async function (this: CustomWorld, dataTable: DataTable) {
  const todoData = dataTable.rowsHash();

  // Öffne das Formular mit Tastenkombination 'n'
  await this.page!.keyboard.press('n');
  await this.page!.waitForTimeout(500);

  // Fülle das Todo-Formular aus
  await this.page!.getByTestId('task-title-input').fill(todoData.title);

  if (todoData.description) {
    await this.page!.getByTestId('task-description-input').fill(todoData.description);
  }

  if (todoData.category) {
    await this.page!.getByTestId('task-category-trigger').click();
    await this.page!.getByText(todoData.category, { exact: true }).click();
  }

  // Formular absenden
  await this.page!.getByRole('button', { name: /save|add|speichern|hinzufügen/i }).click();

  // Warte bis das Todo hinzugefügt wurde
  await this.page!.waitForTimeout(1000);
});

When('ich das Todo {string} als erledigt markiere', async function (this: CustomWorld, todoTitle: string) {
  // Finde das Todo-Item anhand des Titels
  const todoItem = this.page!.locator(`[data-testid^="task-item-"]`, { hasText: todoTitle });

  // Klicke auf die Checkbox des Todos
  const todoCheckbox = todoItem.locator('[data-testid^="task-checkbox-"]');
  await todoCheckbox.check();

  // Warte bis das Update abgeschlossen ist
  await this.page!.waitForTimeout(1000);
});

When('ich nach Kategorie {string} filtere', async function (this: CustomWorld, category: string) {
  await this.page!.getByLabel(/category|kategorie/i).selectOption(category);
  await this.page!.waitForTimeout(500);
});

When('ich nach Erledigungsstatus {string} filtere', async function (this: CustomWorld, status: string) {
  const value = status === 'completed' ? 'true' : 'false';
  await this.page!.getByLabel(/status|completed|erledigt/i).selectOption(value);
  await this.page!.waitForTimeout(500);
});

When('ich nach {string} suche', async function (this: CustomWorld, searchTerm: string) {
  await this.page!.getByPlaceholder(/search|suche/i).fill(searchTerm);
  await this.page!.waitForTimeout(500);
});

When('ich das Todo {string} lösche', async function (this: CustomWorld, todoTitle: string) {
  // Finde das Todo-Item anhand des Titels
  const todoItem = this.page!.locator(`[data-testid^="task-item-"]`, { hasText: todoTitle });

  // Hover über das Item um den Delete-Button sichtbar zu machen
  await todoItem.hover();

  // Klicke auf den Delete-Button
  const deleteButton = todoItem.locator('[data-testid^="task-delete-"]');
  await deleteButton.click();

  // Bestätigungsdialog behandeln falls vorhanden
  try {
    await this.page!.getByRole('button', { name: /confirm|yes|bestätigen|ja/i }).click({ timeout: 1000 });
  } catch {
    // Kein Bestätigungsdialog
  }

  await this.page!.waitForTimeout(1000);
});

// API-spezifische When-Steps

When('ich ein Todo per API mit folgenden Details erstelle:', async function (this: CustomWorld, dataTable: DataTable) {
  const todoData = dataTable.rowsHash();

  const todo: Todo = {
    title: todoData.title,
    description: todoData.description,
    completed: todoData.completed === 'true',
    important: todoData.important === 'true',
    category: todoData.category,
    dueDate: todoData.dueDate,
  };

  try {
    const createdTodo = await this.todoApi!.createTodo(todo);
    this.parameters.lastApiResponse = { status: 201, data: createdTodo };
    this.parameters.lastCreatedTodo = createdTodo;
  } catch (error: any) {
    this.parameters.lastApiResponse = { status: error.status || 500, error };
    this.parameters.mb ={name: 'mb', description: 'hello World'};
  }
});

When('ich alle Todos per API abrufe', async function (this: CustomWorld) {
  try {
    const todos = await this.todoApi!.getTodos();
    this.parameters.lastApiResponse = { status: 200, data: todos };
  } catch (error: any) {
    this.parameters.lastApiResponse = { status: error.status || 500, error };
  }
});

When('ich das Todo {string} per PATCH-API aktualisiere mit:', async function (this: CustomWorld, todoTitle: string, dataTable: DataTable) {
  const updates = dataTable.rowsHash();

  // Finde das Todo anhand des Titels
  const todo = this.parameters.createdTodos?.find((t: Todo) => t.title === todoTitle);

  if (!todo || !todo.id) {
    throw new Error(`Todo "${todoTitle}" nicht gefunden`);
  }

  const updateRequest: TodoUpdateRequest = {};

  if (updates.completed !== undefined) {
    updateRequest.completed = updates.completed === 'true';
  }
  if (updates.title !== undefined) {
    updateRequest.title = updates.title;
  }
  if (updates.important !== undefined) {
    updateRequest.important = updates.important === 'true';
  }

  try {
    const updatedTodo = await this.todoApi!.patchTodo(todo.id, updateRequest);
    this.parameters.lastApiResponse = { status: 200, data: updatedTodo };
  } catch (error: any) {
    this.parameters.lastApiResponse = { status: error.status || 500, error };
  }
});

When('ich das Todo {string} per API lösche', async function (this: CustomWorld, todoTitle: string) {
  const todo = this.parameters.createdTodos?.find((t: Todo) => t.title === todoTitle);

  if (!todo || !todo.id) {
    throw new Error(`Todo "${todoTitle}" nicht gefunden`);
  }

  try {
    const response = await this.todoApi!.deleteTodo(todo.id);
    this.parameters.lastApiResponse = { status: 200, data: response };
  } catch (error: any) {
    this.parameters.lastApiResponse = { status: error.status || 500, error };
  }
});

When('ich Todos per API mit Filter {string} abrufe', async function (this: CustomWorld, filter: string) {
  const [key, value] = filter.split('=');
  const params: any = {};

  if (key === 'category') {
    params.category = value;
  } else if (key === 'completed') {
    params.completed = value === 'true';
  } else if (key === 'important') {
    params.important = value === 'true';
  }

  try {
    const todos = await this.todoApi!.getTodos(params);
    this.parameters.lastApiResponse = { status: 200, data: todos };
  } catch (error: any) {
    this.parameters.lastApiResponse = { status: error.status || 500, error };
  }
});

When('ich Todos per API mit Suchbegriff {string} suche', async function (this: CustomWorld, query: string) {
  try {
    const todos = await this.todoApi!.getTodos({ q: query });
    this.parameters.lastApiResponse = { status: 200, data: todos };
  } catch (error: any) {
    this.parameters.lastApiResponse = { status: error.status || 500, error };
  }
});
