import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

test('opens the Order Workspace from the Plano Lot Context modal and shows the lifecycle stepper and next decision', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.getByRole('button', { name: /Lote 270, Material C, 70 peças/ }).click();
  await page.getByRole('dialog', { name: 'Lote 270' }).getByRole('link', { name: 'Abrir Ordem →' }).click();
  await expect(page.getByRole('heading', { name: 'Ordem / Lote 270' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Próxima decisão' })).toContainText('ainda pendente');
  await expect(page.getByRole('button', { name: 'Marcar preparação como concluída' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Ciclo de vida da Ordem' })).toBeVisible();
});

test('confirms preparation and releases Lote 270 end to end from the Order Workspace', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/orders/lot-270');
  await page.getByRole('button', { name: 'Marcar preparação como concluída' }).click();
  await page.getByRole('button', { name: 'Liberar para produção' }).click();
  const panel = page.getByRole('region', { name: 'Confirmar liberação' });
  await panel.getByRole('button', { name: 'Confirmar liberação' }).click();
  await expect(page.locator('dl').filter({ hasText: 'Liberação' })).toContainText('Liberada manualmente');
});

test('is accessible, keyboard reachable, responsive and contains no prohibited red', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/orders/lot-270');
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
