import { When, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/custom-world';
import { Todo, TodoUpdateRequest } from '../generated/types/models';
import { TodoPage } from '../pages/todo-page';

/**
 * Helper function to handle API calls consistently
 */
async function handleApiCall<T>(this: CustomWorld, apiCall: Promise<T>, successStatus: number) {
  try {
    const responseData = await apiCall;
    this.parameters.lastApiResponse = { status: successStatus, data: responseData };
    if (successStatus === 201) {
      this.parameters.lastCreatedTodo = responseData as Todo;
    }
  } catch (error: any) {
    this.parameters.lastApiResponse = { status: error.status || 500, error };
  }
}

/**
 * When/Wenn Steps - Aktionen
 */

When('ich zur Todo-Anwendung navigiere', async function (this: CustomWorld) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.goto();
});

When('ich ein neues Todo {string} mit der Beschreibung {string} in der Kategorie {string} erstelle', async function (this: CustomWorld, title: string, description: string, category: string) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.createTodo({ title, description, category });
});

When('ich nur Todos der Kategorie {string} anzeige', async function (this: CustomWorld, category: string) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.filterByCategory(category);
});

When('ich nur erledigte Todos anzeige', async function (this: CustomWorld) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.filterByStatus(true);
});

When('ich ein neues Todo mit folgenden Details erstelle:', async function (this: CustomWorld, dataTable: DataTable) {
  const todoData = dataTable.rowsHash();
  const todoPage = new TodoPage(this.page!);

  await todoPage.createTodo({
    title: todoData.title,
    description: todoData.description,
    category: todoData.category
  });
});

When('ich das Todo {string} als erledigt markiere', async function (this: CustomWorld, todoTitle: string) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.completeTodo(todoTitle);
});

When('ich nach Kategorie {string} filtere', async function (this: CustomWorld, category: string) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.filterByCategory(category);
});

When('ich nach Erledigungsstatus {string} filtere', async function (this: CustomWorld, status: string) {
  const todoPage = new TodoPage(this.page!);
  const completed = status === 'completed';
  await todoPage.filterByStatus(completed);
});

When('ich nach {string} suche', async function (this: CustomWorld, searchTerm: string) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.search(searchTerm);
});

When('ich das Todo {string} lösche', async function (this: CustomWorld, todoTitle: string) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.deleteTodo(todoTitle);
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
    dueDate: todoData.dueDate
  };

  await handleApiCall.call(this, this.todoApi!.createTodo(todo), 201);
});

When('ich alle Todos per API abrufe', async function (this: CustomWorld) {
  await handleApiCall.call(this, this.todoApi!.getTodos(), 200);
});

When('ich das Todo {string} per PATCH-API aktualisiere mit:', async function (this: CustomWorld, todoTitle: string, dataTable: DataTable) {
  const updates = dataTable.rowsHash();

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

  await handleApiCall.call(this, this.todoApi!.patchTodo(todo.id, updateRequest), 200);
});

When('ich das Todo {string} per API lösche', async function (this: CustomWorld, todoTitle: string) {
  const todo = this.parameters.createdTodos?.find((t: Todo) => t.title === todoTitle);

  if (!todo || !todo.id) {
    throw new Error(`Todo "${todoTitle}" nicht gefunden`);
  }

  await handleApiCall.call(this, this.todoApi!.deleteTodo(todo.id), 200);
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

  await handleApiCall.call(this, this.todoApi!.getTodos(params), 200);
});

When('ich Todos per API mit Suchbegriff {string} suche', async function (this: CustomWorld, query: string) {
  await handleApiCall.call(this, this.todoApi!.getTodos({ q: query }), 200);
});
