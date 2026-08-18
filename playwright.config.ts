import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'light',
    locale: 'pt-BR',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  /**
   * Every demonstrative timestamp in the app is deterministic (Scenario/
   * Session Clock, never Date.now() — see src/app/clock/applicationClock.ts).
   * This tolerance exists solely for sub-pixel font/icon anti-aliasing noise
   * around small caption text, which pixel-perfect comparison flags even
   * though nothing in application state changed (verified via diff review —
   * REFERENCE-0915-PLAN). 2% is generous enough to absorb that noise while
   * still catching any real layout/content regression, which produces a far
   * larger diff.
   */
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.02 } },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
