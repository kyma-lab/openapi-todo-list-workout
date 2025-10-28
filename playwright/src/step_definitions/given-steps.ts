import { Given, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { Todo, Category } from '../api/types';

/**
 * Given/Angenommen Steps - Setup und Vorbedingungen
 */

Given('die Datenbank ist leer', async function (this: CustomWorld) {
  await this.todoApi!.deleteAllTodos();
});

Given('folgende Kategorien existieren:', async function (this: CustomWorld, dataTable: DataTable) {
  const categories = dataTable.hashes() as Category[];

  for (const category of categories) {
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
});
