import { expect, test } from './fixtures';

/**
 * HIKARI MES — Unified Operational Timeline (Plano Original × Plano
 * Atualizado × Realizado × Projetado). Reference 2026-07-10, Scenario Clock
 * 09:15. Product Gate screenshot set proving the SAME
 * `computeOperationalTimeline` projection is visible, consistently, from
 * Plano, Preparação, Acompanhamento and Aderência.
 */

test('captures TIMELINE-UNIFIED-PLAN — a replanned future Requirement renders at its Plano Atualizado slot, with the Plano Original kept as a faint outline', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  const replanned = page.locator('[data-lot-id="lot-sd-522"]');
  await expect(replanned).toHaveAttribute('data-replanned', 'true');
  await replanned.scrollIntoViewIfNeeded();
  await expect(page).toHaveScreenshot('TIMELINE-UNIFIED-PLAN-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures TIMELINE-UNIFIED-READINESS — Preparação analyzes the Requirement at its Plano Atualizado position, the SAME projection Plano reads', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-readiness?lotId=lot-sd-522');
  const timeline = page.locator('[data-testid="readiness-timeline-scroller"]');
  await expect(timeline).toBeVisible();
  const replanned = page.locator('[data-lot-id="lot-sd-522"]');
  await expect(replanned).toHaveAttribute('data-replanned', 'true');
  await expect(page).toHaveScreenshot('TIMELINE-UNIFIED-READINESS-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures TIMELINE-UNIFIED-MONITORING — Quadro Hora-Hora shows Planejado/Realizado/Projetado, with cascading risk now honestly visible on future Requirements', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-monitoring');
  const endOfDay = page.getByRole('region', { name: 'Projeção de fechamento do dia' });
  await endOfDay.scrollIntoViewIfNeeded();
  await expect(page).toHaveScreenshot('TIMELINE-UNIFIED-MONITORING-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures TIMELINE-UNIFIED-ADHERENCE — Planejado × Realizado now shows every due Requirement per Resource, not only the current one, from the SAME projection', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-adherence');
  await page.getByText('Planejado × Realizado').click();
  const timeline = page.getByTestId('adherence-timeline');
  await expect(timeline).toContainText('7 requirement(s) hoje');
  await timeline.scrollIntoViewIfNeeded();
  await expect(page).toHaveScreenshot('TIMELINE-UNIFIED-ADHERENCE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures TIMELINE-REPLANNING-CASCADE — a delay on DC05 propagates through its whole tail (lot-sd-521 running late -> lot-sd-522 -> lot-sd-523, growing impact)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  const first = page.locator('[data-lot-id="lot-sd-522"]');
  const second = page.locator('[data-lot-id="lot-sd-523"]');
  await expect(first).toHaveAttribute('data-replanned', 'true');
  await expect(second).toHaveAttribute('data-replanned', 'true');
  const firstTitle = await first.getAttribute('title');
  const secondTitle = await second.getAttribute('title');
  expect(firstTitle).toContain('Impacto');
  expect(secondTitle).toContain('Impacto');
  await first.scrollIntoViewIfNeeded();
  await expect(page).toHaveScreenshot('TIMELINE-REPLANNING-CASCADE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures TIMELINE-EARLY-ONTIME-LATE — real requirements showing Início/Término antes, no horário and depois side by side', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-adherence');
  await page.getByText('Planejado × Realizado').click();
  const timeline = page.getByTestId('adherence-timeline');
  await expect(timeline).toBeVisible();
  const machines = page.getByRole('region', { name: 'Situação das Máquinas' });
  await expect(machines).toBeVisible();
  await expect(page).toHaveScreenshot('TIMELINE-EARLY-ONTIME-LATE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});
