import { expect, test } from './fixtures';

const STEPS: readonly { id: string; label: string; heading: string }[] = [
  { id: '01', label: 'Plano', heading: 'O que precisamos produzir?' },
  { id: '02', label: 'Preparação', heading: 'Temos condições de produzir?' },
  { id: '03', label: 'Liberação', heading: 'Podemos liberar para produção?' },
  { id: '04', label: 'Execução', heading: 'O que está sendo executado agora?' },
  { id: '05', label: 'Acompanhamento', heading: 'O que está acontecendo em relação ao plano?' },
  { id: '06', label: 'Aderência', heading: 'Estamos executando conforme o planejado?' },
  { id: '07', label: 'Qualidade', heading: 'Quanto produzimos e quanto foi bom?' },
  { id: '08', label: 'OEE', heading: 'Como estamos performando e por quê?' },
];

test('Home inicia a jornada guiada e Próximo percorre 01→08 no mesmo cenário', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc-legacy');
  await page.getByRole('link', { name: /Iniciar demonstração/ }).first().click();

  for (const step of STEPS) {
    await expect(page.getByRole('heading', { name: step.heading })).toBeVisible();
    const journey = page.getByRole('navigation', { name: 'Navegação guiada da demonstração' });
    await expect(journey).toContainText(`Etapa ${step.id}/08`);
    await expect(journey).toContainText(step.label);
    await expect(page.getByRole('combobox', { name: 'Área Produtiva' })).toHaveValue('fundicao-dc');
    const next = journey.getByRole('link', { name: /Próximo/ });
    if (await next.count()) await next.click();
  }

  await expect(page.getByRole('region', { name: 'OEE do Turno 2 e acumulado do dia' })).toContainText('68%');
  await page.getByRole('button', { name: 'Reiniciar cenário' }).click();
  await page.getByRole('alertdialog', { name: 'Reiniciar cenário demonstrativo?' }).getByRole('button', { name: 'Reiniciar cenário' }).click();
  await expect(page.getByRole('region', { name: 'OEE do Turno 2 e acumulado do dia' })).toContainText('68%');
  await page.getByRole('link', { name: '← Voltar à Visão Executiva' }).click();
  await expect(page.getByRole('heading', { name: 'PROGRAMA HIKARI' })).toBeVisible();
});

test('o Lot Context Modal da Liberação não bloqueia o Próximo do stepper', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/fundicao-dc-legacy/production-scheduling?lotId=lot-251');
  await expect(page.getByRole('dialog', { name: 'Lote 251' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Podemos liberar para produção?' })).toBeVisible();
  const journey = page.getByRole('navigation', { name: 'Navegação guiada da demonstração' });
  await expect(journey).toContainText('Etapa 03/08');
  await journey.getByRole('link', { name: /Próximo/ }).click();
  await expect(page.getByRole('heading', { name: 'O que está sendo executado agora?' })).toBeVisible();
});

test('Home mostra o OEE demonstrativo (mesma projeção da CAP-09), a pergunta de negócio e permite reiniciar', async ({ page }) => {
  await page.goto('/demo/fundicao-dc-legacy');
  const oeeTile = page.getByLabel('OEE demonstrativo da Fundição DC');
  await expect(oeeTile).toContainText('OEE 70%');
  await expect(oeeTile).toContainText('Maior perda: Disponibilidade');
  await expect(page.getByText(/Estamos protegendo a cadeia para atender a necessidade da Montagem hoje\?/)).toBeVisible();
  await page.getByRole('button', { name: 'Reiniciar demonstração' }).click();
  await expect(oeeTile).toContainText('OEE 70%');
});

test('Anterior retorna um passo preservando a Área Produtiva', async ({ page }) => {
  await page.goto('/demo/fundicao-dc-legacy/production-monitoring');
  const journey = page.getByRole('navigation', { name: 'Navegação guiada da demonstração' });
  await expect(journey).toContainText('Etapa 05/08');
  await journey.getByRole('link', { name: /Anterior/ }).click();
  await expect(page.getByRole('heading', { name: 'O que está sendo executado agora?' })).toBeVisible();
  await expect(journey).toContainText('Etapa 04/08');
});
