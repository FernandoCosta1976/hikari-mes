import { expect, test } from './fixtures';

/**
 * HIKARI MES — Final Demo Journey (Executive Demo Freeze, Section 49).
 * Reference 2026-07-10, Scenario Clock 09:15, Turno 1, scenario
 * `fundicao-dc`. A single smoke test proving the full narrative — every
 * screen a director walks through in the live demo — works end to end on
 * the frozen scenario. This is NOT meant to be a deep regression suite (each
 * step already has its own dedicated Capability spec); it only proves no
 * step in the story is broken.
 */

function openMonitoringContext(page: import('@playwright/test').Page, lotId: string) {
  return page.locator(`[data-lot-id="${lotId}"]`).first().click();
}

async function resetScenario(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Reiniciar cenário' }).click();
  await page.getByRole('alertdialog', { name: 'Reiniciar cenário demonstrativo?' }).getByRole('button', { name: 'Reiniciar cenário' }).click();
}

test('Final Demo Journey: Reset → Home → Plano → Avaliar Cenário → Preparação → Liberação → Acompanhamento → Execução/Produção/Evento/Qualidade → Aderência → Qualidade & Desempenho → OEE → Visão Estratégica (Section 49)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  // Home
  await page.goto('/demo/fundicao-dc');
  await expect(page.getByRole('heading', { name: 'PROGRAMA HIKARI' })).toBeVisible();
  await page.getByRole('button', { name: 'Reiniciar demonstração' }).click();

  // Plano
  await page.getByRole('link', { name: /Iniciar demonstração/ }).first().click();
  await expect(page.getByRole('heading', { name: 'O que precisamos produzir?' })).toBeVisible();
  await page.locator('[data-testid="timeline-scroller"]').evaluate((element) => { element.scrollLeft = 0; });

  // Avaliar Cenário — a discardable what-if, never applied to the real Plano
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-sd-508"]').click();
  const simulation = page.getByRole('region', { name: 'Avaliação de cenário' });
  await expect(simulation).toBeVisible();
  await page.getByRole('button', { name: 'Encerrar avaliação' }).click();
  await expect(page.getByRole('button', { name: /Avaliar cenário/ })).toBeVisible();

  // Liberação — lot-sd-514 (DC03, not yet released at 09:15) via the Plano Lot Context Modal
  await page.locator('[data-lot-id="lot-sd-514"]').click();
  const planoModal = page.getByRole('dialog', { name: 'Lote 514' });
  await expect(planoModal).toBeVisible();
  await planoModal.getByRole('button', { name: 'Liberação' }).click();
  await planoModal.getByRole('button', { name: 'Liberar para produção' }).click();
  await expect(planoModal).toContainText('LIBERADO');
  await planoModal.getByRole('button', { name: 'Fechar contexto do Lote' }).click();

  // Preparação
  await page.goto('/demo/fundicao-dc/production-readiness');
  await expect(page.getByRole('heading', { name: 'Temos condições de produzir?' })).toBeVisible();

  // Acompanhamento → Execução → Registrar Produção → Evento → Qualidade
  await page.goto('/demo/fundicao-dc/production-monitoring');
  await expect(page.getByRole('heading', { name: 'O que está acontecendo em relação ao plano?' })).toBeVisible();
  await openMonitoringContext(page, 'lot-sd-514');
  const dialog = page.getByRole('dialog', { name: '1S4-E5411-W0' });
  await dialog.getByRole('button', { name: 'Iniciar produção' }).click();
  await expect(dialog).toContainText('SituaçãoEm execução');

  await dialog.getByRole('button', { name: 'Registrar produção' }).click();
  await dialog.getByLabel(/Quantidade produzida na/).fill('40');
  await dialog.getByRole('button', { name: 'Confirmar apontamento' }).click();
  await expect(dialog).toContainText('Produzido40');

  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await dialog.getByLabel(/Motivo da parada na/).selectOption('TOOLING');
  await dialog.getByRole('button', { name: 'Registrar parada' }).click();
  await expect(dialog).toContainText('SituaçãoPausado');
  await dialog.getByRole('button', { name: 'Retomar produção' }).click();
  await expect(dialog).toContainText('SituaçãoEm execução');

  const qualitySection = dialog.locator('section[aria-label="Qualidade"]');
  await expect(qualitySection).toContainText('Produção confirmada40');
  await qualitySection.getByRole('button', { name: 'Registrar qualidade' }).click();
  await qualitySection.getByLabel(/Peças boas na/).fill('38');
  await qualitySection.getByLabel(/Peças rejeitadas na/).fill('2');
  await qualitySection.getByLabel(/Motivo da rejeição na/).selectOption('PROCESS_DEFECT');
  await qualitySection.getByRole('button', { name: 'Confirmar' }).click();
  await expect(qualitySection).toContainText('Classificado40');
  await dialog.getByRole('button', { name: 'Fechar contexto de acompanhamento' }).click();

  await page.goto('/demo/fundicao-dc/production-execution');
  await expect(page.getByRole('heading', { name: 'O que está sendo executado agora?' })).toBeVisible();

  // Aderência
  await page.goto('/demo/fundicao-dc/production-adherence');
  await expect(page.getByRole('heading', { name: 'Estamos executando conforme o planejado?' })).toBeVisible();

  // Qualidade & Desempenho
  await page.goto('/demo/fundicao-dc/production-quality');
  await expect(page.getByRole('heading', { name: 'Do que produzimos, quanto está conforme e quanto perdemos por qualidade?' })).toBeVisible();

  // OEE
  await page.goto('/demo/fundicao-dc/oee');
  await expect(page.getByRole('heading', { name: 'Como estamos performando e por quê?' })).toBeVisible();
  await expect(page).toHaveScreenshot('FINAL-DEMO-OEE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  // Visão Estratégica
  await page.goto('/demo/fundicao-dc/strategic');
  await expect(page.getByRole('heading', { name: 'Como está a saúde da Fundição DC?' })).toBeVisible();
  await expect(page).toHaveScreenshot('FINAL-DEMO-STRATEGIC-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  // Reset restores the exact 09:15 baseline everywhere
  await resetScenario(page);
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.locator('[data-lot-id="lot-sd-514"]').click();
  const restoredModal = page.getByRole('dialog', { name: 'Lote 514' });
  await restoredModal.getByRole('button', { name: 'Liberação' }).click();
  await expect(restoredModal).toContainText('PRONTO PARA LIBERAR');
});
