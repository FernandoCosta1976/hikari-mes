import { expect, test } from '@playwright/test';

async function freezeClockAt(page: import('@playwright/test').Page, iso: string) {
  await page.addInitScript((value) => { (window as unknown as { __HIKARI_CLOCK_FIXED_AT__?: string }).__HIKARI_CLOCK_FIXED_AT__ = value; }, iso);
}

test('derives Current Shift from Current Time instead of a hard-coded Turno 2', async ({ page }) => {
  await freezeClockAt(page, '2025-05-15T09:10:00-03:00');
  await page.goto('/demo/fundicao-dc-legacy/oee');
  await expect(page.getByRole('region', { name: 'OEE do Turno 1 e acumulado do dia' })).toContainText('TURNO 1 · EM ANDAMENTO');
});

test('shows Turno 3 in progress overnight, with no completed Turno listed yet', async ({ page }) => {
  await freezeClockAt(page, '2025-05-15T02:00:00-03:00');
  await page.goto('/demo/fundicao-dc-legacy/oee');
  await expect(page.getByRole('region', { name: 'OEE do Turno 3 e acumulado do dia' })).toContainText('TURNO 3 · EM ANDAMENTO');
  const history = page.getByRole('region', { name: 'Turnos concluídos hoje' });
  await expect(history).not.toContainText('Turno 1');
  await expect(history).not.toContainText('Turno 2');
});
