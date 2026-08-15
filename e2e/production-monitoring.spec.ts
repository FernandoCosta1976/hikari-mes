import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

test('shows a coherent five-Resource live state, WIP and ordered event feed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await expect(page.getByRole('heading', { name: 'O que está acontecendo na produção agora?' })).toBeVisible();
  const timeline = page.getByTestId('live-production-timeline');
  for (const resource of ['DC01','DC02','DC03','DC04','DC05']) await expect(timeline.getByText(resource, { exact: true })).toBeVisible();
  await expect(timeline.getByText('PLANEJADO')).toHaveCount(5);
  await expect(timeline.getByText('REAL')).toHaveCount(5);
  await expect(page.getByRole('region', { name: 'Resumo de WIP' })).toContainText('Aguardando1Em produção2Parados1Concluídos1');
  await expect(page.getByText(/DC03 · Lote 266 · Ferramental · 18 min/)).toBeVisible();
  const feed = page.getByRole('region', { name: 'Event Feed' }).locator('button');
  await expect(feed).toHaveCount(4);
  await expect(feed.nth(0)).toContainText('17:14');
  await expect(feed.nth(0)).toContainText('4 min · ENCERRADO');
  await expect(feed.nth(1)).toContainText('17:05');
  await expect(feed.nth(1)).toContainText('ATIVO · 18 min');
  await expect(page).toHaveScreenshot('CAP-06-MONITORING-OVERVIEW-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await expect(timeline).toHaveScreenshot('CAP-06-SCHEDULED-ACTUAL-CANDIDATE.png', { animations: 'disabled' });
});

test('opens active event, Lot and Resource contexts without execution actions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await page.getByRole('button', { name: 'Evento ativo na DC03: Ferramental' }).click();
  const activeLot = page.getByRole('dialog', { name: 'Lote 266' });
  await expect(activeLot).toContainText('Ferramental · 18 min');
  await expect(page).toHaveScreenshot('CAP-06-ACTIVE-EVENT-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await expect(page).toHaveScreenshot('CAP-06-LOT-CONTEXT-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await activeLot.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();
  await page.getByRole('button', { name: /DC03.*Parada/ }).click();
  const resource = page.getByRole('dialog', { name: 'DC03' });
  await expect(resource).toContainText('Lot atual: 266');
  await expect(resource).toContainText('Próximo Lot');
  await expect(page).toHaveScreenshot('CAP-06-RESOURCE-CONTEXT-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await expect(resource.getByRole('button', { name: /Pausar|Retomar|Concluir|Iniciar/ })).toHaveCount(0);
});

test('is accessible, keyboard reachable, responsive and contains no prohibited red', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: /DC03.*Parada/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'DC03' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
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
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Restaurar cenário' }).click();
  await expect(page.getByText(/DC03 · Lote 266 · Ferramental · 18 min/)).toBeVisible();
});
