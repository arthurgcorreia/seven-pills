import { defineConfig } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['list']],
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'e2e',
      testDir: 'e2e/tests/e2e',
      use: { baseURL: 'http://localhost:5173' },
    },
    {
      name: 'api',
      testDir: 'e2e/tests/api',
      use: { baseURL: 'http://localhost:3001' },
    },
  ],
});
