import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  use: {
    baseURL: process.env.WP_BASE_URL || 'http://localhost:8081',
    storageState: 'tests/e2e/state.json',
  },
  globalSetup: './tests/e2e/global-setup.js',
});
