import { Todo, Category } from '../generated/types/models';

/**
 * Standard-Testdaten für Cucumber-Tests
 * Zentrale Definition vermeidet Duplikation und erhöht Konsistenz
 */

// ==================== Kategorien ====================

export const standardCategories: Category[] = [
  {
    name: 'Arbeit',
    description: 'Arbeitsbezogene Aufgaben',
  },
  {
    name: 'Persönlich',
    description: 'Persönliche Aufgaben',
  },
];

// ==================== Todo-Templates ====================

export const todoTemplates = {
  /**
   * Standard-Arbeits-Todo (wichtig, nicht erledigt)
   */
  wichtigesArbeitsTodo: {
    title: 'Wichtige Arbeitsaufgabe',
    description: 'Eine wichtige Aufgabe für die Arbeit',
    completed: false,
    important: true,
    category: 'Arbeit',
  } as Todo,

  /**
   * Standard-Arbeits-Todo (normal, nicht erledigt)
   */
  arbeitsTodo: {
    title: 'Arbeitsaufgabe',
    description: 'Eine normale Arbeitsaufgabe',
    completed: false,
    important: false,
    category: 'Arbeit',
  } as Todo,

  /**
   * Persönliches Todo (nicht wichtig, nicht erledigt)
   */
  persönlichesTodo: {
    title: 'Persönliche Aufgabe',
    description: 'Eine persönliche Aufgabe',
    completed: false,
    important: false,
    category: 'Persönlich',
  } as Todo,

  /**
   * Erledigtes Todo
   */
  erledigtesTodo: {
    title: 'Erledigte Aufgabe',
    description: 'Diese Aufgabe ist bereits erledigt',
    completed: true,
    important: false,
    category: 'Arbeit',
  } as Todo,
};

// ==================== Todo-Sets (vordefinierte Gruppen) ====================

export const todoSets = {
  /**
   * Standard-Set: 2 Arbeits-Todos, 1 persönliches Todo
   */
  standard: [
    {
      title: 'Bericht fertigstellen',
      description: 'Q4 Zusammenfassung',
      completed: false,
      important: true,
      category: 'Arbeit',
    },
    {
      title: 'Team-Meeting',
      description: 'Daily Standup',
      completed: false,
      important: true,
      category: 'Arbeit',
    },
    {
      title: 'Einkaufen',
      description: 'Milch, Brot',
      completed: false,
      important: false,
      category: 'Persönlich',
    },
  ] as Todo[],

  /**
   * Gemischtes Set: Erledigt und offen
   */
  gemischt: [
    {
      title: 'Erledigte Aufgabe',
      description: 'Fertig',
      completed: true,
      important: false,
      category: 'Arbeit',
    },
    {
      title: 'Offene Aufgabe',
      description: 'Noch nicht fertig',
      completed: false,
      important: true,
      category: 'Arbeit',
    },
  ] as Todo[],

  /**
   * Kategorie-Test-Set: Mehrere Kategorien
   */
  mehrKategorien: [
    {
      title: 'Arbeitsaufgabe 1',
      description: 'Erste Arbeit',
      completed: false,
      important: true,
      category: 'Arbeit',
    },
    {
      title: 'Arbeitsaufgabe 2',
      description: 'Zweite Arbeit',
      completed: false,
      important: false,
      category: 'Arbeit',
    },
    {
      title: 'Persönliche Aufgabe',
      description: 'Persönliche Sache',
      completed: false,
      important: false,
      category: 'Persönlich',
    },
  ] as Todo[],

  /**
   * Such-Test-Set: Todos mit Suchbegriffen
   */
  mitSuchbegriffen: [
    {
      title: 'Projekt Alpha',
      description: 'Alpha Beschreibung',
      completed: false,
      important: true,
      category: 'Arbeit',
    },
    {
      title: 'Projekt Beta',
      description: 'Beta Beschreibung',
      completed: false,
      important: false,
      category: 'Arbeit',
    },
    {
      title: 'Einkaufen',
      description: 'Dinge kaufen',
      completed: false,
      important: false,
      category: 'Persönlich',
    },
  ] as Todo[],
};

// ==================== Builder-Funktionen ====================

/**
 * Erstellt ein Todo basierend auf einem Template mit optionalen Überschreibungen
 */
export function createTodoFrom(template: Todo, overrides: Partial<Todo> = {}): Todo {
  return {
    ...template,
    ...overrides,
  };
}

/**
 * Erstellt mehrere Todos mit automatischer Nummerierung
 */
export function createMultipleTodos(count: number, template: Todo): Todo[] {
  return Array.from({ length: count }, (_, i) => ({
    ...template,
    title: `${template.title} ${i + 1}`,
  }));
}
