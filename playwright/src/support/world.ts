import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, APIRequestContext, request } from '@playwright/test';
import { TodoApiTestserviceExtended } from '../api/todo-api.testservice.extensions';
import * as fixtures from './fixtures';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Custom World class for Cucumber
 * Provides Playwright browser, page, TodoApiService, and test fixtures to all step definitions
 */
export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  apiContext?: APIRequestContext;
  todoApi?: TodoApiTestserviceExtended;

  // Test fixtures - zentrale Testdaten
  fixtures = fixtures;

  constructor(options: IWorldOptions) {
    super(options);
  }

  /**
   * Initialize browser and API context
   */
  async init(): Promise<void> {
    // Initialize browser
    this.browser = await chromium.launch({
      headless: process.env.HEADED !== '1',
      slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
    });

    this.context = await this.browser.newContext({
      baseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
    });

    this.page = await this.context.newPage();

    // Initialize API context
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
    this.apiContext = await request.newContext({
      baseURL: apiBaseUrl,
    });

    this.todoApi = new TodoApiTestserviceExtended(this.apiContext, apiBaseUrl);
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }

    if (this.context) {
      await this.context.close();
    }

    if (this.browser) {
      await this.browser.close();
    }

    if (this.apiContext) {
      await this.apiContext.dispose();
    }
  }
}

setWorldConstructor(CustomWorld);
