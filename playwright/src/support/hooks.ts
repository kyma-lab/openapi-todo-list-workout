import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { CustomWorld } from './world';

/**
 * Before each scenario: Initialize browser and API, clean database
 */
Before(async function (this: CustomWorld) {
  await this.init();

  // Clean up database before each scenario
  if (this.todoApi) {
    await this.todoApi.deleteAllTodos();
  }
});

/**
 * After each scenario: Take screenshot on failure, clean up
 */
After(async function (this: CustomWorld, scenario) {
  // Take screenshot on failure
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot();
    await this.attach(screenshot, 'image/png');
  }

  // Clean up database after each scenario
  if (this.todoApi) {
    try {
      await this.todoApi.deleteAllTodos();
    } catch (error) {
      console.log('Cleanup failed:', error);
    }
  }

  // Close browser and API context
  await this.cleanup();
});
