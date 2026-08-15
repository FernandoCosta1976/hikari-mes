import { expect, test } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

test('opens the Executive Home from root and enters the operational demonstration', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/demo\/fundicao-dc$/);
  await expect(page.getByRole('heading', { name: 'PROGRAMA HIKARI' })).toBeVisible();
  await page.getByRole('link', { name: /Iniciar demonstração/ }).first().click();
  await expect(page).toHaveURL(/production-scheduling/);
  await expect(page.getByRole('link', { name: /Visão Executiva/ })).toBeVisible();
  await page.getByRole('link', { name: /Visão Executiva/ }).click();
  await expect(page).toHaveURL(/\/demo\/fundicao-dc$/);
});

test('supports question disclosure, keyboard and accessibility with no red', async ({ page }) => {
  await page.goto('/demo/fundicao-dc');
  const question = page.getByRole('button', { name: /Quanto perdi/ });
  await question.focus();
  await question.press('Enter');
  await expect(page.getByRole('complementary', { name: 'Capabilities relacionadas à pergunta selecionada' })).toContainText('Quanto perdi?');
  const violations = await new AxeBuilder({ page }).analyze();
  expect(violations.violations).toEqual([]);
  const red = await page.locator('*').evaluateAll((elements) => elements.filter((element) => {
    const style = getComputedStyle(element);
    return [style.color, style.backgroundColor, style.borderColor].some((value) => value === 'rgb(255, 0, 0)');
  }).length);
  expect(red).toBe(0);
});

test('captures Executive Home product review candidates', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc');
  await expect(page).toHaveScreenshot('HIKARI-EXECUTIVE-HOME-ABOVE-THE-FOLD-CANDIDATE.png', { animations: 'disabled' });
  await page.locator('#primeira-onda').scrollIntoViewIfNeeded();
  await expect(page).toHaveScreenshot('HIKARI-EXECUTIVE-HOME-FIRST-WAVE-CANDIDATE.png', { animations: 'disabled' });
  await page.getByRole('heading', { name: 'O que o HIKARI passa a responder?' }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: /Por que a eficiência variou/ }).click();
  await expect(page).toHaveScreenshot('HIKARI-EXECUTIVE-HOME-QUESTIONS-CANDIDATE.png', { animations: 'disabled' });
  await page.getByRole('heading', { name: 'OEE como consequência da execução conectada' }).scrollIntoViewIfNeeded();
  await expect(page).toHaveScreenshot('HIKARI-EXECUTIVE-HOME-OEE-CANDIDATE.png', { animations: 'disabled' });
});

for (const viewport of [{ width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
  test(`keeps the executive narrative usable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/demo/fundicao-dc');
    await expect(page.getByRole('heading', { name: 'PROGRAMA HIKARI' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Iniciar demonstração/ }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}
