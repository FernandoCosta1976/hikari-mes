import { expect, test } from './fixtures';

/**
 * HIKARI MES — Capability 05 · Executar Ordens de Produção. Reference
 * 2026-07-10, Scenario Clock 09:15. Materialized through Acompanhamento's
 * own Context Modal (Section 2/20) — Start/Pause/Resume/Complete all read
 * and write the SAME Scenario store as Plano/Preparação/Liberação/OEE, never
 * a dataset of its own. Two real requirements carry the demonstration:
 *  - lot-sd-509 (DC01, NOT_STARTED, READY, released for real via Plano/
 *    Liberação before Start) — START, PAUSE and RESUME example.
 *  - lot-sd-507 (DC01, already RUNNING at 09:15, closest to its own Scheduled
 *    Finish) — COMPLETE example.
 */

function openContext(page: import('@playwright/test').Page, lotId: string) {
  return page.locator(`[data-lot-id="${lotId}"]`).first().click();
}

test('completes the governed cross-screen journey: Start → Pause → Resume → Reset (Section 35)', async ({ page }) => {
  // Release is Capability 04's own decision — lot-sd-509 is genuinely NOT_STARTED and unreleased in the
  // reference baseline, so the journey exercises the real precondition chain via Plano before Acompanhamento.
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.locator('[data-lot-id="lot-sd-509"]').click();
  const planoModal = page.getByRole('dialog', { name: 'Lote 509' });
  await planoModal.getByRole('button', { name: 'Liberação' }).click();
  await planoModal.getByRole('button', { name: 'Liberar para produção' }).click();
  await expect(planoModal).toContainText('LIBERADO');
  await planoModal.getByRole('button', { name: 'Fechar contexto do Lote' }).click();

  await page.goto('/demo/fundicao-dc/production-monitoring');
  await expect(page.getByRole('heading', { name: 'O que está acontecendo em relação ao plano?' })).toBeVisible();

  await openContext(page, 'lot-sd-509');
  const dialog = page.getByRole('dialog', { name: '1ST-E5421-W0' });
  await expect(dialog).toContainText('Aguardando início');
  await dialog.getByRole('button', { name: 'Iniciar produção' }).click();
  await expect(dialog).toContainText('SituaçãoEm execução');
  await expect(dialog).toContainText('OperadorOperador 01');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  // Acompanhamento reflects the change immediately, no refresh.
  await expect(page.locator('[data-lot-id="lot-sd-509"]').first()).toHaveAttribute('data-status', 'RUNNING');

  await openContext(page, 'lot-sd-509');
  await expect(dialog).toContainText('Registrar parada');
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await expect(dialog).toContainText('Retomar produção');
  await dialog.getByRole('button', { name: 'Retomar produção' }).click();
  await expect(dialog).toContainText('Registrar parada');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  await page.getByRole('button', { name: 'Reiniciar cenário' }).click();
  await page.getByRole('alertdialog', { name: 'Reiniciar cenário demonstrativo?' }).getByRole('button', { name: 'Reiniciar cenário' }).click();
  await expect(page.locator('[data-lot-id="lot-sd-509"]').first()).toHaveAttribute('data-status', 'SCHEDULED');
  await expect(page.getByText('09:15').first()).toBeVisible();
});

test('Start is gated on Release — a real, not-yet-released Requirement offers no Start action', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openContext(page, 'lot-sd-513');
  const dialog = page.getByRole('dialog', { name: '1ST-E5111-W0' });
  await expect(dialog).toContainText('Aguardando liberação');
  await expect(dialog.getByRole('button', { name: 'Iniciar produção' })).toHaveCount(0);
});

test('the Context Modal traps focus on open and closes with Escape (Section 40 — keyboard/focus)', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openContext(page, 'lot-sd-507');
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  await expect(dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('Complete becomes available once the confirmed Production total reaches Planned Quantity (Capability 06)', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openContext(page, 'lot-sd-507');
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  await expect(dialog).toContainText('SituaçãoEm execução');
  await expect(dialog).toContainText('Produzido65 peças');
  await expect(dialog.getByRole('button', { name: 'Finalizar execução' })).toHaveCount(0);

  // lot-sd-507 is already at 65/100 confirmed at the 09:15 baseline — registering the remaining 35 reaches Planned Quantity.
  await dialog.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog.getByLabel('Quantidade produzida na DC01').fill('35');
  await dialog.getByRole('button', { name: 'Confirmar apontamento' }).click();
  await expect(dialog).toContainText('Produzido100 peças');
  await expect(dialog.getByRole('button', { name: 'Finalizar execução' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Finalizar execução' }).click();
  await expect(dialog).toContainText('Quantidade executada100 peças');
  await expect(dialog).not.toContainText('Registrar parada');
});

test('a historical COMPLETED requirement is read-only — no execution action offered', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openContext(page, 'lot-sd-501');
  const dialog = page.getByRole('dialog', { name: '5LX-E5421-X0' });
  await expect(dialog).toContainText('Quantidade executada50 peças');
  await expect(dialog.getByRole('button', { name: 'Iniciar produção' })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Registrar parada' })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Retomar produção' })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Finalizar execução' })).toHaveCount(0);
});

test('What-if isolation — Avaliar Cenário never applies to the Execution baseline (Section 24/25)', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-sd-508"]').click();
  const simulation = page.getByRole('region', { name: 'Avaliação de cenário' });
  await simulation.getByRole('button', { name: /^DC01/ }).click();
  await simulation.getByRole('button', { name: /Depois de Lote 509/ }).click();
  await expect(simulation).toContainText('CENÁRIO SIMULADO — NÃO APLICADO');

  // The simulation is never applied to the Execution baseline — lot-sd-508's own Scheduled Start (09:29) is still
  // in the future at 09:15, so Acompanhamento correctly reports it SCHEDULED, never a fabricated RUNNING/simulated position.
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await expect(page.locator('[data-lot-id="lot-sd-508"]').first()).toHaveAttribute('data-status', 'SCHEDULED');
});

test('captures Capability 05 screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  // lot-sd-509 is genuinely NOT_STARTED and unreleased in the reference baseline — release it for real via
  // Plano (Capability 04) so the WAITING-START scene shows a Requirement that has actually satisfied the
  // Start precondition, without altering the reference Liberação KPI count.
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.locator('[data-lot-id="lot-sd-509"]').click();
  const planoModal = page.getByRole('dialog', { name: 'Lote 509' });
  await planoModal.getByRole('button', { name: 'Liberação' }).click();
  await planoModal.getByRole('button', { name: 'Liberar para produção' }).click();
  await expect(planoModal).toContainText('LIBERADO');
  await planoModal.getByRole('button', { name: 'Fechar contexto do Lote' }).click();

  await page.goto('/demo/fundicao-dc/production-monitoring');

  await openContext(page, 'lot-sd-509');
  const startDialog = page.getByRole('dialog', { name: '1ST-E5421-W0' });
  await expect(startDialog).toContainText('Aguardando início');
  await expect(page).toHaveScreenshot('CAP-05-0915-WAITING-START-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await startDialog.getByRole('button', { name: 'Iniciar produção' }).click();
  await expect(startDialog).toContainText('SituaçãoEm execução');
  await expect(page).toHaveScreenshot('CAP-05-0915-RUNNING-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await startDialog.getByRole('button', { name: 'Registrar parada' }).click();
  await startDialog.getByRole('button', { name: 'Registrar parada' }).click();
  await expect(startDialog).toContainText('Retomar produção');
  await expect(page).toHaveScreenshot('CAP-05-0915-PAUSED-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await startDialog.getByRole('button', { name: 'Retomar produção' }).click();
  await expect(startDialog).toContainText('Registrar parada');
  await expect(page).toHaveScreenshot('CAP-05-0915-RESUMED-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await startDialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();
  await expect(page.locator('[data-lot-id="lot-sd-509"]').first()).toHaveAttribute('data-status', 'RUNNING');
  await expect(page).toHaveScreenshot('CAP-05-0915-MONITORING-UPDATED-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('has no automatically detectable accessibility violations and no forbidden red while operating Execution', async ({ page }) => {
  const AxeBuilder = (await import('@axe-core/playwright')).default;
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.locator('[data-lot-id="lot-sd-509"]').click();
  const planoModal = page.getByRole('dialog', { name: 'Lote 509' });
  await planoModal.getByRole('button', { name: 'Liberação' }).click();
  await planoModal.getByRole('button', { name: 'Liberar para produção' }).click();
  await planoModal.getByRole('button', { name: 'Fechar contexto do Lote' }).click();

  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openContext(page, 'lot-sd-509');
  const dialog = page.getByRole('dialog', { name: '1ST-E5421-W0' });
  await dialog.getByRole('button', { name: 'Iniciar produção' }).click();
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const redUsages = await page.locator('body *').evaluateAll((elements) => {
    const forbidden = new Set(['rgb(255, 0, 0)', 'rgb(220, 38, 38)', 'rgb(239, 68, 68)']);
    return elements.flatMap((element) => { const style = getComputedStyle(element); return [style.color, style.backgroundColor, style.borderColor].filter((value) => forbidden.has(value)); });
  });
  expect(redUsages).toEqual([]);

  // Section 40 — the Execution Control section must not introduce horizontal overflow at any mandated viewport.
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    const dimensions = await page.locator('html').evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
  }
});
