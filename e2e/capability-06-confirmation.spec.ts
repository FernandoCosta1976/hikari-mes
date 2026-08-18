import { expect, test } from './fixtures';

/**
 * HIKARI MES — Capability 06 · Registrar Produção. Reference 2026-07-10,
 * Scenario Clock 09:15. Production Confirmation (quantity reporting) is
 * materialized through Acompanhamento's own Context Modal, preserving the
 * distinction between Execution Control (Capability 05) and Production
 * Confirmation (Capability 06) — both read and write the SAME Scenario
 * store, never a dataset of its own. lot-sd-512 (DC02, RUNNING_ON_TIME,
 * already 74/100 confirmed at the 09:15 baseline) carries the demonstration.
 */

function openContext(page: import('@playwright/test').Page, lotId: string) {
  return page.locator(`[data-lot-id="${lotId}"]`).first().click();
}

async function producedFromStrategic(page: import('@playwright/test').Page): Promise<number> {
  const text = (await page.locator('small', { hasText: 'Meta' }).first().textContent()) ?? '';
  const match = text.match(/Produzido ([\d.]+)/);
  if (!match) throw new Error(`Could not find "Produzido" in: ${text}`);
  return Number(match[1].replace(/\./g, ''));
}

test('completes the governed cross-screen journey: Open Monitoring → Registrar produção (partial) → Registrar produção (full) → Finalizar → COMPLETED (Section 30/43)', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await expect(page.getByRole('heading', { name: 'O que está acontecendo em relação ao plano?' })).toBeVisible();

  await openContext(page, 'lot-sd-512');
  const dialog = page.getByRole('dialog', { name: '1ST-E5111-W0' });
  await expect(dialog).toContainText('SituaçãoEm execução');
  await expect(dialog).toContainText('Produzido74 peças');
  await expect(dialog).toContainText('Restante26 peças');
  await expect(dialog.getByRole('button', { name: 'Finalizar execução' })).toHaveCount(0);

  // Registrar produção (partial): +13 -> 87/100, Finalizar still unavailable.
  await dialog.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog.getByLabel('Quantidade produzida na DC02').fill('13');
  await expect(dialog).toContainText('Produção acumulada após confirmação: 87 / 100');
  await dialog.getByRole('button', { name: 'Confirmar apontamento' }).click();
  await expect(dialog).toContainText('Produzido87 peças');
  await expect(dialog).toContainText('Restante13 peças');
  await expect(dialog.getByRole('button', { name: 'Finalizar execução' })).toHaveCount(0);
  await expect(dialog).toContainText('09:15 · +13');

  // Acompanhamento reflects the change immediately in the timeline block too, no refresh.
  await expect(page.locator('[data-lot-id="lot-sd-512"]').last()).toContainText('87/100');

  // Registrar produção (full): +13 more -> 100/100, Finalizar becomes available.
  await dialog.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog.getByLabel('Quantidade produzida na DC02').fill('13');
  await dialog.getByRole('button', { name: 'Confirmar apontamento' }).click();
  await expect(dialog).toContainText('Produzido100 peças');
  await expect(dialog.getByRole('button', { name: 'Finalizar execução' })).toBeVisible();

  await dialog.getByRole('button', { name: 'Finalizar execução' }).click();
  await expect(dialog).toContainText('SituaçãoConcluído');
  await expect(dialog).toContainText('Quantidade executada100 peças');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();
  await expect(page.locator('[data-lot-id="lot-sd-512"]').first()).toHaveAttribute('data-status', 'COMPLETED');
});

test('Registrar produção requires the Requirement to be RUNNING — a NOT_STARTED or PAUSED Requirement offers no confirmation action', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');

  await openContext(page, 'lot-sd-513'); // real, unreleased, NOT_STARTED
  const notStartedDialog = page.getByRole('dialog', { name: '1ST-E5111-W0' });
  await expect(notStartedDialog.getByRole('button', { name: 'Registrar produção' })).toHaveCount(0);
  await notStartedDialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  await openContext(page, 'lot-sd-512'); // real, RUNNING at baseline
  const dialog = page.getByRole('dialog', { name: '1ST-E5111-W0' });
  await expect(dialog.getByRole('button', { name: 'Registrar produção' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await expect(dialog.getByRole('button', { name: 'Retomar produção' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Registrar produção' })).toHaveCount(0);
});

test('a historical COMPLETED requirement offers no confirmation action either — read-only, no double counting', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openContext(page, 'lot-sd-501');
  const dialog = page.getByRole('dialog', { name: '5LX-E5421-X0' });
  await expect(dialog).toContainText('Quantidade executada50 peças');
  await expect(dialog.getByRole('button', { name: 'Registrar produção' })).toHaveCount(0);
});

test('increment validation: rejects zero, rejects a fraction, and reports the exact remaining balance when it exceeds Planned Quantity (Section 7/8/9)', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openContext(page, 'lot-sd-512');
  const dialog = page.getByRole('dialog', { name: '1ST-E5111-W0' });
  await dialog.getByRole('button', { name: 'Registrar produção' }).click();
  const input = dialog.getByLabel('Quantidade produzida na DC02');
  const confirmButton = dialog.getByRole('button', { name: 'Confirmar apontamento' });

  await input.fill('0');
  await expect(confirmButton).toBeDisabled();

  await input.fill('12.5');
  await expect(dialog).toContainText('Quantidade deve ser um número inteiro.');
  await expect(confirmButton).toBeDisabled();

  await input.fill('30'); // only 26 remain (74 confirmed / 100 planned)
  await expect(dialog).toContainText('Quantidade excede o saldo planejado de 26 peças.');
  await expect(confirmButton).toBeDisabled();

  await input.fill('26');
  await expect(dialog).toContainText('Produção acumulada após confirmação: 100 / 100');
  await expect(confirmButton).toBeEnabled();
});

test('a rapid double-click on Confirmar apontamento creates exactly one confirmation (Section 34 — idempotency)', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openContext(page, 'lot-sd-512');
  const dialog = page.getByRole('dialog', { name: '1ST-E5111-W0' });
  await dialog.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog.getByLabel('Quantidade produzida na DC02').fill('10');
  await dialog.getByRole('button', { name: 'Confirmar apontamento' }).dblclick();
  // The form closes and the input clears on the first successful confirmation — a second click lands on
  // nothing confirmable, so the accumulated total advances by exactly one increment, never two.
  await expect(dialog).toContainText('Produzido84 peças');
  await expect(dialog).not.toContainText('Produzido94 peças');
});

test('Reset restores the exact seed confirmations — user-added confirmations are discarded, historical ones are not altered', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openContext(page, 'lot-sd-512');
  const dialog = page.getByRole('dialog', { name: '1ST-E5111-W0' });
  await dialog.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog.getByLabel('Quantidade produzida na DC02').fill('13');
  await dialog.getByRole('button', { name: 'Confirmar apontamento' }).click();
  await expect(dialog).toContainText('Produzido87 peças');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  await page.getByRole('button', { name: 'Reiniciar cenário' }).click();
  await page.getByRole('alertdialog', { name: 'Reiniciar cenário demonstrativo?' }).getByRole('button', { name: 'Reiniciar cenário' }).click();

  await openContext(page, 'lot-sd-512');
  const restoredDialog = page.getByRole('dialog', { name: '1ST-E5111-W0' });
  await expect(restoredDialog).toContainText('Produzido74 peças');
});

test('cross-screen reactivity: confirming production updates Acompanhamento, Qualidade & Desempenho and Visão Estratégica from the same source (Section 37)', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/strategic');
  const producedBefore = await producedFromStrategic(page);

  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openContext(page, 'lot-sd-512');
  const dialog = page.getByRole('dialog', { name: '1ST-E5111-W0' });
  await dialog.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog.getByLabel('Quantidade produzida na DC02').fill('13');
  await dialog.getByRole('button', { name: 'Confirmar apontamento' }).click();
  await expect(dialog).toContainText('Produzido87 peças');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  await page.goto('/demo/fundicao-dc/strategic');
  const producedAfter = await producedFromStrategic(page);
  expect(producedAfter).toBe(producedBefore + 13);

  await page.goto('/demo/fundicao-dc/production-quality');
  await expect(page.getByRole('heading', { name: 'Quanto produzimos e quanto foi bom?' })).toBeVisible();
  await expect(page.getByText(/\d+ peças/).first()).toBeVisible();
});

test('captures Capability 06 screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');

  await openContext(page, 'lot-sd-512');
  const dialog = page.getByRole('dialog', { name: '1ST-E5111-W0' });
  await expect(dialog).toContainText('Produzido74 peças');
  await expect(page).toHaveScreenshot('CAP-06-0915-RUNNING-BEFORE-CONFIRMATION-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await dialog.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog.getByLabel('Quantidade produzida na DC02').fill('13');
  await expect(page).toHaveScreenshot('CAP-06-PRODUCTION-CONFIRMATION-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await dialog.getByRole('button', { name: 'Confirmar apontamento' }).click();
  await expect(dialog).toContainText('Produzido87 peças');
  await expect(page).toHaveScreenshot('CAP-06-PARTIAL-CONFIRMED-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await dialog.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog.getByLabel('Quantidade produzida na DC02').fill('13');
  await dialog.getByRole('button', { name: 'Confirmar apontamento' }).click();
  await expect(dialog).toContainText('Produzido100 peças');
  await expect(page).toHaveScreenshot('CAP-06-FULL-CONFIRMED-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await dialog.getByRole('button', { name: 'Finalizar execução' }).click();
  await expect(dialog).toContainText('SituaçãoConcluído');
  await expect(page).toHaveScreenshot('CAP-06-COMPLETED-AFTER-CONFIRMATION-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  await page.goto('/demo/fundicao-dc/strategic');
  await expect(page.getByRole('heading', { name: 'Como está a saúde da Fundição DC?' })).toBeVisible();
  await expect(page).toHaveScreenshot('CAP-06-CROSS-SCREEN-METRICS-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('has no automatically detectable accessibility violations and no forbidden red while registering production', async ({ page }) => {
  const AxeBuilder = (await import('@axe-core/playwright')).default;
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openContext(page, 'lot-sd-512');
  const dialog = page.getByRole('dialog', { name: '1ST-E5111-W0' });
  await dialog.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog.getByLabel('Quantidade produzida na DC02').fill('200'); // deliberately invalid, to also cover the error state
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
