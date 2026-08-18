import { expect, test } from './fixtures';

/**
 * Avaliar Cenário — definitive fix. Moving a requirement now means
 * REPRIORITIZATION: the whole affected Resource tail recalculates
 * automatically (Setup, no overlap), never just relocating the moved
 * requirement into a conflicting slot. Exercised on the reference
 * dataset (`fundicao-dc`, 2026-07-10, 09:15 Scenario Clock). At 09:15,
 * lot-sd-501..507 (and 511/512, 515/516/517, 518/519, 521) are already
 * COMPLETED/IN_PROGRESS — locked; lot-sd-508/509/510, 513, 514, 520,
 * 522/523 are still NOT_STARTED — movable.
 */

test('same-machine reprioritization cascades the whole DC01 tail automatically', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-sd-508"]').click();

  const simulation = page.getByRole('region', { name: 'Avaliação de cenário' });
  await simulation.getByRole('button', { name: /^DC01/ }).click();
  await expect(simulation.getByRole('button', { name: /Depois de Lote 509/ })).toBeVisible();
  await simulation.getByRole('button', { name: /Depois de Lote 509/ }).click();

  await expect(simulation).toContainText('1 movimentação');
  await expect(simulation).toContainText('OrigemDC01');
  await expect(simulation).toContainText('DestinoDC01');
  const impactedText = await simulation.locator('dl div', { hasText: 'Requirements impactados' }).innerText();
  expect(Number(impactedText.match(/\d+/)?.[0])).toBeGreaterThan(0);

  // The moved requirement and its cascade are both visible on the timeline, distinctly labeled.
  await expect(page.locator('[data-lot-id="lot-sd-508"]')).toHaveAttribute('data-simulated', 'true');
  await expect(page.locator('[data-lot-id="lot-sd-508"]')).toContainText('Movido');
  await expect(page.locator('[data-lot-id="lot-sd-509"]')).toHaveAttribute('data-affected', 'true');
  await expect(page.locator('[data-lot-id="lot-sd-509"]')).toContainText('Deslocado');

  // Section 26 — Resource lane order is never disturbed by simulation.
  const laneOrder = await page.locator('[aria-label^="Máquina programada DC"]').evaluateAll((lanes) => lanes.map((lane) => lane.getAttribute('aria-label')));
  expect(laneOrder).toEqual(['Máquina programada DC01', 'Máquina programada DC02', 'Máquina programada DC03', 'Máquina programada DC04', 'Máquina programada DC05']);

  await expect(page).toHaveScreenshot('SCENARIO-SAME-MACHINE-REPRIORITIZATION-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('cross-machine reallocation recalculates both origin and destination, and rejects an ineligible destination', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-sd-508"]').click(); // 44C-E5421-W0, Reserve DC02/DC03

  const simulation = page.getByRole('region', { name: 'Avaliação de cenário' });
  await expect(simulation.getByRole('button', { name: /^DC04/ })).toBeDisabled(); // not Primary/Reserve for this component
  await simulation.getByRole('button', { name: /^DC03/ }).click();
  await simulation.getByRole('button', { name: /Depois de Lote 514/ }).click(); // DC03's only existing requirement

  await expect(simulation).toContainText('OrigemDC01');
  await expect(simulation).toContainText('DestinoDC03');
  await expect(page.locator('[data-lot-id="lot-sd-508"]')).toHaveAttribute('data-simulated', 'true');
  await expect(page.getByLabel('Lotes programados na DC03').locator('[data-lot-id="lot-sd-508"]')).toBeVisible();
  // DC01's tail compacts to fill the gap left behind.
  await expect(page.locator('[data-lot-id="lot-sd-509"]')).toHaveAttribute('data-affected', 'true');

  await expect(page).toHaveScreenshot('SCENARIO-CROSS-MACHINE-REPRIORITIZATION-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('impact summary shows Setup delta, both Resources closing times and stays a what-if until confirmed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  const originalStart = await page.locator('[data-lot-id="lot-sd-508"]').evaluate((element) => (element as HTMLElement).style.left);

  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-sd-508"]').click();
  const simulation = page.getByRole('region', { name: 'Avaliação de cenário' });
  await simulation.getByRole('button', { name: /^DC01/ }).click();
  await simulation.getByRole('button', { name: /Depois de Lote 509/ }).click();

  await expect(simulation).toContainText('Setups (plano vigente)');
  await expect(simulation).toContainText('Setups (simulação)');
  await expect(simulation).toContainText('Δ Setups');
  await expect(simulation).toContainText('Término DC01 (plano vigente)');
  await expect(simulation).toContainText('Término DC01 (simulação)');
  await expect(simulation).toContainText('CENÁRIO SIMULADO — NÃO APLICADO');
  await expect(simulation.getByRole('button', { name: 'Confirmar nova programação' })).toHaveCount(0);
  await expect(page).toHaveScreenshot('SCENARIO-IMPACT-SUMMARY-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  // Discard restores the baseline exactly (Section 23) — the plan itself never silently changes.
  await simulation.getByRole('button', { name: 'Encerrar avaliação' }).click();
  await expect(page.getByRole('region', { name: 'Avaliação de cenário' })).toHaveCount(0);
  const restoredStart = await page.locator('[data-lot-id="lot-sd-508"]').evaluate((element) => (element as HTMLElement).style.left);
  expect(restoredStart).toBe(originalStart);
  await expect(page.locator('[data-lot-id="lot-sd-508"]')).toHaveAttribute('data-simulated', 'false');
});

test('a locked (already COMPLETED) requirement cannot be moved at all', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-sd-501"]').click(); // COMPLETED on DC01 at the 09:15 Scenario Clock
  const simulation = page.getByRole('region', { name: 'Avaliação de cenário' });
  await expect(simulation).toContainText('já iniciado/pausado/concluído');
});

test('has no automatically detectable accessibility violations and no forbidden red while simulating', async ({ page }) => {
  const AxeBuilder = (await import('@axe-core/playwright')).default;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-sd-508"]').click();
  const simulation = page.getByRole('region', { name: 'Avaliação de cenário' });
  await simulation.getByRole('button', { name: /^DC01/ }).click();
  await simulation.getByRole('button', { name: /Depois de Lote 509/ }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const redUsages = await page.locator('body *').evaluateAll((elements) => {
    const forbidden = new Set(['rgb(255, 0, 0)', 'rgb(220, 38, 38)', 'rgb(239, 68, 68)']);
    return elements.flatMap((element) => { const style = getComputedStyle(element); return [style.color, style.backgroundColor, style.borderColor].filter((value) => forbidden.has(value)); });
  });
  expect(redUsages).toEqual([]);
});
