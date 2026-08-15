import { test as base, expect } from '@playwright/test';

export const FIXED_CLOCK_ISO = '2025-05-15T17:23:00-03:00';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript((iso) => { (window as unknown as { __HIKARI_CLOCK_FIXED_AT__?: string }).__HIKARI_CLOCK_FIXED_AT__ = iso; }, FIXED_CLOCK_ISO);
    await use(page);
  },
});

export { expect };
