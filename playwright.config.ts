import { defineConfig, devices } from '@playwright/test';

const BASE = 'http://127.0.0.1:5180';

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  workers: 1, // one shared in-memory database
  reporter: [['list']],
  use: { baseURL: BASE, trace: 'retain-on-failure' },
  webServer: {
    command: 'node e2e/start.mjs',
    url: BASE,
    timeout: 180_000,
    reuseExistingServer: false,
  },
  projects: [
    { name: 'iPhone 13 (WebKit)', use: { ...devices['iPhone 13'] } },
    { name: 'Pixel 7 (Chromium)', use: { ...devices['Pixel 7'] } },
  ],
});
