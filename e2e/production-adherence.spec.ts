import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

test('shows Turno 2 in progress beside the day accumulated, Turno 1 history and a highlighted machine panel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-adherence');
  await expect(page.getByRole('heading', { name: 'Estamos executando conforme o planejado?' })).toBeVisible();

  const turnoRow = page.getByRole('region', { name: 'Aderência do Turno 2 e acumulado do dia' });
  await expect(turnoRow).toContainText('TURNO 2 · EM ANDAMENTO');
  await expect(turnoRow).toContainText('1 / 4');
  await expect(turnoRow).toContainText('Principal desvio');
  await expect(turnoRow).toContainText('DC03');
  await expect(turnoRow).toContainText('Acumulado do dia');
  await expect(turnoRow).toContainText('2 / 5');

  const history = page.getByRole('region', { name: 'Turnos concluídos hoje' });
  await expect(history).toContainText('Turno 1');
  await expect(history).toContainText('1/1 Lotes conformes');

  const machines = page.getByRole('region', { name: 'Situação das Máquinas' });
  const dc03 = machines.getByRole('button', { name: /DC03/ });
  await expect(dc03).toHaveAttribute('data-tone', 'attention');
  await expect(dc03).toContainText('Parado');
  const dc04 = machines.getByRole('button', { name: /DC04/ });
  await expect(dc04).toContainText('-140 min');

  await expect(page).toHaveScreenshot('CAP-07-ADHERENCE-OVERVIEW-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('opens the Aderência drill-down for DC03 and DC04, and expands Planejado × Realizado on demand', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-adherence');
  const machines = page.getByRole('region', { name: 'Situação das Máquinas' });
  await machines.getByRole('button', { name: /DC03/ }).click();
  const stopped = page.getByRole('dialog', { name: /DC03/ });
  await expect(stopped).toContainText('Parado');
  await expect(stopped).toContainText('Próximo Lote potencialmente impactado');
  await expect(stopped.getByRole('button', { name: /Pausar|Retomar|Concluir|Iniciar/ })).toHaveCount(0);
  await stopped.getByRole('button', { name: 'Fechar contexto de aderência' }).click();
  await machines.getByRole('button', { name: /DC04/ }).click();
  const early = page.getByRole('dialog', { name: /DC04/ });
  await expect(early).toContainText('Início antecipado');
  await expect(early).toContainText('-140 min');
  await early.getByRole('button', { name: 'Fechar contexto de aderência' }).click();

  const disclosure = page.locator('details', { hasText: 'Planejado × Realizado' });
  await expect(disclosure).not.toHaveAttribute('open', '');
  const timeline = page.getByTestId('adherence-timeline');
  await expect(timeline).not.toBeVisible();
  await disclosure.locator('summary').click();
  for (const resource of ['DC01','DC02','DC03','DC04','DC05']) await expect(timeline.getByText(resource, { exact: true })).toBeVisible();
});

test('is accessible, keyboard reachable, responsive and contains no prohibited red', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-adherence');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const machines = page.getByRole('region', { name: 'Situação das Máquinas' });
  await machines.getByRole('button', { name: /DC03/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: /DC03/ })).toBeVisible();
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
  await page.getByRole('button', { name: 'Reiniciar cenário' }).click();
  await page.getByRole('alertdialog', { name: 'Reiniciar cenário demonstrativo?' }).getByRole('button', { name: 'Reiniciar cenário' }).click();
  await expect(page.getByRole('region', { name: 'Aderência do Turno 2 e acumulado do dia' })).toContainText('1 / 4');
});
