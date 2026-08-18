import { expect, test } from './fixtures';

/**
 * PERSISTENT EXECUTIVE STORY — proves a single operational decision made on
 * Lote 270 (Preparação → Reprogramação DC01→DC04 → Liberação manual →
 * Execução) survives a full browser reload and is visible, consistently,
 * across every downstream perspective all the way to Visão Estratégica.
 */
test('a decision on Lote 270 survives reload and reaches every downstream perspective', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1-3. Order Workspace baseline.
  await page.goto('/demo/fundicao-dc-legacy/orders/lot-270');
  const heroFacts = page.locator('dl').filter({ hasText: 'Material' });
  await expect(heroFacts).toContainText('Em preparação');
  await expect(heroFacts).toContainText('Não liberada');
  await expect(heroFacts).toContainText('DC01');

  // 4. Preparação concluída.
  await page.getByRole('button', { name: 'Marcar preparação como concluída' }).click();
  await expect(heroFacts).toContainText('Preparada');

  // 5. Reprogramação DC01 → DC04.
  await page.getByRole('button', { name: 'Alterar programação' }).click();
  const reprogram = page.getByRole('region', { name: 'Alterar programação' });
  await reprogram.getByRole('button', { name: /DC04/ }).click();
  await reprogram.getByRole('button', { name: 'Confirmar nova programação' }).click();
  await expect(heroFacts).toContainText('DC04');
  await expect(heroFacts).toContainText('Programado originalmente: DC01');

  // 6. Liberação manual.
  await page.getByRole('button', { name: 'Liberar para produção' }).click();
  const releasePanel = page.getByRole('region', { name: 'Confirmar liberação' });
  await releasePanel.getByRole('button', { name: 'Confirmar liberação' }).click();
  await expect(heroFacts).toContainText('Liberada manualmente');

  // 7-8. Reload — decisions must survive.
  await page.reload();
  await expect(heroFacts).toContainText('Preparada');
  await expect(heroFacts).toContainText('DC04');
  await expect(heroFacts).toContainText('Programado originalmente: DC01');
  await expect(heroFacts).toContainText('Liberada manualmente');

  // 9. Iniciar produção — must start on DC04.
  await page.getByRole('button', { name: 'Iniciar produção' }).click();
  await expect(page.getByRole('region', { name: 'Próxima decisão' })).toContainText('Em produção');

  // 11. Execução must show Lote 270 under DC04, not the original Lote 268. Manual quantity entry is a
  // Capability 06 (Registrar Produção) concern, out of scope for Capability 05 — produced quantity is no
  // longer editable here, only the Resource reassignment fact is exercised.
  await page.goto('/demo/fundicao-dc-legacy/production-execution');
  const dc04Card = page.locator('article').filter({ has: page.getByText('DC04', { exact: true }) });
  await expect(dc04Card).toContainText('Lote atualLote 270');

  // 12. Reload — execution facts (Resource) survive.
  await page.reload();
  const dc04CardAfterReload = page.locator('article').filter({ has: page.getByText('DC04', { exact: true }) });
  await expect(dc04CardAfterReload).toContainText('Lote 270');

  // 13. Acompanhamento is now a bounded demonstrative capability for the
  // reference 2026-07-10/17:23 scenario (see the HIKARI 10/07 round) — it no
  // longer reads live execution facts from the shared scenario store, so
  // this persistence chain no longer flows through it. Verified separately
  // in production-monitoring.spec.ts.

  // 14. Aderência preserves Programado (DC01) vs Operacional (DC04) — Lote 270 now tracked on DC04.
  await page.goto('/demo/fundicao-dc-legacy/production-adherence');
  await expect(page.getByRole('region', { name: 'Situação das Máquinas' })).toContainText('270');

  // 15. Qualidade references the same Lot/Resource.
  await page.goto('/demo/fundicao-dc-legacy/production-quality');
  await expect(page.getByRole('region', { name: 'Situação das Máquinas' })).toContainText('270');

  // 16. OEE is recalculated from the same facts (DC04 row still present, no fixed "oee: 70" placeholder).
  await page.goto('/demo/fundicao-dc-legacy/oee');
  await expect(page.getByRole('region', { name: 'Situação das Máquinas' })).toContainText('DC04');

  // 17. Visão Estratégica consumes the same selectors — same consolidated reality.
  await page.goto('/demo/fundicao-dc-legacy/strategic');
  await expect(page.getByRole('heading', { name: 'Como está a saúde da Fundição DC?' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Situação das Máquinas' })).toContainText('DC04');
});
