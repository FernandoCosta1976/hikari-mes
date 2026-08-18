import { expect, test } from './fixtures';

/**
 * Candidatos de revisão para o cenário oficial `fundicao-dc` — dataset
 * canônico derivado de LINHA C OFC × FUNDIÇÃO × máquina titular e reserva
 * (ver docs/prototype/source-data/business-validation/foundry). Promovido a
 * baseline demonstrativo oficial da Fundição DC — ver ADR-002. O cenário
 * sintético anterior (Material A/B/C) é preservado só como fixture de teste
 * em `fundicao-dc-legacy` (ver e2e/wf001-production-scheduling.spec.ts etc.).
 *
 * BUSINESS DATE: 2026-07-10 · SCENARIO CLOCK: 09:15 (lot-sd-501..523).
 */

test('captures the source-derived Plano Hora-Hora with real component codes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await expect(page.getByRole('heading', { name: 'O que precisamos produzir?' })).toBeVisible();
  await expect(page.getByText('44C-E5421-W0').first()).toBeVisible();
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await expect(page).toHaveScreenshot('WF-001-SOURCE-DERIVED-FOUNDRY-PLAN-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures the Lot Context modal with LINHA C traceability and real component code', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-lot-id="lot-sd-501"]').click();
  const modal = page.getByRole('dialog', { name: 'Lote 501' });
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Lote Linha C');
  await expect(modal).toContainText('3');
  await expect(modal).toContainText('BSRP00030A');
  await expect(page).toHaveScreenshot('WF-001-REAL-COMPONENT-LOT-CONTEXT-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures Primary/Reserve machine roles for a component with a confirmed reserve', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.locator('[data-lot-id="lot-sd-502"]').click();
  const modal = page.getByRole('dialog', { name: 'Lote 502' });
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Máquina titular');
  await expect(modal).toContainText('DC01');
  await expect(modal).toContainText('Reserva(s)');
  await expect(modal).toContainText('DC03');
  await expect(page).toHaveScreenshot('WF-001-PRIMARY-RESERVE-RESOURCES-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures source-derived Preparação flagging the component with no confirmed reserve', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-readiness');
  await expect(page.getByRole('heading', { name: 'Temos condições de produzir?' })).toBeVisible();
  await expect(page.getByText('1ST-E1310-W0').first()).toBeVisible();
  await expect(page.getByText('Atenção').first()).toBeVisible();
  await expect(page).toHaveScreenshot('WF-002-SOURCE-DERIVED-READINESS-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

/**
 * Capability 04 — Liberar Produção, on the canonical dataset. Ready → Released
 * is exercised end to end; Attention shows the explicit "Revisar condições"
 * action (Section 7). The canonical dataset has no naturally BLOCKED Lot (every
 * scheduled Lot is, by construction, a RESOLVED requirement) — the Blocked
 * scene (CAP-04-BLOCKED-FOR-RELEASE-CANDIDATE) is covered on the legacy
 * scenario in wf001-production-scheduling.spec.ts, which does have one.
 */
test('Capability 04 — Ready For Release → Released, deterministic and traceable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.locator('[data-lot-id="lot-sd-508"]').click(); // NOT_STARTED at 09:15, READY readiness — not pre-released
  const modal = page.getByRole('dialog', { name: 'Lote 508' });
  await modal.getByRole('button', { name: 'Liberação' }).click();
  await expect(modal).toContainText('PRONTO PARA LIBERAR');
  await expect(modal).toContainText('Máquina titular');
  await expect(page).toHaveScreenshot('CAP-04-READY-FOR-RELEASE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await modal.getByRole('button', { name: 'Liberar para produção' }).click();
  await expect(modal).toContainText('LIBERADO');
  await expect(modal).toContainText('Supervisor da Fundição · demonstrativo');
  await expect(modal).toContainText('10/07/2026, 09:15');
  await expect(page).toHaveScreenshot('CAP-04-RELEASED-LOT-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await modal.getByRole('button', { name: 'Fechar contexto do Lote' }).click();
  await expect(page.locator('[data-lot-id="lot-sd-508"]')).toContainText('Liberado');
});

test('Capability 04 — Attention Lot shows the dominant reason and an explicit "Revisar condições" action', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.locator('[data-lot-id="lot-sd-522"]').click(); // NOT_STARTED, ATTENTION readiness (1ST-E1310-W0 · Cilindro, no confirmed Reserve) — not pre-released
  const modal = page.getByRole('dialog', { name: 'Lote 522' });
  await modal.getByRole('button', { name: 'Liberação' }).click();
  await expect(modal).toContainText('REQUER REVISÃO');
  await expect(modal).toContainText('Existem condições que exigem avaliação antes da liberação.');
  await expect(modal.getByRole('button', { name: 'Liberar para produção' })).toHaveCount(0);
  await expect(page).toHaveScreenshot('CAP-04-RELEASE-ATTENTION-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await modal.getByRole('button', { name: 'Revisar condições' }).click();
  await expect(modal.getByRole('button', { name: 'Preparação', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(modal).toContainText('Disponibilidade no intervalo');
});

/** Preparação queue must surface a discrete Release signal — Section 14. */
test('Capability 04 — Preparação queue flags the released Lot without becoming an execution queue', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.locator('[data-lot-id="lot-sd-508"]').click();
  const modal = page.getByRole('dialog', { name: 'Lote 508' });
  await modal.getByRole('button', { name: 'Liberação' }).click();
  await modal.getByRole('button', { name: 'Liberar para produção' }).click();
  await modal.getByRole('button', { name: 'Fechar contexto do Lote' }).click();

  await page.goto('/demo/fundicao-dc/production-readiness');
  await page.getByText(/Prontos \(\d+\)/).click();
  await expect(page.getByRole('button', { name: /Lote 508/ })).toContainText('Liberado');
});

/**
 * Product Review gate — real component codes must be perceptually dominant
 * in the Plano Hora-Hora without any interaction (no modal, no hover, no
 * docs). "Technical pass != Product pass": the dataset was already
 * source-derived; this asserts the *visual materialization* of that data.
 */
test('Product Gate — real component codes are dominant in the Plano Hora-Hora with zero interaction', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await expect(page.getByRole('heading', { name: 'O que precisamos produzir?' })).toBeVisible();
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });

  // At least 3 genuinely resolved LINHA C piece codes visible in the timeline viewport, no interaction.
  await expect(page.getByText('44C-E5421-W0').first()).toBeVisible();
  await expect(page.getByText('1ST-E5111-W0').first()).toBeVisible();
  await expect(page.getByText('1B2-E5411-W0').first()).toBeVisible();
  await expect(page.getByText('1ST-E1310-W0').first()).toBeVisible();

  // Each visible block carries piece code + family + quantity + Lote Linha C — never only the internal MES lot number.
  const firstBlock = page.locator('[data-lot-id="lot-sd-501"]');
  await expect(firstBlock).toContainText('5LX-E5421-X0');
  await expect(firstBlock).toContainText('Tampa Direita · 50 peças');
  await expect(firstBlock).toContainText('Lote Linha C 3');

  // The legacy synthetic dataset must have zero visual occurrence in the official scenario.
  await expect(page.getByText('Material A', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Material B', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Material C', { exact: true })).toHaveCount(0);

  await expect(page).toHaveScreenshot('WF-001-REAL-COMPONENTS-VISIBLE-PRODUCT-GATE.png', { fullPage: true, animations: 'disabled' });
});

test('Product Gate — Lot Context modal surfaces Peça/Família/Quantidade/Origem/Recursos on the first fold', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });
  await page.locator('[data-lot-id="lot-sd-502"]').click();
  const modal = page.getByRole('dialog', { name: 'Lote 502' });
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Peça');
  await expect(modal).toContainText('1B2-E5411-W0');
  await expect(modal).toContainText('Família');
  await expect(modal).toContainText('Tampa Esquerda');
  await expect(modal).toContainText('Quantidade');
  await expect(modal).toContainText('Lote Linha C');
  await expect(modal).toContainText('Máquina titular');
  await expect(modal).toContainText('Reserva(s)');
  await expect(page).toHaveScreenshot('WF-001-REAL-COMPONENT-MODAL-PRODUCT-GATE.png', { fullPage: true, animations: 'disabled' });
});

test('has no automatically detectable accessibility violations and no forbidden red', async ({ page }) => {
  const AxeBuilder = (await import('@axe-core/playwright')).default;
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await expect(page.getByRole('heading', { name: 'O que precisamos produzir?' })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const redUsages = await page.locator('body *').evaluateAll((elements) => {
    const forbidden = new Set(['rgb(255, 0, 0)', 'rgb(220, 38, 38)', 'rgb(239, 68, 68)']);
    return elements.flatMap((element) => { const style = getComputedStyle(element); return [style.color, style.backgroundColor, style.borderColor].filter((value) => forbidden.has(value)); });
  });
  expect(redUsages).toEqual([]);
});
