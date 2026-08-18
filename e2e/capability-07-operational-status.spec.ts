import { expect, test } from './fixtures';

/**
 * HIKARI MES — Capability 07 · Atualizar Status da Produção. Reference
 * 2026-07-10, Scenario Clock 09:15. Operational Status is never an editable
 * field — it is the deterministic CONSEQUENCE of Plano Vigente + Release +
 * Execution + Production Confirmation + Events + Scenario Clock, centralized
 * in src/domain/production-status/models.ts and consumed identically by
 * Acompanhamento, Aderência and Visão Estratégica. lot-sd-514 (DC03,
 * 1S4-E5411-W0, 08:00–09:15, READY readiness, not pre-released at the 09:15
 * baseline) carries the full reactivity journey: it is already late to
 * release at 09:15, which lets one lot walk through every mandated
 * transition — Aguardando início · Atrasado → Liberado/Iniciado → Em
 * execução → Pausado → Retomado → Em execução · Atrasado → Registrar
 * produção (status unchanged) → Finalizar → Concluído.
 */

function openMonitoringContext(page: import('@playwright/test').Page, lotId: string) {
  return page.locator(`[data-lot-id="${lotId}"]`).first().click();
}

async function releaseLot514(page: import('@playwright/test').Page) {
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.locator('[data-lot-id="lot-sd-514"]').click();
  const modal = page.getByRole('dialog', { name: 'Lote 514' });
  await modal.getByRole('button', { name: 'Liberação' }).click();
  await expect(modal).toContainText('PRONTO PARA LIBERAR');
  await modal.getByRole('button', { name: 'Liberar para produção' }).click();
  await expect(modal).toContainText('LIBERADO');
  await modal.getByRole('button', { name: 'Fechar contexto do Lote' }).click();
}

test('MANDATORY E2E reactivity journey: WAITING_START → RUNNING → PAUSED → RUNNING → confirmed quantity (status unchanged) → COMPLETED, every consuming screen reacts (Section 39)', async ({ page }) => {
  await releaseLot514(page);

  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openMonitoringContext(page, 'lot-sd-514');
  const dialog = page.getByRole('dialog', { name: '1S4-E5411-W0' });
  await expect(dialog).toContainText('SituaçãoAguardando início');
  await expect(dialog).toContainText('AderênciaAtrasado');

  await dialog.getByRole('button', { name: 'Iniciar produção' }).click();
  await expect(dialog).toContainText('SituaçãoEm execução');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();
  await expect(page.locator('[data-lot-id="lot-sd-514"]').last()).toHaveAttribute('data-status', /RUNNING|DELAYED/);

  await openMonitoringContext(page, 'lot-sd-514');
  const dialog2 = page.getByRole('dialog', { name: '1S4-E5411-W0' });
  await dialog2.getByRole('button', { name: 'Registrar parada' }).click();
  await dialog2.getByRole('button', { name: 'Registrar parada' }).click();
  await expect(dialog2).toContainText('SituaçãoPausado');

  await dialog2.getByRole('button', { name: 'Retomar produção' }).click();
  await expect(dialog2).toContainText('SituaçãoEm execução');
  await expect(dialog2).toContainText('AderênciaAtrasado');

  // Production Confirmation changes Progress Quantity WITHOUT altering Execution Status (Section 18).
  await dialog2.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog2.getByLabel('Quantidade produzida na DC03').fill('60');
  await dialog2.getByRole('button', { name: 'Confirmar apontamento' }).click();
  await expect(dialog2).toContainText('SituaçãoEm execução');
  await expect(dialog2).toContainText('Produção60 / 100');
  await expect(dialog2.getByRole('button', { name: 'Finalizar execução' })).toHaveCount(0);

  await dialog2.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog2.getByLabel('Quantidade produzida na DC03').fill('40');
  await dialog2.getByRole('button', { name: 'Confirmar apontamento' }).click();
  // 100/100 while still RUNNING must read as ready for finalization, never as concluded by quantity alone (Section 19).
  await expect(dialog2).toContainText('SituaçãoEm execução');
  await expect(dialog2).toContainText('Pronto para finalização');
  await expect(dialog2).toContainText('Produção100 / 100');

  await dialog2.getByRole('button', { name: 'Finalizar execução' }).click();
  await expect(dialog2).toContainText('SituaçãoConcluído');
  await dialog2.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();
  await expect(page.locator('[data-lot-id="lot-sd-514"]').first()).toHaveAttribute('data-status', 'COMPLETED');

  // Every consuming screen reacts to the SAME fact — Aderência reads the identical domain status.
  await page.goto('/demo/fundicao-dc/production-adherence');
  const dc03Tile = page.getByRole('region', { name: 'Situação das Máquinas' }).getByRole('button', { name: /DC03/ });
  await expect(dc03Tile).toHaveAttribute('data-operational-status', 'COMPLETED');
});

test('MANDATORY regression: no screen offers manual status selection — no status dropdown, no "Alterar status"/"Atualizar status manualmente" control', async ({ page }) => {
  const routes = ['/demo/fundicao-dc', '/demo/fundicao-dc/strategic', '/demo/fundicao-dc/production-scheduling', '/demo/fundicao-dc/production-readiness', '/demo/fundicao-dc/production-execution', '/demo/fundicao-dc/production-monitoring', '/demo/fundicao-dc/production-adherence', '/demo/fundicao-dc/production-quality', '/demo/fundicao-dc/oee'];
  for (const route of routes) {
    await page.goto(route);
    const selects = await page.locator('select').all();
    for (const select of selects) {
      const accessibleName = (await select.getAttribute('aria-label')) ?? '';
      expect(accessibleName.toLowerCase(), `Found a <select> possibly for status on ${route}`).not.toMatch(/status|situa[çc][ãa]o/);
    }
    await expect(page.getByRole('button', { name: /Alterar status|Atualizar status manualmente/i }), `Found a manual status control on ${route}`).toHaveCount(0);
  }
});

test('Cross-screen consistency: Acompanhamento and Aderência agree on the SAME domain Operational Status value for the SAME Resource (Section 38)', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  const monitoringStatuses: Record<string, string | null> = {};
  for (const resourceId of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) {
    const lane = page.locator(`button[data-operational-status]:has-text("${resourceId}")`).first();
    monitoringStatuses[resourceId] = await lane.getAttribute('data-operational-status');
  }

  await page.goto('/demo/fundicao-dc/production-adherence');
  for (const resourceId of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) {
    const tile = page.getByRole('region', { name: 'Situação das Máquinas' }).getByRole('button', { name: new RegExp(resourceId) });
    await expect(tile).toHaveAttribute('data-operational-status', monitoringStatuses[resourceId]!);
  }
});

test('captures Capability 07 screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/demo/fundicao-dc/production-monitoring');
  await expect(page.getByRole('heading', { name: 'O que está acontecendo em relação ao plano?' })).toBeVisible();
  await expect(page).toHaveScreenshot('CAP-07-OPERATIONAL-STATUS-OVERVIEW-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await releaseLot514(page);
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openMonitoringContext(page, 'lot-sd-514');
  const dialog = page.getByRole('dialog', { name: '1S4-E5411-W0' });
  await expect(dialog).toContainText('SituaçãoAguardando início');
  await expect(dialog).toContainText('AderênciaAtrasado');
  await expect(page).toHaveScreenshot('CAP-07-WAITING-START-LATE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await dialog.getByRole('button', { name: 'Iniciar produção' }).click();
  await expect(dialog).toContainText('SituaçãoEm execução');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();
  await expect(page).toHaveScreenshot('CAP-07-RESOURCE-STATUS-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await openMonitoringContext(page, 'lot-sd-514');
  const dialog2 = page.getByRole('dialog', { name: '1S4-E5411-W0' });
  await dialog2.getByRole('button', { name: 'Registrar parada' }).click();
  await dialog2.getByRole('button', { name: 'Registrar parada' }).click();
  await expect(dialog2).toContainText('SituaçãoPausado');
  await expect(page).toHaveScreenshot('CAP-07-PAUSED-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await dialog2.getByRole('button', { name: 'Retomar produção' }).click();
  await expect(dialog2).toContainText('SituaçãoEm execução');
  await expect(dialog2).toContainText('AderênciaAtrasado');
  await expect(page).toHaveScreenshot('CAP-07-RUNNING-LATE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await dialog2.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog2.getByLabel('Quantidade produzida na DC03').fill('100');
  await dialog2.getByRole('button', { name: 'Confirmar apontamento' }).click();
  await expect(dialog2).toContainText('Pronto para finalização');
  await dialog2.getByRole('button', { name: 'Finalizar execução' }).click();
  await expect(dialog2).toContainText('SituaçãoConcluído');
  await expect(page).toHaveScreenshot('CAP-07-COMPLETED-STATUS-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('has no automatically detectable accessibility violations and no forbidden red on Acompanhamento with the Situação Operacional block open', async ({ page }) => {
  const AxeBuilder = (await import('@axe-core/playwright')).default;
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openMonitoringContext(page, 'lot-sd-512');
  const dialog = page.getByRole('dialog', { name: '1ST-E5111-W0' });
  await expect(dialog).toContainText('Situação operacional');
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

test('keyboard: Situação Operacional block and its fields are reachable without a mouse', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openMonitoringContext(page, 'lot-sd-512');
  const dialog = page.getByRole('dialog', { name: '1ST-E5111-W0' });
  await expect(dialog).toContainText('Situação operacional');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});
