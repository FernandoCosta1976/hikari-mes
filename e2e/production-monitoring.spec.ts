import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

/**
 * HIKARI Acompanhamento — canonical 2026-07-10, Scenario Clock 17:23. The 23
 * requirements and their component codes/families/quantities/Source Lots
 * are the genuine FOUNDRY_DC records for that date in the canonical
 * dataset; only the intra-day schedule and execution facts are
 * demonstrative (see src/demo/scenarios/fundicaoDcMonitoring1007.ts).
 */
test('shows Passado/Agora/Futuro with real diversity across DC01-DC05 and no interaction required', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await expect(page.getByRole('heading', { name: 'O que está acontecendo em relação ao plano?' })).toBeVisible();
  await expect(page.getByText('10/07/2026 · Dados simulados até 17:23 · Futuro projetado')).toBeVisible();

  const timeline = page.getByTestId('live-production-timeline');
  for (const resource of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) await expect(timeline.getByText(resource, { exact: true })).toBeVisible();

  // Section 3/8 — five minimal states, genuinely simultaneous, not fabricated.
  await expect(timeline.getByText('Em execução')).toBeVisible();
  await expect(timeline.getByText('Atrasado')).toBeVisible();
  await expect(timeline.getByText('Não iniciado', { exact: true })).toBeVisible();
  await expect(timeline.getByText('Concluído').first()).toBeVisible();

  const strip = page.getByRole('region', { name: 'Resumo operacional do dia' });
  await expect(strip).toContainText('Planejado até agora1.600');
  await expect(strip).toContainText('Realizado até agora1.300');
  await expect(strip).toContainText('Projeção do dia2.100');

  await expect(page).toHaveScreenshot('ACOMPANHAMENTO-1007-1723-OVERVIEW-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('a Lot Completed before, one Running now and one Scheduled ahead are all real requirements, never fabricated', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  const timeline = page.getByTestId('live-production-timeline');

  const dc01 = timeline.locator('section[data-status="RUNNING"]');
  await dc01.getByRole('button').first().click();
  const runningDialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  await expect(runningDialog).toContainText('SituaçãoEm execução');
  await expect(runningDialog).toContainText('Quantidade30 / 100');
  await expect(runningDialog).toContainText('Conclusão projetada 18:12');
  await runningDialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  const dc02 = timeline.locator('section[data-status="COMPLETED"]').first();
  await dc02.getByRole('button').first().click();
  const completedDialog = page.getByRole('dialog');
  await expect(completedDialog).toContainText('SituaçãoConcluído');
  await completedDialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  await expect(page).toHaveScreenshot('ACOMPANHAMENTO-1007-COMPLETED-RUNNING-FUTURE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('DC03 unplanned-stop event delays its own requirement, visible end to end from the block to the modal', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  const timeline = page.getByTestId('live-production-timeline');
  const dc03 = timeline.locator('section[data-status="DELAYED"]');
  await expect(dc03.getByText('Atrasado')).toBeVisible();
  await dc03.getByRole('button').first().click();
  const dialog = page.getByRole('dialog', { name: '1S4-E5411-W0' });
  await expect(dialog).toContainText('Lote Linha C331');
  await expect(dialog).toContainText('SituaçãoAtrasado');
  await expect(dialog).toContainText('Quantidade93 / 100');
  await expect(dialog).toContainText('Em riscoConclusão projetada 17:28');
  await expect(dialog).toContainText('Parada não planejada');
  await expect(page).toHaveScreenshot('ACOMPANHAMENTO-1007-DC03-DOWNTIME-IMPACT-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('Unknown != 0 — DC04 has no appointment and the closing-of-day projection is computed, never fabricated', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  const timeline = page.getByTestId('live-production-timeline');
  const dc04 = timeline.locator('section[data-status="NOT_STARTED"]');
  await dc04.getByRole('button').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Realizado—');
  await expect(dialog).toContainText('Ausência de apontamento não significa zero produzido.');
  await expect(dialog).not.toContainText('Realizado0');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  const endOfDay = page.getByRole('region', { name: 'Projeção de fechamento do dia' });
  await expect(endOfDay).toContainText('Planejado2.100');
  await expect(endOfDay).toContainText('Restante677');
  await expect(endOfDay).toContainText('Requirements em risco2');
  await expect(endOfDay).toHaveAttribute('data-status', 'ATENÇÃO');
  await endOfDay.scrollIntoViewIfNeeded();
  await expect(page).toHaveScreenshot('ACOMPANHAMENTO-1007-END-OF-DAY-PROJECTION-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('has no fabricated Material A/B/C, no automatically detectable accessibility violations and no forbidden red', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await expect(page.getByRole('heading', { name: 'O que está acontecendo em relação ao plano?' })).toBeVisible();
  await expect(page.getByText('Material A')).toHaveCount(0);
  await expect(page.getByText('Material B')).toHaveCount(0);
  await expect(page.getByText('Material C')).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const redUsages = await page.locator('body *').evaluateAll((elements) => {
    const forbidden = new Set(['rgb(255, 0, 0)', 'rgb(220, 38, 38)', 'rgb(239, 68, 68)']);
    return elements.flatMap((element) => { const style = getComputedStyle(element); return [style.color, style.backgroundColor, style.borderColor].filter((value) => forbidden.has(value)); });
  });
  expect(redUsages).toEqual([]);
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    const dimensions = await page.locator('html').evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
  }
});
