import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

test('materializes the five-resource execution perspective and its controlled lifecycle', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc-legacy/production-execution');
  await expect(page.getByRole('heading', { name: 'O que está sendo executado agora?' })).toBeVisible();
  for (const resource of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) await expect(page.getByText(resource, { exact: true }).first()).toBeVisible();
  await expect(page).toHaveScreenshot('CAP-05-EXECUTION-OVERVIEW-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  const dc05 = page.locator('article').filter({ has: page.getByText('DC05', { exact: true }) });
  await expect(dc05).toContainText('Aguardando início');
  await expect(dc05).toContainText('Lote 271');
  await expect(page).toHaveScreenshot('CAP-05-LOT-RELEASED-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await dc05.getByRole('button', { name: 'Iniciar produção' }).click();
  await expect(dc05).toContainText('Em produção');
  await expect(page).toHaveScreenshot('CAP-05-LOT-IN-PROGRESS-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await dc05.getByLabel('Motivo da pausa na DC05').selectOption('QUALITY');
  await dc05.getByRole('button', { name: 'Pausar' }).click();
  await expect(dc05).toContainText('Pausada');
  await expect(dc05).toContainText('Qualidade');
  await expect(page).toHaveScreenshot('CAP-05-LOT-PAUSED-CANDIDATE.png', { fullPage: true, animations: 'disabled' });

  await dc05.getByRole('button', { name: 'Retomar' }).click();
  await expect(dc05).toContainText('Em produção');

  // Concluir depends on the confirmed Production total reaching Planned Quantity (Capability 06) — lot-271
  // plans 70 peças and starts at 0 confirmed, so registering the full amount reaches it in one confirmation.
  await dc05.getByLabel('Quantidade produzida na DC05').fill('70');
  await dc05.getByRole('button', { name: 'Registrar produção' }).click();
  await expect(dc05.getByRole('button', { name: 'Concluir' })).toBeVisible();
  await dc05.getByRole('button', { name: 'Concluir' }).click();
  await expect(dc05).toContainText('Concluída');
  await expect(page).toHaveScreenshot('CAP-05-LOT-COMPLETED-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('keeps execution accessible, responsive and free from prohibited red', async ({ page }) => {
  await page.goto('/demo/fundicao-dc-legacy/production-execution');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    const dimensions = await page.locator('html').evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
  }
  const redUsages = await page.locator('body *').evaluateAll((elements) => {
    const forbidden = new Set(['rgb(255, 0, 0)', 'rgb(220, 38, 38)', 'rgb(239, 68, 68)']);
    return elements.flatMap((element) => { const style = getComputedStyle(element); return [style.color, style.backgroundColor, style.borderColor].filter((value) => forbidden.has(value)); });
  });
  expect(redUsages).toEqual([]);
});
