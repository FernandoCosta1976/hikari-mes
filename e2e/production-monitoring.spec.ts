import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

/**
 * HIKARI Acompanhamento — canonical 2026-07-10, Scenario Clock 09:15. Reads
 * the SAME canonical Scenario as Plano/Preparação/Liberação (Section 14 —
 * single source of operational truth, no dataset of its own): the 23
 * requirements, their component codes/families/quantities/Source Lots and
 * their Execution facts/Events come straight from the Scenario store.
 */
test('shows Passado/Agora/Futuro with real diversity across DC01-DC05 and no interaction required', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await expect(page.getByRole('heading', { name: 'O que está acontecendo em relação ao plano?' })).toBeVisible();
  await expect(page.getByText('10/07/2026 · Dados simulados até 09:15 · Futuro projetado')).toBeVisible();

  const timeline = page.getByTestId('live-production-timeline');
  for (const resource of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) await expect(timeline.getByText(resource, { exact: true })).toBeVisible();

  // Four DCs are genuinely running at once, DC03 genuinely has not started yet — every Resource has
  // an active or pending requirement right now, so no lane's dominant status is Concluído; individual
  // Concluído blocks are still visible on the REAL track for every Resource (checked below via click).
  await expect(timeline.getByText('Em execução')).toHaveCount(4);
  await expect(timeline.getByText('Não iniciado', { exact: true })).toBeVisible();
  await expect(timeline.locator('button[data-status="COMPLETED"]').first()).toBeVisible();

  const strip = page.getByRole('region', { name: 'Resumo operacional do dia' });
  await expect(strip).toContainText('Planejado até agora1.500');
  await expect(strip).toContainText('Realizado até agora1.000');
  await expect(strip).toContainText('Projeção do dia2.100');

  await expect(page).toHaveScreenshot('ACOMPANHAMENTO-0915-OVERVIEW-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('a Lot Completed before and one Running now are both real requirements, never fabricated', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  const timeline = page.getByTestId('live-production-timeline');

  const dc01 = timeline.locator('section[data-status="RUNNING"]').first();
  await dc01.getByRole('button').first().click();
  const runningDialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  await expect(runningDialog).toContainText('SituaçãoEm execução');
  await expect(runningDialog).toContainText('Quantidade65 / 100');
  await expect(runningDialog).toContainText('Conclusão projetada 09:39');
  await runningDialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  const dc02CompletedBlock = timeline.locator('section').nth(1).locator('button[data-status="COMPLETED"]').first();
  await dc02CompletedBlock.click();
  const completedDialog = page.getByRole('dialog');
  await expect(completedDialog).toContainText('SituaçãoConcluído');
  await completedDialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  await expect(page).toHaveScreenshot('ACOMPANHAMENTO-0915-COMPLETED-RUNNING-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('DC05 setup-overrun Event delays the requirement start, visible end to end from the block to the modal', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  const timeline = page.getByTestId('live-production-timeline');
  const runningLanes = timeline.locator('section[data-status="RUNNING"]');
  const dc05 = runningLanes.last(); // DC01, DC02, DC04, DC05 are RUNNING in Resource order — DC05 is last
  await dc05.getByRole('button').first().click();
  const dialog = page.getByRole('dialog', { name: '1ST-E1310-W0' });
  await expect(dialog).toContainText('Lote Linha C309');
  await expect(dialog).toContainText('SituaçãoEm execução');
  await expect(dialog).toContainText('Quantidade18 / 100');
  await expect(dialog).toContainText('Em riscoConclusão projetada 11:23 · +15 min');
  await expect(dialog).toContainText('Ferramental');
  await expect(page).toHaveScreenshot('ACOMPANHAMENTO-0915-DC05-DOWNTIME-IMPACT-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('Unknown != 0 — DC03 has no appointment and the closing-of-day projection is computed, never fabricated', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  const timeline = page.getByTestId('live-production-timeline');
  const dc03 = timeline.locator('section[data-status="NOT_STARTED"]');
  await dc03.getByRole('button').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Realizado—');
  await expect(dialog).toContainText('Ausência de apontamento não significa zero produzido.');
  await expect(dialog).not.toContainText('Realizado0');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  const endOfDay = page.getByRole('region', { name: 'Projeção de fechamento do dia' });
  await expect(endOfDay).toContainText('Planejado2.100');
  await expect(endOfDay).toContainText('Restante941');
  await expect(endOfDay).toContainText('Requirements em risco4');
  await expect(endOfDay).toHaveAttribute('data-status', 'RISCO DE NÃO CUMPRIMENTO');
  await endOfDay.scrollIntoViewIfNeeded();
  await expect(page).toHaveScreenshot('ACOMPANHAMENTO-0915-END-OF-DAY-PROJECTION-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
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
