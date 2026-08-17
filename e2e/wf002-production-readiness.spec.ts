import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

test('hands off the selected Lot from WF-001 and restores the complete Plan context', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.getByLabel('Destino', { exact: true }).selectOption('ASSEMBLY');
  const timeline = page.getByTestId('timeline-scroller');
  await timeline.evaluate((element) => { element.scrollLeft = 123; });
  await page.locator('button[aria-controls="operational-workspace-sidebar"]').click();
  await page.getByRole('button', { name: /Lote 267, Material D, 70 peças/ }).click();
  const originScroll = await timeline.evaluate((element) => element.scrollLeft);
  await page.getByRole('button', { name: 'Analisar preparação' }).click();
  await expect(page).toHaveURL(/production-readiness\?lotId=lot-267/);
  await expect(page.getByRole('heading', { name: 'Temos condições de produzir?' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Contexto do Lote 267' })).toContainText('DC02 · demonstrativa');
  await page.getByRole('button', { name: /Voltar ao Plano Hora-Hora/ }).click();
  await expect(page).toHaveURL(/production-scheduling\?lotId=lot-267/);
  await expect(page.getByRole('dialog', { name: 'Lote 267' })).toHaveCount(0);
  const sidebarToggle = page.locator('button[aria-controls="operational-workspace-sidebar"]');
  await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('button', { name: /Lote 267, Material D, 70 peças/ })).toBeFocused();
  await expect.poll(() => timeline.evaluate((element) => element.scrollLeft)).toBe(originScroll);
  await sidebarToggle.click();
  await expect(page.getByRole('button', { name: '24h' })).toHaveAttribute('aria-current', 'true');
  await expect(page.getByLabel('Destino', { exact: true })).toHaveValue('ASSEMBLY');
});

test('keeps one Operational Workspace and one canonical Readiness meaning across perspectives', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await expect(page.getByRole('complementary', { name: 'Painel Operacional' })).toHaveCount(1);
  await expect(page.getByLabel('Contexto da aplicação')).toContainText('Fundição DC');
  const lot = page.getByRole('button', { name: /Lote 267, Material D, 70 peças.*condição impeditiva/i });
  await expect(lot).toBeVisible();
  await lot.click();
  const lotContext = page.getByRole('dialog', { name: 'Lote 267' });
  await expect(lotContext).toContainText('Condição impeditiva');
  await lotContext.getByRole('button', { name: 'Analisar preparação' }).click();
  await expect(page.getByRole('complementary', { name: 'Painel Operacional' })).toHaveCount(1);
  await expect(page.getByLabel('Contexto da aplicação')).toContainText('Fundição DC');
  await expect(page.getByRole('region', { name: 'Contexto do Lote 267' })).toBeVisible();
  await expect(page.getByText('Condição impeditiva', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Atribuir|Despachar|Liberar|Iniciar/ })).toHaveCount(0);
});

test('opens exception-first from the Plan summary and aggregate from direct sidebar navigation', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await page.getByRole('button', { name: /Preparação.*OK/ }).click();
  await expect(page).toHaveURL(/production-readiness$/);
  await expect(page.getByRole('region', { name: 'Preparação do plano' })).toContainText('Nenhum Lote foi selecionado silenciosamente');
  await expect(page.getByText('15/05/2025')).toBeVisible();
  await expect(page.getByText('Organização')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Fila operacional de exceções' })).toBeVisible();
  await page.getByRole('region', { name: /Fila operacional de exceções/ }).getByRole('button', { name: /Lote 259/ }).click();
  await expect(page).toHaveURL(/lotId=lot-259/);
  await page.getByRole('button', { name: /Plano Hora-Hora/ }).first().click();
  await page.getByRole('link', { name: /Preparação/ }).click();
  await expect(page).toHaveURL(/production-readiness$/);
  await expect(page.getByRole('region', { name: 'Preparação do plano' })).toBeVisible();
});

test('supports exception-first navigation and progressive Resource detail without WF-003 actions', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-readiness?lotId=lot-252');
  for (const state of ['Condições atendidas', 'Atenção', 'Condição impeditiva', 'Informação insuficiente']) await expect(page.getByText(state).first()).toBeVisible();
  await page.getByRole('button', { name: 'Condição impeditiva', exact: true }).click();
  await expect(page.getByRole('button', { name: /Lote 259.*Disponibilidade no intervalo/ })).toBeVisible();
  await page.getByRole('button', { name: 'Todas as condições' }).click();
  await page.getByText('Prontos (11)').click();
  await page.getByRole('button', { name: /Lote 252/ }).click();
  await expect(page.locator('[data-resource-id="DC02"]').first()).toContainText('Não elegível');
  await page.getByText('Detalhes de preparação por máquina').click();
  await page.getByRole('button', { name: 'Ver condições de DC03' }).click();
  await expect(page.getByRole('dialog', { name: /DC03 · Lote 252/ })).toContainText('Setup necessário; duração não calculada.');
  await expect(page.getByRole('button', { name: /Atribuir|Despachar|Liberar|Iniciar/ })).toHaveCount(0);
});

test('passes accessibility, responsive overflow and no-red validation', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-readiness?lotId=lot-252');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    const dimensions = await page.locator('html').evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
    await expect(page.getByRole('heading', { name: 'Temos condições de produzir?' })).toBeVisible();
  }
  const redUsages = await page.locator('body *').evaluateAll((elements) => {
    const forbidden = new Set(['rgb(255, 0, 0)', 'rgb(220, 38, 38)', 'rgb(239, 68, 68)']);
    return elements.flatMap((element) => { const style = getComputedStyle(element); return [style.color, style.backgroundColor, style.borderColor].filter((value) => forbidden.has(value)); });
  });
  expect(redUsages).toEqual([]);
});

test('honors reduced motion and captures refined Product Review candidates', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-readiness');
  await expect(page.getByRole('region', { name: 'Preparação do plano' })).toBeVisible();
  await expect(page.getByText('15/05/2025')).toBeVisible();
  await expect(page).toHaveScreenshot('WF-002-EXCEPTION-FIRST-REFINED-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await page.goto('/demo/fundicao-dc/production-readiness?lotId=lot-257');
  await expect(page).toHaveScreenshot('WF-002-LOT-READINESS-REFINED-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('shows plan-aware condition groups without ranking or assignment semantics', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-readiness?lotId=lot-257');
  const groups = page.locator('[data-resource-group]');
  await expect(groups).toHaveCount(3);
  await expect(groups.nth(0)).toHaveAttribute('data-resource-group', 'READY');
  await expect(groups.nth(1)).toHaveAttribute('data-resource-group', 'ATTENTION');
  await expect(groups.nth(2)).toHaveAttribute('data-resource-group', 'UNAVAILABLE');
  await expect(groups.nth(1).locator('[data-resource-id="DC01"]')).toContainText('Programada');
  await expect(groups.nth(1).locator('[data-resource-id="DC05"]')).toContainText('Informação insuficiente');
  await expect(groups.nth(2)).toContainText('DC02');
  await expect(groups.nth(2)).toContainText('DC04');
  await expect(groups.getByText(/Ranking|melhor máquina|melhor slot/i)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Atribuir|Trocar máquina|Despachar|Liberar|Iniciar/ })).toHaveCount(0);
});

test('preserves temporal context and the selected Lot in its programmed lane', async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-readiness?lotId=lot-267');
  const timeline = page.getByTestId('readiness-timeline-scroller');
  await expect(timeline.getByRole('region', { name: 'Máquina programada DC02' })).toBeVisible();
  await expect(timeline.getByRole('region', { name: 'Máquina programada DC05' })).toBeVisible();
  await expect(timeline.getByRole('region', { name: 'Máquina programada DC01' })).toHaveCount(0);
  await expect(timeline.locator('[data-lot-id="lot-267"]')).toHaveCount(1);
  await expect(timeline.getByTestId('current-time-marker')).toBeVisible();
  await expect(timeline.getByTestId('planned-break')).not.toHaveCount(0);
  await expect(timeline.getByTestId('scheduled-setup')).not.toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Impacto conhecido' })).toBeVisible();
});

test('captures plan-aware Readiness Product Review candidates', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc/production-readiness?lotId=lot-257');
  await expect(page).toHaveScreenshot('WF-002-PLAN-AWARE-READINESS-ATTENTION-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await page.goto('/demo/fundicao-dc/production-readiness?lotId=lot-267');
  await expect(page).toHaveScreenshot('WF-002-PLAN-AWARE-READINESS-BLOCKED-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
  await expect(page.locator('[data-timeline-mode="READINESS_CONTEXT"]')).toHaveScreenshot('WF-002-PLAN-AWARE-RESOURCE-CONTEXT-CANDIDATE.png', { animations: 'disabled' });
});
