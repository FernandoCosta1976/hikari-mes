import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('opens the demonstrative production scheduling placeholder', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await expect(page.getByText('Cenário demonstrativo')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'O que precisamos produzir?' })).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('matches the Sprint 0 shell baseline', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await expect(page).toHaveScreenshot('sprint-0-app-shell.png', { fullPage: true, animations: 'disabled' });
});
