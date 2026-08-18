import { expect, test } from './fixtures';

/**
 * HIKARI MES — Capability 08 · Gestão de Eventos e Paradas. Reference
 * 2026-07-10, Scenario Clock 09:15. "Registrar parada" materializes a
 * governed Production Event — the SAME source Acompanhamento, Aderência,
 * OEE and Visão Estratégica all read (Section 24) — while Execution Status,
 * the Production Event and its OEE Classification stay three distinct
 * facts (Section 1). lot-sd-507 (DC01, 44C-E5421-W0, RUNNING at 09:15,
 * 65/100 confirmed) carries the journey.
 */

function openMonitoringContext(page: import('@playwright/test').Page, lotId: string) {
  return page.locator(`[data-lot-id="${lotId}"]`).first().click();
}

async function resetScenario(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Reiniciar cenário' }).click();
  await page.getByRole('alertdialog', { name: 'Reiniciar cenário demonstrativo?' }).getByRole('button', { name: 'Reiniciar cenário' }).click();
}

test('MANDATORY E2E journey: Reset → RUNNING → Registrar parada → PAUSADO → Retomar → RUNNING → Aderência/OEE updated → Reset restores baseline (Section 29)', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await resetScenario(page);

  await openMonitoringContext(page, 'lot-sd-507');
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  await expect(dialog).toContainText('SituaçãoEm execução');
  await expect(dialog).not.toContainText('Última mudança09:');

  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await dialog.getByLabel('Motivo da parada na DC01').selectOption('EQUIPMENT_FAILURE');
  await dialog.getByLabel('Observação da parada na DC01').fill('Correia rompida — troca em andamento');
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();

  await expect(dialog).toContainText('SituaçãoPausado');
  await expect(dialog).toContainText('MotivoFalha de equipamento');
  await expect(dialog).toContainText('ObservaçãoCorreia rompida — troca em andamento');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();
  // The Resource lane surfaces the active Event without depending on color alone (Section 13).
  const dc01Lane = page.locator('button[data-operational-status]', { hasText: 'DC01' });
  await expect(dc01Lane).toContainText('Falha de equipamento');

  await openMonitoringContext(page, 'lot-sd-507');
  const dialog2 = page.getByRole('dialog', { name: '44C-E5421-W0' });
  await expect(dialog2).toContainText('SituaçãoPausado');
  await dialog2.getByRole('button', { name: 'Retomar produção' }).click();
  await expect(dialog2).toContainText('SituaçãoEm execução');
  await expect(dialog2).toContainText('Última mudança');
  await expect(dialog2).toContainText('Retomado');

  const eventos = dialog2.locator('section', { hasText: 'Eventos' }).last();
  await expect(eventos).toContainText('Falha de equipamento');
  await expect(eventos).toContainText('min · ENCERRADO');
  await dialog2.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  // The same fact is visible from Aderência — never a second, diverging classification.
  await page.goto('/demo/fundicao-dc/production-adherence');
  const dc01Tile = page.getByRole('region', { name: 'Situação das Máquinas' }).getByRole('button', { name: /DC01/ });
  await expect(dc01Tile).toHaveAttribute('data-operational-status', 'RUNNING');

  // OEE Availability now reflects the governed Unplanned Downtime this Event produced.
  await page.goto('/demo/fundicao-dc/oee');
  await expect(page.getByRole('heading', { name: 'Como estamos performando e por quê?' })).toBeVisible();
  const dc01Row = page.getByRole('region', { name: 'Situação das Máquinas' }).getByRole('button', { name: /DC01/ });
  await expect(dc01Row).toBeVisible();

  // Reset restores the exact 09:15 snapshot — the live Event and its Availability impact are both gone.
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await resetScenario(page);
  await openMonitoringContext(page, 'lot-sd-507');
  const restoredDialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  await expect(restoredDialog).toContainText('SituaçãoEm execução');
  await expect(restoredDialog).toContainText('Produção65 / 100');
  const restoredEventos = restoredDialog.locator('section', { hasText: 'Eventos' }).last();
  await expect(restoredEventos).toContainText('Sem eventos demonstrativos.');
});

test('Registrar parada is only offered for a RUNNING Requirement — never a manual status control', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openMonitoringContext(page, 'lot-sd-514'); // DC03, not yet started at 09:15
  const dialog = page.getByRole('dialog', { name: '1S4-E5411-W0' });
  await expect(dialog.getByRole('button', { name: 'Registrar parada' })).toHaveCount(0);
  await expect(page.locator('select[aria-label*="status" i], select[aria-label*="situação" i]')).toHaveCount(0);
});

test('cross-screen Event consistency: the SAME active Event is visible from Acompanhamento and reflected in Aderência and OEE without a second computation', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await resetScenario(page);
  await openMonitoringContext(page, 'lot-sd-521'); // DC05, RUNNING at 09:15
  const dialog = page.getByRole('dialog', { name: '1ST-E1310-W0' });
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await dialog.getByLabel('Motivo da parada na DC05').selectOption('TOOLING');
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await expect(dialog).toContainText('SituaçãoPausado');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  await page.goto('/demo/fundicao-dc/production-adherence');
  const dc05Tile = page.getByRole('region', { name: 'Situação das Máquinas' }).getByRole('button', { name: /DC05/ });
  await expect(dc05Tile).toHaveAttribute('data-operational-status', 'PAUSED');

  await page.goto('/demo/fundicao-dc/strategic');
  await expect(page.getByTestId('strategic-downtime-summary')).toBeVisible();
});

test('captures Capability 08 screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await resetScenario(page);

  await openMonitoringContext(page, 'lot-sd-507');
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await dialog.getByLabel('Motivo da parada na DC01').selectOption('EQUIPMENT_FAILURE');
  await dialog.getByLabel('Observação da parada na DC01').fill('Correia rompida — troca em andamento');
  await expect(page).toHaveScreenshot('CAP-08-EVENT-OPEN-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await expect(dialog).toContainText('SituaçãoPausado');
  await dialog.getByRole('button', { name: 'Retomar produção' }).click();
  await expect(dialog).toContainText('SituaçãoEm execução');
  const eventos = dialog.locator('section', { hasText: 'Eventos' }).last();
  await expect(eventos).toContainText('ENCERRADO');
  await expect(page).toHaveScreenshot('CAP-08-EVENT-HISTORY-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();
  await expect(page).toHaveScreenshot('CAP-08-DOWNTIME-IMPACT-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await page.goto('/demo/fundicao-dc/oee');
  await expect(page.getByRole('heading', { name: 'Como estamos performando e por quê?' })).toBeVisible();
  await expect(page).toHaveScreenshot('CAP-08-OEE-AVAILABILITY-IMPACT-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('has no automatically detectable accessibility violations and no forbidden red while operating Registrar parada', async ({ page }) => {
  const AxeBuilder = (await import('@axe-core/playwright')).default;
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openMonitoringContext(page, 'lot-sd-507');
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
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

test('keyboard: Registrar parada form is reachable and dismissible without a mouse', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openMonitoringContext(page, 'lot-sd-507');
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await expect(dialog.getByLabel('Motivo da parada na DC01')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});
