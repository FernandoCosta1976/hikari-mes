import { expect, test } from './fixtures';

/**
 * HIKARI MES — reference operational day 2026-07-10, Scenario Clock 09:15.
 * Product Gate screenshot set: one full-page capture per governed screen,
 * plus the three Avaliar Cenário what-if scenes, all against the SAME
 * reference Scenario store (Section 14 — single source of operational truth).
 */

test('captures REFERENCE-0915-PLAN', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await expect(page.getByRole('heading', { name: 'O que precisamos produzir?' })).toBeVisible();
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await expect(page).toHaveScreenshot('REFERENCE-0915-PLAN-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures REFERENCE-0915-CYCLE-TIME-VARIATION — different Cycle Times produce genuinely different block widths', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  // DC01 alone carries both the shortest blocks (5LX-E5421-X0/1B2-E5411-W0, 50pc · 33-43min) and the
  // longest (1ST-E5421-W0, 100pc · 97min) — real, different Cycle Times, never a fixed block duration.
  await expect(page.getByText('5LX-E5421-X0').first()).toBeVisible();
  await expect(page.getByText('1ST-E5421-W0').first()).toBeVisible();
  await expect(page).toHaveScreenshot('REFERENCE-0915-CYCLE-TIME-VARIATION-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures REFERENCE-0915-MONITORING', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await expect(page.getByRole('heading', { name: 'O que está acontecendo em relação ao plano?' })).toBeVisible();
  await expect(page).toHaveScreenshot('REFERENCE-0915-MONITORING-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures REFERENCE-0915-ADHERENCE', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-adherence');
  await expect(page.getByRole('heading', { name: 'Estamos executando conforme o planejado?' })).toBeVisible();
  await expect(page).toHaveScreenshot('REFERENCE-0915-ADHERENCE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures REFERENCE-0915-QUALITY-PERFORMANCE', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-quality');
  await expect(page.getByRole('heading', { name: 'Do que produzimos, quanto está conforme e quanto perdemos por qualidade?' })).toBeVisible();
  await expect(page).toHaveScreenshot('REFERENCE-0915-QUALITY-PERFORMANCE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures REFERENCE-0915-OEE', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/oee');
  await expect(page.getByRole('heading', { name: 'Como estamos performando e por quê?' })).toBeVisible();
  await expect(page).toHaveScreenshot('REFERENCE-0915-OEE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures REFERENCE-0915-STRATEGIC', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/strategic');
  await expect(page.getByRole('heading', { name: 'Como está a saúde da Fundição DC?' })).toBeVisible();
  await expect(page).toHaveScreenshot('REFERENCE-0915-STRATEGIC-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures SCENARIO-SAME-MACHINE-0915 — moving lot-sd-508 after lot-sd-509 on its own Resource', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-sd-508"]').click();
  const simulation = page.getByRole('region', { name: 'Avaliação de cenário' });
  await simulation.getByRole('button', { name: /^DC01/ }).click();
  await simulation.getByRole('button', { name: /Depois de Lote 509/ }).click();
  await expect(simulation).toContainText('CENÁRIO SIMULADO — NÃO APLICADO');
  await expect(page).toHaveScreenshot('SCENARIO-SAME-MACHINE-0915-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures SCENARIO-CROSS-MACHINE-0915 — moving lot-sd-508 onto DC03 after lot-sd-514', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-sd-508"]').click();
  const simulation = page.getByRole('region', { name: 'Avaliação de cenário' });
  await simulation.getByRole('button', { name: /^DC03/ }).click();
  await simulation.getByRole('button', { name: /Depois de Lote 514/ }).click();
  await expect(simulation).toContainText('DestinoDC03');
  await expect(page).toHaveScreenshot('SCENARIO-CROSS-MACHINE-0915-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures SCENARIO-CASCADE-IMPACT-0915 — the full impact summary panel for a cross-machine move', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-sd-508"]').click();
  const simulation = page.getByRole('region', { name: 'Avaliação de cenário' });
  await simulation.getByRole('button', { name: /^DC03/ }).click();
  await simulation.getByRole('button', { name: /Depois de Lote 514/ }).click();
  const impactPanel = page.getByText('Cenário simuladoLote', { exact: false }).first();
  await expect(impactPanel).toContainText('Requirements impactados');
  await expect(impactPanel).toContainText('Δ Setups');
  await expect(impactPanel).toHaveScreenshot('SCENARIO-CASCADE-IMPACT-0915-CANDIDATE.png', { animations: 'disabled' });
});
