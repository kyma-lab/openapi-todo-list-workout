import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import * as messages from '@cucumber/messages';
import { BrowserContext, Page, PlaywrightTestOptions, APIRequestContext } from '@playwright/test';
import { TodoApiTestserviceExtended } from '../generated/api/todo-api.testservice.extensions.js';
import * as fixtures from './fixtures';
import type { Todo } from '../generated/types/models.js';

export interface CucumberWorldConstructorParams {
  parameters: Record<string, string>;
}

interface ApiResponse<T = unknown> {
  status: number;
  data?: T;
  error?: Error;
}

export interface ICustomWorld extends World {
  debug: boolean;
  feature?: messages.Pickle;
  context?: BrowserContext;
  page?: Page;

  testName?: string;
  startTime?: Date;

  server?: APIRequestContext;
  todoApi?: TodoApiTestserviceExtended;

  username?: string;
  playwrightOptions?: PlaywrightTestOptions;
  fixtures: typeof fixtures;
  parameters: {
    [key: string]: any;
    lastApiResponse?: ApiResponse<any>;
    lastCreatedTodo?: Todo;
    createdTodos?: Todo[];
    mb?: any;
  };
}

export class CustomWorld extends World implements ICustomWorld {
  constructor(options: IWorldOptions) {
    super(options);
    this.parameters = options.parameters;
  }

  debug = false;
  feature?: messages.Pickle;
  context?: BrowserContext;
  page?: Page;
  testName?: string;
  startTime?: Date;
  server?: APIRequestContext;
  todoApi?: TodoApiTestserviceExtended;
  username?: string;
  playwrightOptions?: PlaywrightTestOptions;
  fixtures = fixtures;
  parameters: ICustomWorld['parameters'] = {};
}

setWorldConstructor(CustomWorld);
