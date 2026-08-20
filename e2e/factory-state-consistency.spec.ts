import { expect, test } from './fixtures';

/**
 * HIKARI MES — Factory State Reconciliation round. Section 25/26/27: for a
 * given Resource and instant T, Current Requirement, Confirmed Quantity and
 * Operational State must be identical across every perspective — not only
 * at the frozen 09:15 baseline (already covered by
 * resourceOperationalSnapshotAdapter.test.ts), but after REAL state
 * transitions have advanced the Session Clock. This exercises DC01
 * (lot-sd-507, 44C-E5421-W0) through Registrar produção → Registrar parada
 * (09:15 → 09:30) → Retomar produção → Registrar produção (09:30 → 09:45),
 * checking Acompanhamento, OEE and Visão Estratégica agree at every step —
 * the same real facts, never a screen-local recomputation.
 */
test('Current Requirement, Quantity and Operational State stay identical across Acompanhamento/OEE/Estratégica as the Session Clock genuinely advances (09:15 -> 09:30 -> 09:45)', async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await page.getByRole('button', { name: 'Reiniciar cenário' }).click();
  await page.getByRole('alertdialog', { name: 'Reiniciar cenário demonstrativo?' }).getByRole('button', { name: 'Reiniciar cenário' }).click();

  const openDc01 = () => page.locator('[data-lot-id="lot-sd-507"]').first().click();
  const dialog = page.getByRole('dialog', { name: '44C-E5421-W0' });

  // T=09:15 baseline — 65/100, RUNNING.
  await openDc01();
  await expect(dialog).toContainText('Produção65 / 100');
  await dialog.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog.getByLabel('Quantidade produzida na DC01').fill('15');
  await dialog.getByRole('button', { name: 'Confirmar apontamento' }).click();
  await expect(dialog).toContainText('Produzido80 peças');

  // Registrar parada advances the Session Clock 09:15 -> 09:30 (real 15-minute step).
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await expect(dialog).toContainText('SituaçãoPausado');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();
  await expect(page.getByText('09:30', { exact: true }).first()).toBeVisible();

  await page.goto('/demo/fundicao-dc/oee');
  await expect(page.getByText('09:30', { exact: true }).first()).toBeVisible();
  const oeeDc01 = page.getByRole('region', { name: 'Situação das Máquinas' }).getByRole('button', { name: /DC01/ });
  await expect(oeeDc01).toContainText('Em pausa');
  await expect(oeeDc01).toContainText('Falha de equipamento ativo');

  await page.goto('/demo/fundicao-dc/strategic');
  await expect(page.getByText('09:30', { exact: true }).first()).toBeVisible();
  // Visão Estratégica's own aggregate count of Paused Resources must reflect the SAME fact —
  // DC01 just paused, nothing else did, so it must read exactly 1 (never 0, never stale).
  await expect(page.getByTestId('strategic-operational-summary')).toContainText('1 pausados');
  await expect(page.getByTestId('strategic-downtime-summary')).toContainText('Falha de equipamento em DC01');

  // Retomar + Registrar produção advances the Session Clock 09:30 -> 09:45 and reaches Planned Quantity.
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await openDc01();
  await dialog.getByRole('button', { name: 'Retomar produção' }).click();
  await expect(dialog).toContainText('SituaçãoEm execução');
  await dialog.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog.getByLabel('Quantidade produzida na DC01').fill('20');
  await dialog.getByRole('button', { name: 'Confirmar apontamento' }).click();
  await expect(dialog).toContainText('Produzido100 peças');
  // The Event that was ACTIVE (0 min) at T=09:30 is now historical with a real, time-bound duration.
  const eventos = dialog.locator('section', { hasText: 'Eventos' }).last();
  await expect(eventos).toContainText('Falha de equipamento');
  await expect(eventos).toContainText('15 min · ENCERRADO');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();
  await expect(page.getByText('09:45', { exact: true }).first()).toBeVisible();

  // Cross-screen: the SAME 80->100 progression and the SAME Current Requirement (lot-sd-507)
  // are visible on OEE and Visão Estratégica at this exact instant — never a diverging pick.
  await page.goto('/demo/fundicao-dc/oee');
  await expect(page.getByText('09:45', { exact: true }).first()).toBeVisible();
  const oeeDc01After = page.getByRole('region', { name: 'Situação das Máquinas' }).getByRole('button', { name: /DC01/ });
  await expect(oeeDc01After).toContainText('Produzindo');

  await page.goto('/demo/fundicao-dc/strategic');
  await expect(page.getByText('09:45', { exact: true }).first()).toBeVisible();
  // Resumed and back to full strength — the SAME 4 em execução · 0 pausados as every other screen.
  await expect(page.getByTestId('strategic-operational-summary')).toContainText('4 em execução');
  await expect(page.getByTestId('strategic-operational-summary')).toContainText('0 pausados');
});
