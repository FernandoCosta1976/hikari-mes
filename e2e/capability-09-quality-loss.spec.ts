import { expect, test } from './fixtures';

/**
 * HIKARI MES — Capability 09 · Qualidade e Perdas. Reference 2026-07-10,
 * Scenario Clock 09:15. "Registrar qualidade" never re-asks Produzido — it
 * only classifies the Pending balance (Produced − Classified) into
 * Boas/Rejeitadas, the SAME source Qualidade & Desempenho, OEE and Visão
 * Estratégica all read (Section 3/5/31). lot-sd-507 (DC01, 44C-E5421-W0,
 * RUNNING at 09:15, 65 produced / 50 classified / 15 Pending) carries the
 * journey.
 */

function openMonitoringContext(page: import('@playwright/test').Page, lotId: string) {
  return page.locator(`[data-lot-id="${lotId}"]`).first().click();
}

async function resetScenario(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Reiniciar cenário' }).click();
  await page.getByRole('alertdialog', { name: 'Reiniciar cenário demonstrativo?' }).getByRole('button', { name: 'Reiniciar cenário' }).click();
}

test('MANDATORY E2E journey: Reset → Acompanhamento → Registrar qualidade → Produzido inalterado → Qualidade muda → Qualidade&Desempenho/OEE/Estratégica refletem → Reset restaura (Section 41)', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await resetScenario(page);

  await openMonitoringContext(page, 'lot-sd-507');
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  await expect(dialog).toContainText('Produção65 / 100');
  const qualitySection = dialog.locator('section[aria-label="Qualidade"]');
  await expect(qualitySection).toContainText('Produção confirmada65');
  await expect(qualitySection).toContainText('Classificado50');
  await expect(qualitySection).toContainText('Pendente15');

  await qualitySection.getByRole('button', { name: 'Registrar qualidade' }).click();
  await qualitySection.getByLabel('Peças boas na DC01').fill('13');
  await qualitySection.getByLabel('Peças rejeitadas na DC01').fill('2');
  await qualitySection.getByLabel('Motivo da rejeição na DC01').selectOption('PROCESS_DEFECT');
  await expect(qualitySection).toContainText('Após confirmar: Classificado 65 · Pendente 0');
  await qualitySection.getByRole('button', { name: 'Confirmar' }).click();

  // Produzido never changes when registering qualidade (Section 3/31).
  await expect(dialog).toContainText('Produção65 / 100');
  await expect(qualitySection).toContainText('Classificado65');
  await expect(qualitySection).toContainText('Pendente0');
  await expect(qualitySection).toContainText('Boas61');
  await expect(qualitySection).toContainText('Rejeitadas4');
  await expect(qualitySection).toContainText('Taxa de qualidade94%');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  // Qualidade & Desempenho reflects the SAME change — never a second computation.
  await page.goto('/demo/fundicao-dc/production-quality');
  const machines = page.getByRole('region', { name: 'Situação das Máquinas' });
  const dc01 = machines.getByRole('button', { name: /DC01/ });
  await expect(dc01).toContainText('65 produzidas · 61 boas');
  await expect(dc01).toContainText('94%');

  // OEE Quality reflects the same aggregate — never re-derived independently.
  await page.goto('/demo/fundicao-dc/oee');
  const oeeMachines = page.getByRole('region', { name: 'Situação das Máquinas' });
  const dc01OeeRow = oeeMachines.getByRole('button', { name: /DC01/ });
  await expect(dc01OeeRow).toContainText('Q 94%');

  // Visão Estratégica reflects the SAME Reject total (day aggregate, +2 from the baseline of 24) — never a second computation.
  await page.goto('/demo/fundicao-dc/strategic');
  await expect(page.getByTestId('strategic-quality-summary')).toContainText('26 rejeitadas');

  // Reset restores the exact 09:15 Quality snapshot — the live classification is discarded.
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await resetScenario(page);
  await openMonitoringContext(page, 'lot-sd-507');
  const restoredDialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  const restoredQuality = restoredDialog.locator('section[aria-label="Qualidade"]');
  await expect(restoredQuality).toContainText('Classificado50');
  await expect(restoredQuality).toContainText('Pendente15');
});

test('Reject > 0 requires a Motivo — the Confirmar button stays disabled until one is chosen, and zero-reject never asks for a reason', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await resetScenario(page);
  await openMonitoringContext(page, 'lot-sd-507');
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  const qualitySection = dialog.locator('section[aria-label="Qualidade"]');
  await qualitySection.getByRole('button', { name: 'Registrar qualidade' }).click();

  await qualitySection.getByLabel('Peças boas na DC01').fill('5');
  await expect(qualitySection.getByLabel('Motivo da rejeição na DC01')).toHaveCount(0); // zero reject never asks for a reason
  await expect(qualitySection.getByRole('button', { name: 'Confirmar' })).toBeEnabled();

  await qualitySection.getByLabel('Peças rejeitadas na DC01').fill('3');
  await expect(qualitySection.getByLabel('Motivo da rejeição na DC01')).toBeVisible();
});

test('cannot classify beyond the Pending balance — the exact message names the real figure', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await resetScenario(page);
  await openMonitoringContext(page, 'lot-sd-507');
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  const qualitySection = dialog.locator('section[aria-label="Qualidade"]');
  await qualitySection.getByRole('button', { name: 'Registrar qualidade' }).click();
  await qualitySection.getByLabel('Peças boas na DC01').fill('20');
  await expect(qualitySection).toContainText('Existem apenas 15 peças pendentes de classificação.');
  await expect(qualitySection.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
});

test('a fully classified Requirement offers no further Registrar qualidade — the Qualidade & Desempenho drill-down mirrors the same state', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await resetScenario(page);
  await openMonitoringContext(page, 'lot-sd-501'); // already COMPLETED and fully classified at baseline
  const dialog = page.getByRole('dialog');
  const qualitySection = dialog.locator('section[aria-label="Qualidade"]');
  await expect(qualitySection).toContainText('Classificação completa — não há saldo pendente.');
  await expect(qualitySection.getByRole('button', { name: 'Registrar qualidade' })).toHaveCount(0);
});

test('cross-screen Quality consistency: the SAME classified Quality Confirmation is visible from Acompanhamento, Qualidade & Desempenho, OEE and Visão Estratégica without a second computation', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await resetScenario(page);
  await openMonitoringContext(page, 'lot-sd-507');
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  const qualitySection = dialog.locator('section[aria-label="Qualidade"]');
  await qualitySection.getByRole('button', { name: 'Registrar qualidade' }).click();
  await qualitySection.getByLabel('Peças boas na DC01').fill('15');
  await qualitySection.getByRole('button', { name: 'Confirmar' }).click();
  await expect(qualitySection).toContainText('Pendente0');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  await page.goto('/demo/fundicao-dc/production-quality');
  const machines = page.getByRole('region', { name: 'Situação das Máquinas' });
  await expect(machines.getByRole('button', { name: /DC01/ })).toContainText('65 produzidas · 63 boas');

  await page.goto('/demo/fundicao-dc/oee');
  const oeeMachines = page.getByRole('region', { name: 'Situação das Máquinas' });
  await expect(oeeMachines.getByRole('button', { name: /DC01/ })).toContainText('Q 97%');

  // Reject total is untouched by this Good-only classification — the day aggregate stays at the SAME 24, never independently recomputed.
  await page.goto('/demo/fundicao-dc/strategic');
  await expect(page.getByTestId('strategic-quality-summary')).toContainText('24 rejeitadas');
});

test('captures Capability 09 screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await resetScenario(page);

  await openMonitoringContext(page, 'lot-sd-507');
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  const qualitySection = dialog.locator('section[aria-label="Qualidade"]');
  await qualitySection.getByRole('button', { name: 'Registrar qualidade' }).click();
  await qualitySection.getByLabel('Peças boas na DC01').fill('13');
  await qualitySection.getByLabel('Peças rejeitadas na DC01').fill('2');
  await qualitySection.getByLabel('Motivo da rejeição na DC01').selectOption('PROCESS_DEFECT');
  await page.setViewportSize({ width: 1440, height: 1400 }); // the Context Modal's Qualidade block is tall — a normal 900px viewport clips the Confirmar button behind the modal's own scroll
  await expect(page).toHaveScreenshot('CAP-09-QUALITY-CONFIRMATION-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await qualitySection.getByRole('button', { name: 'Confirmar' }).click();
  await expect(qualitySection).toContainText('Pendente0');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  await page.goto('/demo/fundicao-dc/production-quality');
  const machines = page.getByRole('region', { name: 'Situação das Máquinas' });
  await expect(machines.getByRole('button', { name: /DC01/ })).toContainText('61 boas');
  await expect(page).toHaveScreenshot('CAP-09-QUALITY-IMPACT-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await page.goto('/demo/fundicao-dc/oee');
  await expect(page.getByRole('heading', { name: 'Como estamos performando e por quê?' })).toBeVisible();
  await expect(page).toHaveScreenshot('CAP-09-OEE-QUALITY-IMPACT-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('has no automatically detectable accessibility violations and no forbidden red while operating Registrar qualidade', async ({ page }) => {
  const AxeBuilder = (await import('@axe-core/playwright')).default;
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openMonitoringContext(page, 'lot-sd-507');
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  const qualitySection = dialog.locator('section[aria-label="Qualidade"]');
  await qualitySection.getByRole('button', { name: 'Registrar qualidade' }).click();
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

test('keyboard: Registrar qualidade form is reachable and dismissible without a mouse', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openMonitoringContext(page, 'lot-sd-507');
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });
  const qualitySection = dialog.locator('section[aria-label="Qualidade"]');
  await qualitySection.getByRole('button', { name: 'Registrar qualidade' }).click();
  await expect(qualitySection.getByLabel('Peças boas na DC01')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});
