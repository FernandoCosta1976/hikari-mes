import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/demo/fundicao-dc/production-scheduling');
  await expect(page.getByRole('heading', { name: 'O que precisamos produzir?' })).toBeVisible();
});

test('completes the governed WF-001 interaction narrative', async ({ page }) => {
  await expect(page.getByText('Cenário demonstrativo').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Plano Hora-Hora' })).toBeVisible();
  await expect(page.getByText('Plano recebido — Balancing')).toBeVisible();
  const resources = page.getByRole('region', { name: 'Agora na Fundição' });
  await expect(resources).toBeVisible();
  for (const resource of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) await expect(resources.getByText(resource, { exact: true })).toBeVisible();
  await expect(resources.getByText('Produção atual conhecida').first()).toBeVisible();
  await expect(resources.getByText('Sem produção corrente conhecida')).toBeVisible();
  await expect(resources.getByText('Informação parcial').first()).toBeVisible();
  await expect(resources.getByText('Informação desatualizada').first()).toBeVisible();
  await expect(resources.getByRole('button')).toHaveCount(0);
  await expect(resources.getByText('A situação atual não representa atribuição dos Lotes planejados às máquinas.')).toBeVisible();
  await expect(page.getByText('Versão demonstrativa 08').first()).toBeVisible();
  await page.getByRole('button', { name: /Lote 252, Material A, 100 peças/ }).click();
  const detail = page.getByRole('dialog', { name: 'Lote 252' });
  await expect(detail).toBeVisible();
  const materialAEligibility = detail.getByRole('list', { name: 'Máquinas elegíveis para Material A: DC01, DC03, DC05' });
  await expect(materialAEligibility.getByRole('listitem')).toHaveText(['DC01', 'DC03', 'DC05']);
  await expect(materialAEligibility.getByRole('button')).toHaveCount(0);
  await expect(detail.getByText('Ainda não atribuído')).toBeVisible();
  await expect(resources.getByText('247', { exact: true })).toBeVisible();
  await expect(detail.getByRole('button', { name: 'Avaliar preparação' })).toBeVisible();
  await detail.getByRole('button', { name: 'Fechar detalhe do Lote' }).click();
  await expect(detail).not.toBeVisible();

  await page.getByRole('button', { name: /Lote 254, Material B, 100 peças/ }).click();
  const materialBDetail = page.getByRole('dialog', { name: 'Lote 254' });
  await expect(materialBDetail.getByRole('list', { name: 'Máquinas elegíveis para Material B: DC02, DC03, DC05' }).getByRole('listitem')).toHaveText(['DC02', 'DC03', 'DC05']);
  await expect(materialBDetail.getByText('Ainda não atribuído')).toBeVisible();
  await expect(resources.getByText('Máquinas elegíveis')).toHaveCount(0);
  await expect(materialBDetail.getByRole('button', { name: 'Avaliar preparação' })).toBeVisible();
  await materialBDetail.getByRole('button', { name: 'Fechar detalhe do Lote' }).click();

  await page.locator('#production-order-correlation summary').click();
  await expect(page.getByText('Lote 251 + Lote 252 + Lote 253 = 300 peças')).toBeVisible();
  await page.locator('#buffer-coverage summary').click();
  await expect(page.getByText('Após o plano').first()).toBeVisible();
  await page.locator('#schedule-revision summary').click();
  await expect(page.getByText(/Lote 256.*incluído/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'O que merece atenção antes da preparação?' })).toBeVisible();

  await page.getByRole('button', { name: /Atualização dos dados/ }).click();
  const freshness = page.getByRole('region', { name: 'Detalhes da atualização dos dados' });
  await expect(freshness).toContainText('Balancing');
  await expect(freshness).toContainText('PyMAC');

  await page.getByLabel('Variação demonstrativa').selectOption('SCN-WF001-06');
  await expect(page.getByText('Plano de hoje ainda não recebido.').first()).toBeVisible();
  await page.getByLabel('Variação demonstrativa').selectOption('SCN-WF001-05');
  await expect(page.getByText(/Diferença informada: 40 peças/)).toBeVisible();
  await page.getByRole('button', { name: 'Comparar plano anterior' }).click();
  await expect(page.getByRole('heading', { name: 'Comparação de versões demonstrativas' })).toBeVisible();
  await page.getByRole('button', { name: 'Reiniciar cenário' }).click();
  await expect(page.getByRole('button', { name: 'Hoje' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Destino')).toHaveValue('ALL');
});

test('has no automatically detectable accessibility violations', async ({ page }) => {
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('honors reduced-motion preferences', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const duration = await page.getByRole('button', { name: 'Hoje' }).evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(['0.01ms', '1e-05s']).toContain(duration);
});

test('keeps the compact Current Resource State legible without horizontal overflow', async ({ page }) => {
  await page.getByRole('button', { name: /Lote 252, Material A, 100 peças/ }).click();
  const detail = page.getByRole('dialog', { name: 'Lote 252' });
  for (const width of [1440, 1280, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    const landscape = page.getByRole('region', { name: 'Agora na Fundição' });
    await expect(landscape.getByText('DC01', { exact: true })).toBeVisible();
    await expect(landscape.getByText('DC05', { exact: true })).toBeVisible();
    const dimensions = await landscape.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
    const detailDimensions = await detail.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(detailDimensions.scrollWidth).toBe(detailDimensions.clientWidth);
    const pageDimensions = await page.locator('html').evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(pageDimensions.scrollWidth).toBe(pageDimensions.clientWidth);
  }
});

test('captures the integrated Current State and Eligibility candidate without replacing previous candidates', async ({ page }) => {
  await page.getByRole('button', { name: 'Lote 252, Material A, 100 peças, início previsto 17:48, término previsto 18:53' }).click();
  await expect(page.getByRole('dialog', { name: 'Lote 252' })).toBeVisible();
  await expect(page).toHaveScreenshot('WF-001-CURRENT-STATE-ELIGIBILITY-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});
