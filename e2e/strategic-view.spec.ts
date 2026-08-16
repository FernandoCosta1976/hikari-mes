import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

test('shows the executive cockpit with Meta, RISCO status, five machines and prioritized attention', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/strategic');
  await expect(page.getByRole('heading', { name: 'Como está a saúde da Fundição DC?' })).toBeVisible();
  await expect(page.getByText('RISCO', { exact: true })).toBeVisible();

  const production = page.getByRole('heading', { name: 'Eficácia', exact: true }).locator('..');
  await expect(production).toContainText('2.000');
  await expect(production).toContainText('209');

  const machines = page.getByRole('heading', { name: 'Situação das Máquinas' }).locator('xpath=ancestor::section[1]');
  for (const resource of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) await expect(machines.getByText(resource, { exact: true })).toBeVisible();

  const priorities = page.getByRole('heading', { name: 'Prioridades agora' }).locator('..');
  await expect(priorities.getByRole('listitem')).toHaveCount(3);
  await expect(priorities.getByRole('listitem').first()).toContainText('DC05');

  await expect(page.getByRole('link', { name: /Ver Plano/ })).toHaveAttribute('href', /production-scheduling$/);
  await expect(page).toHaveScreenshot('STRATEGIC-VIEW-OVERVIEW-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('is reachable from the sidebar between Home and Plano, and is accessible with no prohibited red', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.getByRole('link', { name: /Visão Estratégica/ }).click();
  await expect(page.getByRole('heading', { name: 'Como está a saúde da Fundição DC?' })).toBeVisible();

  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    const dimensions = await page.locator('html').evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
  }
  const redUsages = await page.locator('body *').evaluateAll((elements) => {
    const forbidden = new Set(['rgb(255, 0, 0)', 'rgb(220, 38, 38)', 'rgb(239, 68, 68)']);
    return elements.flatMap((element) => { const style = getComputedStyle(element); return [style.color, style.backgroundColor, style.borderColor].filter((value) => forbidden.has(value)); });
  });
  expect(redUsages).toEqual([]);
});
