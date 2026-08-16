import { expect, test } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await expect(page.getByRole('heading', { name: 'O que precisamos produzir?' })).toBeVisible();
});

test('completes the governed WF-001 interaction narrative', async ({ page }) => {
  await expect(page.getByRole('banner')).toHaveCount(0);
  const applicationContext = page.getByRole('region', { name: 'Contexto da aplicação' });
  await expect(applicationContext).toContainText('Fundição DC');
  await expect(applicationContext).toContainText('Demonstrativo');
  await expect(page.getByRole('complementary', { name: 'Operational Workspace' })).toContainText('HIKARI');
  await expect(page.getByRole('complementary', { name: 'Operational Workspace' })).toContainText('Produção');
  await expect(page.locator('main .workspaceLayout, main [data-sidebar-expanded]').first().locator('h1')).toHaveText('O que precisamos produzir?');
  const menuButton = page.getByRole('button', { name: 'Recolher sidebar' });
  await expect(page.getByRole('complementary', { name: 'Operational Workspace' })).toBeVisible();
  await menuButton.click();
  const expandButton = page.getByRole('button', { name: 'Expandir sidebar' });
  await expect(expandButton).toHaveAttribute('aria-expanded', 'false');
  await expandButton.click();
  await page.keyboard.press('Escape');
  await expect(expandButton).toBeFocused();
  await expandButton.click();
  await expect(page.getByRole('heading', { name: 'Plano Hora-Hora' })).toBeVisible();
  await expect(page.getByText('Requisito recebido — Balancing')).toBeVisible();
  for (const resource of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) await expect(page.getByRole('region', { name: `Máquina programada ${resource}` })).toBeVisible();
  await expect(page.getByText('Horário de referência do cenário: 17:23')).toBeAttached();
  await expect(page.getByTestId('current-time-marker')).toHaveCSS('left', /.+/);
  await expect(page.getByText(/Em execução/i)).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Agora na Fundição' })).toHaveCount(0);
  await expect(page.getByText('Versão demonstrativa 08').first()).toBeVisible();
  await expect(page.getByTestId('planned-break')).toHaveCount(9);
  await expect(page.getByTestId('scheduled-setup')).toHaveCount(5);
  const timeline = page.getByTestId('timeline-scroller');
  await expect.poll(async () => timeline.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  const markerRatio = await page.evaluate(() => {
    const scroller = document.querySelector<HTMLElement>('[data-testid="timeline-scroller"]')!;
    const marker = document.querySelector<HTMLElement>('[data-testid="current-time-marker"]')!;
    const temporalLeft = scroller.getBoundingClientRect().left + 132;
    return (marker.getBoundingClientRect().left - temporalLeft) / (scroller.clientWidth - 132);
  });
  expect(markerRatio).toBeCloseTo(0.1, 1);
  await page.getByRole('button', { name: /Lote 265, Material A, 100 peças/ }).click();
  const detail = page.getByRole('dialog', { name: 'Lote 265' });
  await expect(detail).toBeVisible();
  await detail.getByRole('button', { name: 'Recursos' }).click();
  await expect(detail).toContainText('Resumo de Recursos por condição');
  await expect(detail).toContainText('Requer atenção');
  await expect(detail).toContainText('DC03');
  await expect(detail).toContainText('DC05');
  await expect(detail.getByText('DC01', { exact: true }).first()).toBeVisible();
  await expect(detail).toContainText('Turno 2');
  await expect(detail.getByRole('button', { name: 'Analisar preparação' })).toBeVisible();
  await detail.getByRole('button', { name: 'Fechar contexto do Lote' }).click();
  await expect(detail).not.toBeVisible();

  await page.getByRole('button', { name: /Lote 266, Material B, 100 peças/ }).click();
  const materialBDetail = page.getByRole('dialog', { name: 'Lote 266' });
  await materialBDetail.getByRole('button', { name: 'Recursos' }).click();
  await expect(materialBDetail).toContainText('DC02');
  await expect(materialBDetail).toContainText('DC05');
  await expect(materialBDetail.getByText('DC03', { exact: true }).first()).toBeVisible();
  await expect(materialBDetail.getByRole('button', { name: 'Analisar preparação' })).toBeVisible();
  await materialBDetail.getByRole('button', { name: 'Fechar contexto do Lote' }).click();

  await page.locator('#production-order-correlation summary').click();
  await expect(page.getByText(/Lote 251 \+ Lote 252.*= 760 peças/)).toBeVisible();
  await page.locator('#buffer-coverage summary').click();
  await expect(page.getByText('Após o plano').first()).toBeVisible();
  await page.locator('#schedule-revision summary').click();
  await expect(page.getByText(/Lote 285.*incluído/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'O que merece atenção antes da preparação?' })).toBeVisible();

  await page.getByRole('button', { name: /Atualizado/ }).click();
  const freshness = page.getByRole('region', { name: 'Detalhes da atualização dos dados' });
  await expect(freshness).toContainText('Balancing');
  await expect(freshness).toContainText('PyMAC');

  await expect(page.getByLabel('Variação demonstrativa')).toBeVisible();
  await page.getByLabel('Variação demonstrativa').selectOption('SCN-WF001-06');
  await expect(page.getByText('Plano de hoje ainda não recebido.').first()).toBeVisible();
  await page.getByLabel('Variação demonstrativa').selectOption('SCN-WF001-05');
  await expect(page.getByText(/Diferença informada: 40 peças/)).toBeVisible();
  await page.locator('#operational-workspace-sidebar summary[title="Plano"]').click();
  await page.getByRole('button', { name: 'Comparar anterior' }).click();
  await expect(page.getByRole('heading', { name: 'Comparação de versões demonstrativas' })).toBeVisible();
  await page.locator('#operational-workspace-sidebar summary[title="Cenário"]').click();
  await page.getByRole('button', { name: 'Reiniciar cenário' }).click();
  await expect(page.getByRole('button', { name: 'Hoje' })).toHaveAttribute('aria-current', 'date');
  await expect(page.getByLabel('Destino', { exact: true })).toHaveValue('ALL');
});

test('has no automatically detectable accessibility violations', async ({ page }) => {
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByRole('button', { name: /Lote 257, Material A, 100 peças/ }).click();
  const modal = page.getByRole('dialog', { name: 'Lote 257' });
  await expect(modal).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('aside[role="dialog"]')).toHaveCount(0);
  await expect(modal.getByRole('region', { name: 'Motivo principal' })).toContainText('Preparação no ponto');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('traps modal focus, closes with X and Escape, and returns focus to the origin Lot', async ({ page }) => {
  const origin = page.getByRole('button', { name: /Lote 257, Material A, 100 peças/ });
  await origin.click();
  const modal = page.getByRole('dialog', { name: 'Lote 257' });
  await expect(modal.getByRole('button', { name: 'Fechar contexto do Lote' })).toBeFocused();
  await modal.getByRole('button', { name: 'Fechar contexto do Lote' }).click();
  await expect(origin).toBeFocused();
  await origin.click();
  await page.keyboard.press('Escape');
  await expect(modal).toHaveCount(0);
  await expect(origin).toBeFocused();
});

test('does not render forbidden red semantic styling', async ({ page }) => {
  const redUsages = await page.locator('body *').evaluateAll((elements) => {
    const forbidden = new Set(['rgb(255, 0, 0)', 'rgb(220, 38, 38)', 'rgb(239, 68, 68)']);
    return elements.flatMap((element) => {
      const style = getComputedStyle(element);
      return [style.color, style.backgroundColor, style.borderColor].filter((value) => forbidden.has(value));
    });
  });
  expect(redUsages).toEqual([]);
});

test('honors reduced-motion preferences', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const duration = await page.getByRole('button', { name: 'Hoje' }).evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(['0.01ms', '1e-05s']).toContain(duration);
});

test('uses the sidebar as an overlay drawer on a small viewport', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 800 });
  const sidebar = page.getByRole('complementary', { name: 'Operational Workspace' });
  const toggle = page.locator('button[aria-controls="operational-workspace-sidebar"]');
  await expect(sidebar).toHaveCSS('position', 'fixed');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
});

test('keeps all scheduled Resource lanes identifiable with only internal timeline overflow', async ({ page }) => {
  await page.getByRole('button', { name: /Lote 265, Material A, 100 peças/ }).click();
  const detail = page.getByRole('dialog', { name: 'Lote 265' });
  for (const { width, height } of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByRole('region', { name: 'Máquina programada DC01' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Máquina programada DC05' })).toBeVisible();
    const timeline = page.getByLabel('Plano Hora-Hora contínuo por máquina programada');
    const dimensions = await timeline.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(dimensions.scrollWidth).toBeGreaterThanOrEqual(dimensions.clientWidth);
    const detailDimensions = await detail.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(detailDimensions.scrollWidth).toBe(detailDimensions.clientWidth);
    const pageDimensions = await page.locator('html').evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(pageDimensions.scrollWidth).toBe(pageDimensions.clientWidth);
  }
});

test('preserves the approved sidebar-only composition while readiness signals are added', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('heading', { name: 'Plano Hora-Hora' })).toBeVisible();
});

test('releases a ready Lot without starting execution and preserves the timeline plan', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-scheduling');
  const lot = page.getByRole('button', { name: /Lote 251, Material A, 100 peças/ });
  const originalStyle = await lot.getAttribute('style');
  await lot.click();
  const modal = page.getByRole('dialog', { name: 'Lote 251' });
  await modal.getByRole('button', { name: 'Liberação' }).click();
  await expect(modal).toContainText('PRONTO PARA LIBERAR');
  await modal.getByRole('button', { name: 'Liberar para produção' }).click();
  await expect(modal).toContainText('Liberado');
  await expect(modal).not.toContainText('Iniciado');
  await expect(page).toHaveScreenshot('WF-001-CAPABILITY-04-RELEASE-CANDIDATE.png', { fullPage: true });
  await modal.getByRole('button', { name: 'Fechar contexto do Lote' }).click();
  const releasedLot = page.getByRole('button', { name: /Lote 251.*liberado para produção/ });
  await expect(releasedLot).toHaveAttribute('style', originalStyle ?? '');
  await expect(releasedLot).toContainText('Liberado');
});

test('captures deterministic Capability 04 ready, released and blocked scenes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.getByRole('button', { name: /Lote 251, Material A, 100 peças/ }).click();
  let modal = page.getByRole('dialog', { name: 'Lote 251' });
  await modal.getByRole('button', { name: 'Liberação' }).click();
  await expect(modal).toContainText('PRONTO PARA LIBERAR');
  await expect(page).toHaveScreenshot('CAP-04-READY-FOR-RELEASE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await modal.getByRole('button', { name: 'Liberar para produção' }).click();
  await expect(modal).toContainText('Supervisor da Fundição · demonstrativo');
  await expect(modal).toContainText('v08');
  await expect(page).toHaveScreenshot('CAP-04-RELEASED-LOT-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await modal.getByRole('button', { name: 'Fechar contexto do Lote' }).click();
  await expect(page.getByRole('button', { name: /Lote 251.*liberado para produção/ })).toContainText('Liberado');
  await page.getByRole('button', { name: /Lote 267, Material D, 70 peças/ }).click();
  modal = page.getByRole('dialog', { name: 'Lote 267' });
  await modal.getByRole('button', { name: 'Liberação' }).click();
  await expect(modal).toContainText('NÃO PODE SER LIBERADO');
  await expect(modal.getByRole('button', { name: 'Liberar para produção' })).toHaveCount(0);
  await expect(page).toHaveScreenshot('CAP-04-BLOCKED-FOR-RELEASE-CANDIDATE.png', { fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.005 });
});

test('shows canonical Resource conditions as a read-only overlay through Avaliar cenário and restores the original plan', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Mostrar condições' })).toHaveCount(0);
  const activate = page.getByRole('button', { name: /Avaliar cenário/ });
  await expect(activate).toBeVisible();
  const laneOrder = () => page.locator('[aria-label^="Máquina programada DC"]').evaluateAll((lanes) => lanes.map((lane) => lane.getAttribute('aria-label')));
  const originalOrder = await laneOrder();
  const originalLotCount = await page.locator('[data-lot-id]').count();
  await activate.click();
  await expect(page.getByRole('status')).toContainText('AVALIAR CENÁRIO');
  await expect(page.getByRole('status')).toContainText('Selecione um Lote para avaliar outra máquina ou horário.');
  await page.getByRole('button', { name: /Lote 257, Material A, 100 peças/ }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('AVALIAR CENÁRIO — LOTE 257');
  await expect(page.getByRole('status')).toContainText('Material A · 100 peças · Programação atual: DC01');
  expect(await laneOrder()).toEqual(originalOrder);
  await expect(page.getByRole('region', { name: 'Máquina programada DC01' })).toContainText('Programada');
  await expect(page.getByRole('region', { name: 'Máquina programada DC01' })).toHaveAttribute('data-resource-condition', 'ATTENTION');
  await expect(page.getByRole('region', { name: 'Máquina programada DC05' })).toHaveAttribute('data-resource-condition', 'UNKNOWN');
  await expect(page.getByRole('region', { name: 'Máquina programada DC02' })).toHaveAttribute('data-resource-eligible', 'false');
  await page.getByRole('region', { name: 'Máquina programada DC01' }).locator('header').focus();
  await expect(page.getByRole('tooltip').first()).toContainText('Elegibilidade: Elegível');
  await expect(page.getByRole('region', { name: 'Impacto conhecido por Recurso' })).toContainText('Setup existente conhecido');
  await expect(page.getByText(/melhor máquina|ótima escolha/i)).toHaveCount(0);
  await expect(page.locator('[data-lot-id]')).toHaveCount(originalLotCount);
  await expect(page.getByTestId('scheduled-setup')).toHaveCount(5);
  await expect(page.getByTestId('planned-break')).toHaveCount(9);
  await expect(page.getByTestId('current-time-marker')).toBeAttached();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const redUsages = await page.locator('body *').evaluateAll((elements) => {
    const forbidden = new Set(['rgb(255, 0, 0)', 'rgb(220, 38, 38)', 'rgb(239, 68, 68)']);
    return elements.flatMap((element) => { const style = getComputedStyle(element); return [style.color, style.backgroundColor, style.borderColor].filter((value) => forbidden.has(value)); });
  });
  expect(redUsages).toEqual([]);
  await page.locator('[data-lot-id="lot-251"]').click();
  await expect(page.getByRole('region', { name: 'Máquina programada DC01' })).toHaveAttribute('data-resource-condition', 'READY');
  await expect(page.getByRole('region', { name: 'Máquina programada DC01' })).toContainText('Programada');
  await page.locator('[data-lot-id="lot-267"]').click();
  await expect(page.getByRole('region', { name: 'Máquina programada DC02' })).toHaveAttribute('data-resource-condition', 'BLOCKED');
  await expect(page.getByRole('region', { name: 'Máquina programada DC02' })).toContainText('Programada');
  await page.getByRole('button', { name: 'Encerrar avaliação' }).click();
  await expect(page.getByRole('button', { name: /Avaliar cenário/ })).toBeVisible();
  expect(await laneOrder()).toEqual(originalOrder);
  await expect(page.locator('[data-lot-id]')).toHaveCount(originalLotCount);
});

test('captures Evaluate Scenarios UX refinement candidates', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('button', { name: /Avaliar cenário/ })).toBeVisible();
  await expect(page).toHaveScreenshot('WF-001-EVALUATE-SCENARIOS-CTA-CANDIDATE.png', { fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.02 });
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await expect(page.getByRole('status')).toContainText('Selecione um Lote');
  await expect(page).toHaveScreenshot('WF-001-EVALUATION-MODE-NO-LOT-CANDIDATE.png', { fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.02 });
  await page.locator('[data-lot-id="lot-257"]').click();
  await expect(page.getByRole('status')).toContainText('AVALIAR CENÁRIO — LOTE 257');
  await expect(page).toHaveScreenshot('WF-001-EVALUATION-MODE-LOT257-CANDIDATE.png', { fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.02 });
});

test('simulates a vertical Resource move with fixed lanes, comparison, undo and discard', async ({ page }) => {
  const laneOrder = () => page.locator('[aria-label^="Máquina programada DC"]').evaluateAll((lanes) => lanes.map((lane) => lane.getAttribute('aria-label')));
  const fixedOrder = ['Máquina programada DC01', 'Máquina programada DC02', 'Máquina programada DC03', 'Máquina programada DC04', 'Máquina programada DC05'];
  expect(await laneOrder()).toEqual(fixedOrder);
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-251"]').click();
  const simulation = page.getByRole('region', { name: 'Avaliação de cenário' });
  const resourceOptions = simulation.getByRole('button').filter({ has: page.locator('b') });
  await expect(resourceOptions).toHaveCount(5);
  await expect(resourceOptions.nth(0)).toContainText('DC01');
  await expect(resourceOptions.nth(1)).toContainText('DC02');
  await expect(resourceOptions.nth(2)).toContainText('DC03');
  await expect(resourceOptions.nth(3)).toContainText('DC04');
  await expect(resourceOptions.nth(4)).toContainText('DC05');
  await expect(resourceOptions.nth(1)).toBeDisabled();
  const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
  await page.locator('[data-lot-id="lot-251"]').dispatchEvent('dragstart', { dataTransfer });
  await page.getByLabel('Lotes programados na DC05').dispatchEvent('dragover', { dataTransfer });
  await page.getByLabel('Lotes programados na DC05').dispatchEvent('drop', { dataTransfer });
  await expect(simulation).toContainText('1 movimentação');
  await expect(simulation).toContainText('Programação atualDC01');
  await expect(simulation).toContainText('Nova programaçãoDC05');
  await expect(page.locator('[data-lot-id="lot-251"]')).toHaveAttribute('data-simulated', 'true');
  await expect(page.getByLabel('Posição original do Lote 251 no plano recebido')).toBeVisible();
  expect(await laneOrder()).toEqual(fixedOrder);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const simulationRed = await page.locator('body *').evaluateAll((elements) => { const forbidden = new Set(['rgb(255, 0, 0)', 'rgb(220, 38, 38)', 'rgb(239, 68, 68)']); return elements.flatMap((element) => { const style = getComputedStyle(element); return [style.color, style.backgroundColor, style.borderColor].filter((value) => forbidden.has(value)); }); });
  expect(simulationRed).toEqual([]);
  await simulation.getByRole('button', { name: 'Comparar' }).click();
  await expect(page.getByRole('region', { name: 'Comparação Plano recebido versus Simulação' })).toContainText('Máquina original: DC01');
  await simulation.getByRole('button', { name: 'Desfazer' }).click();
  await expect(simulation).toContainText('0 alterações');
  expect(await laneOrder()).toEqual(fixedOrder);
  await page.locator('[data-lot-id="lot-255"]').click();
  await simulation.getByRole('button', { name: /DC03/ }).click();
  await expect(page.getByRole('region', { name: /Cobertura do buffer/ })).toContainText('RISCO PARA META DO BUFFER');
  expect(await laneOrder()).toEqual(fixedOrder);
  await simulation.getByRole('button', { name: 'Encerrar avaliação' }).click();
  await expect(simulation).toHaveCount(0);
  expect(await laneOrder()).toEqual(fixedOrder);
  await expect(page.locator('[data-lot-id="lot-255"]')).toHaveAttribute('data-simulated', 'false');
  await expect(page.getByRole('button', { name: /Confirmar|Atribuir|Despachar|Liberar|Executar/ })).toHaveCount(0);
});

test('adopts an operational Resource for a not-started Lot without overwriting the Programmed baseline', async ({ page }) => {
  const laneOrder = () => page.locator('[aria-label^="Máquina programada DC"]').evaluateAll((lanes) => lanes.map((lane) => lane.getAttribute('aria-label')));
  const fixedOrder = ['Máquina programada DC01', 'Máquina programada DC02', 'Máquina programada DC03', 'Máquina programada DC04', 'Máquina programada DC05'];
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-251"]').click();
  const simulation = page.getByRole('region', { name: 'Avaliação de cenário' });
  const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
  await page.locator('[data-lot-id="lot-251"]').dispatchEvent('dragstart', { dataTransfer });
  await page.getByLabel('Lotes programados na DC05').dispatchEvent('dragover', { dataTransfer });
  await page.getByLabel('Lotes programados na DC05').dispatchEvent('drop', { dataTransfer });
  await expect(simulation).toContainText('1 movimentação');

  await simulation.getByRole('button', { name: 'Confirmar nova programação' }).click();
  await expect(simulation).toHaveCount(0);
  expect(await laneOrder()).toEqual(fixedOrder);
  const organizedLot = page.locator('[data-lot-id="lot-251"]');
  await expect(organizedLot).toHaveAttribute('data-organized', 'true');
  await expect(organizedLot).toContainText('Organizado');
  await expect(page.getByLabel('Lotes programados na DC05').locator('[data-lot-id="lot-251"]')).toBeVisible();

  await organizedLot.click();
  const modal = page.getByRole('dialog', { name: 'Lote 251' });
  await modal.getByRole('button', { name: 'Liberação' }).click();
  await expect(modal).toContainText('DC05');
  await expect(modal).toContainText('Programado: DC01');
  await modal.getByRole('button', { name: 'Liberar para produção' }).click();
  await modal.getByRole('button', { name: 'Execução' }).click();
  await expect(modal).toContainText('Lote liberado e organizado em DC05.');
});

test('captures Avaliar cenário candidates: conditions, buffer restore and impact preview', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-257"]').click();
  await expect(page.getByRole('region', { name: 'Impacto conhecido por Recurso' })).toBeVisible();
  await expect(page).toHaveScreenshot('WF-001-FIXED-RESOURCE-CONDITION-VIEW-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Encerrar avaliação' }).click();
  await expect(page).toHaveScreenshot('WF-001-BUFFER-DECISION-WORKSPACE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: /Avaliar cenário/ }).click();
  await page.locator('[data-lot-id="lot-251"]').click();
  await expect(page).toHaveScreenshot('WF-001-SIMULATION-MODE-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await page.getByRole('region', { name: 'Avaliação de cenário' }).getByRole('button', { name: /DC05/ }).click();
  await expect(page).toHaveScreenshot('WF-001-SIMULATION-IMPACT-PREVIEW-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await page.locator('[data-lot-id="lot-255"]').click();
  await page.getByRole('region', { name: 'Avaliação de cenário' }).getByRole('button', { name: /DC03/ }).click();
  await expect(page).toHaveScreenshot('WF-001-SIMULATION-BUFFER-RISK-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('captures WF-001 Lot Context modal candidates without replacing earlier baselines', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: /Lote 257, Material A, 100 peças/ }).click();
  await expect(page.getByRole('region', { name: 'Motivo principal' })).toContainText('Preparação no ponto');
  await expect(page).toHaveScreenshot('WF-001-LOT-CONTEXT-MODAL-ATTENTION-CANDIDATE.png', { fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.02 });
  await page.getByRole('dialog', { name: 'Lote 257' }).getByRole('button', { name: 'Fechar contexto do Lote' }).click();
  await page.getByRole('button', { name: /Lote 267, Material D, 70 peças/ }).click();
  await expect(page.getByRole('region', { name: 'Bloqueio principal' })).toContainText('Disponibilidade no intervalo');
  await expect(page).toHaveScreenshot('WF-001-LOT-CONTEXT-MODAL-BLOCKED-CANDIDATE.png', { fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.02 });
});
