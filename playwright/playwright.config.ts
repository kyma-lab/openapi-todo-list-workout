import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'echo "Backend should be running at http://localhost:8080"',
      url: 'http://localhost:8080/actuator/health',
      reuseExistingServer: true,
      timeout: 5000,
    },
    {
      command: 'echo "Frontend should be running at http://localhost:3000"',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 5000,
    },
  ],
});
