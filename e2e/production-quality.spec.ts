import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

test('shows Turno 2 in progress beside the day accumulated, Turno 1 history and a highlighted machine panel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc-legacy/production-quality');
  await expect(page.getByRole('heading', { name: 'Quanto produzimos e quanto foi bom?' })).toBeVisible();

  const turnoRow = page.getByRole('region', { name: 'Qualidade do Turno 2 e acumulado do dia' });
  await expect(turnoRow).toContainText('TURNO 2 · EM ANDAMENTO');
  await expect(turnoRow).toContainText('159');
  await expect(turnoRow).toContainText('Desempenho vs. Tempo de ciclo padrão');
  await expect(turnoRow).toContainText('88%');
  await expect(turnoRow).toContainText('Acumulado do dia');
  await expect(turnoRow).toContainText('91%');

  const history = page.getByRole('region', { name: 'Turnos concluídos hoje' });
  await expect(history).toContainText('Turno 1');
  await expect(history).toContainText('50 peças');
  await expect(history).toContainText('Qualidade 98%');

  const machines = page.getByRole('region', { name: 'Situação das Máquinas' });
  await expect(machines.getByRole('button', { name: /DC05/ })).toContainText('Aguardando');
  const dc04 = machines.getByRole('button', { name: /DC04/ });
  await expect(dc04).toHaveAttribute('data-tone', 'attention');
  await expect(dc04).toContainText('refugadas');

  await expect(page).toHaveScreenshot('CAP-08-QUALITY-OVERVIEW-CANDIDATE.png', { fullPage: true, animations: 'disabled' });
});

test('opens the Qualidade & Performance drill-down without execution actions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc-legacy/production-quality');
  const machines = page.getByRole('region', { name: 'Situação das Máquinas' });
  await machines.getByRole('button', { name: /DC04/ }).click();
  const dialog = page.getByRole('dialog', { name: /DC04/ });
  await expect(dialog).toContainText('Taxa de qualidade');
  await expect(dialog).toContainText('Tempo de ciclo padrão');
  await expect(dialog.getByRole('button', { name: /Pausar|Retomar|Concluir|Iniciar/ })).toHaveCount(0);
});

test('is accessible, keyboard reachable, responsive and contains no prohibited red', async ({ page }) => {
  await page.goto('/demo/fundicao-dc-legacy/production-quality');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const machines = page.getByRole('region', { name: 'Situação das Máquinas' });
  await machines.getByRole('button', { name: /DC04/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
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
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Reiniciar cenário' }).click();
  await page.getByRole('alertdialog', { name: 'Reiniciar cenário demonstrativo?' }).getByRole('button', { name: 'Reiniciar cenário' }).click();
  await expect(page.getByRole('region', { name: 'Qualidade do Turno 2 e acumulado do dia' })).toContainText('159');
});
