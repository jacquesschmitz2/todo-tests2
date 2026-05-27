import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  testDir: './tests',

  // Run tests in parallel within a file
  fullyParallel: true,

  // Fail the build on CI if a test.only is left in source
  forbidOnly: !!process.env.CI,

  // Retry failed tests once on CI
  retries: process.env.CI ? 1 : 0,

  // Workers
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    'html',
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    // CI sets BASE_URL pointing to the running webapp; locally the webServer below handles it
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Locally: starts Vite automatically.
  // CI: set WEBAPP_DIR to the cloned webapp path; Playwright starts it there.
  // Set BASE_URL if the app runs on a different port or a deployed URL.
  webServer: {
    command: 'npm run dev',
    cwd: process.env.WEBAPP_DIR
      ? path.resolve(process.env.WEBAPP_DIR)
      : path.join(__dirname, '..', 'application'),
    url: process.env.BASE_URL || 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
