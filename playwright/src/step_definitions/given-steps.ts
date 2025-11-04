import { DataTable, Given } from '@cucumber/cucumber';
import { CustomWorld } from '../support/custom-world';
import { Category, Todo } from '../generated/types/models';
import { TodoPage } from '../pages/todo-page';

/**
 * Given/Angenommen Steps - Setup und Vorbedingungen
 */

Given('die Datenbank ist leer', async function (this: CustomWorld) {
  await this.todoApi!.deleteAllTodos();
});

Given('ich die Todo-Anwendung geöffnet habe', async function (this: CustomWorld) {
  const todoPage = new TodoPage(this.page!);
  await todoPage.goto();
});

Given('ein Todo {string} existiert', async function (this: CustomWorld, todoTitle: string) {
  const todo: Todo = {
    title: todoTitle,
    description: 'Test description',
    completed: false,
    important: true,
    category: 'Arbeit'
  };

  const createdTodo = await this.todoApi!.createTodo(todo);

  if (!this.parameters.createdTodos) {
    this.parameters.createdTodos = [];
  }
  this.parameters.createdTodos.push(createdTodo);

  // Reload page to show the newly created todo
  if (this.page) {
    await this.page.reload({ waitUntil: 'networkidle' });
  }
});

Given('folgende Todos existieren:', async function (this: CustomWorld, dataTable: DataTable) {
  const todos = dataTable.hashes();

  for (const todoData of todos) {
    const todo: Todo = {
      title: todoData.title,
      description: todoData.description,
      completed: todoData.completed === 'true',
      important: todoData.important !== undefined ? todoData.important === 'true' : false,
      category: todoData.category,
      dueDate: todoData.dueDate
    };

    const createdTodo = await this.todoApi!.createTodo(todo);

    if (!this.parameters.createdTodos) {
      this.parameters.createdTodos = [];
    }
    this.parameters.createdTodos.push(createdTodo);
  }

  // Reload page to show the newly created todos
  if (this.page) {
    await this.page.reload({ waitUntil: 'networkidle' });
  }
});

Given('folgende Kategorien existieren:', async function (this: CustomWorld, dataTable: DataTable) {
  const categoryData = dataTable.hashes();

  for (const data of categoryData) {
    const category: Category = {
      name: data.name,
      description: data.description,
    };

    try {
      await this.todoApi!.createCategory(category);
    } catch (error) {
      // Kategorie existiert möglicherweise bereits
      console.log(`Kategorie ${category.name} existiert möglicherweise bereits`);
    }
  }
});

Given('folgende Todos existieren in der Datenbank:', async function (this: CustomWorld, dataTable: DataTable) {
  const todos = dataTable.hashes();

  for (const todoData of todos) {
    const todo: Todo = {
      title: todoData.title,
      description: todoData.description,
      completed: todoData.completed === 'true',
      important: todoData.important === 'true',
      category: todoData.category,
      dueDate: todoData.dueDate,
    };


    const createdTodo = await this.todoApi!.createTodo(todo);

    // Speichere erstellte Todos im World für spätere Referenz
    if (!this.parameters.createdTodos) {
      this.parameters.createdTodos = [];
    }
    this.parameters.createdTodos.push(createdTodo);
  }
});

// ==================== Fixture-basierte Given-Steps ====================

Given('Standard-Kategorien existieren', async function (this: CustomWorld) {
  for (const category of this.fixtures.standardCategories) {
    try {
      await this.todoApi!.createCategory(category);
    } catch (error) {
      console.log(`Kategorie ${category.name} existiert möglicherweise bereits`);
    }
  }
});

Given('ein Standard-Todo existiert', async function (this: CustomWorld) {
  const todo = this.fixtures.todoTemplates.wichtigesArbeitsTodo;
  const createdTodo = await this.todoApi!.createTodo(todo);

  if (!this.parameters.createdTodos) {
    this.parameters.createdTodos = [];
  }
  this.parameters.createdTodos.push(createdTodo);

  // Reload page to show the newly created todo
  if (this.page) {
    await this.page.reload({ waitUntil: 'networkidle' });
  }
});

Given('Standard-Todos existieren', async function (this: CustomWorld) {
  const todos = this.fixtures.todoSets.standard;

  for (const todo of todos) {
    const createdTodo = await this.todoApi!.createTodo(todo);

    if (!this.parameters.createdTodos) {
      this.parameters.createdTodos = [];
    }
    this.parameters.createdTodos.push(createdTodo);
  }

  // Reload page to show the newly created todos
  if (this.page) {
    await this.page.reload({ waitUntil: 'networkidle' });
  }
});

Given('gemischte Todos existieren', async function (this: CustomWorld) {
  const todos = this.fixtures.todoSets.gemischt;

  for (const todo of todos) {
    const createdTodo = await this.todoApi!.createTodo(todo);

    if (!this.parameters.createdTodos) {
      this.parameters.createdTodos = [];
    }
    this.parameters.createdTodos.push(createdTodo);
  }

  // Reload page to show the newly created todos
  if (this.page) {
    await this.page.reload({ waitUntil: 'networkidle' });
  }
});

Given('Todos mit verschiedenen Kategorien existieren', async function (this: CustomWorld) {
  const todos = this.fixtures.todoSets.mehrKategorien;

  for (const todo of todos) {
    const createdTodo = await this.todoApi!.createTodo(todo);

    if (!this.parameters.createdTodos) {
      this.parameters.createdTodos = [];
    }
    this.parameters.createdTodos.push(createdTodo);
  }

  // Reload page to show the newly created todos
  if (this.page) {
    await this.page.reload({ waitUntil: 'networkidle' });
  }
});

Given('Todos mit Suchbegriffen existieren', async function (this: CustomWorld) {
  const todos = this.fixtures.todoSets.mitSuchbegriffen;

  for (const todo of todos) {
    const createdTodo = await this.todoApi!.createTodo(todo);

    if (!this.parameters.createdTodos) {
      this.parameters.createdTodos = [];
    }
    this.parameters.createdTodos.push(createdTodo);
  }

  // Reload page to show the newly created todos
  if (this.page) {
    await this.page.reload({ waitUntil: 'networkidle' });
  }
});
