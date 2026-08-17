import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

test('shows Turno 2 beside the day accumulated, a simplified shift history and a highlighted machine panel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc-legacy/oee');
  await expect(page.getByRole('heading', { name: 'Como estamos performando e por quê?' })).toBeVisible();

  const turnoRow = page.getByRole('region', { name: 'OEE do Turno 2 e acumulado do dia' });
  await expect(turnoRow).toContainText('TURNO 2 · EM ANDAMENTO');
  await expect(turnoRow).toContainText('Parcial até 17:23');
  await expect(turnoRow).toContainText('68%');
  await expect(turnoRow).toContainText('Desempenho');
  await expect(turnoRow).toContainText('DC03');
  await expect(turnoRow).toContainText('Acumulado do dia');
  await expect(turnoRow).toContainText('70%');

  const history = page.getByRole('region', { name: 'Turnos concluídos hoje' });
  await expect(history).toContainText('Turno 3');
  await expect(history).toContainText('0 peças');
  await expect(history).toContainText('OEE N/A');
  await expect(history).toContainText('Turno 1');
  await expect(history).toContainText('50 peças');
  await expect(history).toContainText('OEE 75%');

  const machines = page.getByRole('region', { name: 'Situação das Máquinas' });
  await expect(machines.getByRole('button', { name: /DC05/ })).toContainText('N/A');
  const dc03 = machines.getByRole('button', { name: /DC03/ });
  await expect(dc03).toHaveAttribute('data-tone', 'attention');
  await expect(dc03).toContainText('Ferramental ativo');

  await expect(page).toHaveScreenshot('CAP-09-OEE-OVERVIEW-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('opens Turno-scoped dimension and Resource drill-downs, and keeps the explanation collapsed by default', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc-legacy/oee');

  const disclosure = page.locator('details', { hasText: 'Como chegamos a este resultado?' });
  await expect(disclosure).not.toHaveAttribute('open', '');
  await expect(page.getByText('Ranking simples por impacto conhecido')).not.toBeVisible();
  await disclosure.locator('summary').click();
  await expect(page.getByText('Ranking simples por impacto conhecido')).toBeVisible();

  const turnoRow = page.getByRole('region', { name: 'OEE do Turno 2 e acumulado do dia' });
  await turnoRow.getByRole('button', { name: /Disponibilidade/ }).click();
  const dimensionDialog = page.getByRole('dialog', { name: /Disponibilidade/ });
  await expect(dimensionDialog).toContainText('Tempo em produção');
  await expect(dimensionDialog).toContainText('TURNO 2');
  await dimensionDialog.getByRole('button', { name: 'Fechar contexto de OEE' }).click();

  const machines = page.getByRole('region', { name: 'Situação das Máquinas' });
  await machines.getByRole('button', { name: /DC03/ }).click();
  const resourceDialog = page.getByRole('dialog', { name: /DC03/ });
  await expect(resourceDialog).toContainText('Tempo de produção planejado');
  await expect(resourceDialog).toContainText('Rastreável');
});

test('is accessible, keyboard reachable, responsive and contains no prohibited red', async ({ page }) => {
  await page.goto('/demo/fundicao-dc-legacy/oee');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const machines = page.getByRole('region', { name: 'Situação das Máquinas' });
  await machines.getByRole('button', { name: /DC03/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
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
  await expect(page.getByRole('region', { name: 'OEE do Turno 2 e acumulado do dia' })).toContainText('68%');
});
