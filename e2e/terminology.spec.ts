import { expect, test } from './fixtures';

/**
 * Automated pt-BR terminology scan. Forbidden terms must never appear as
 * visible UI text on the main routes — English is only allowed for the
 * explicitly governed manufacturing/industry terms (OEE, MES, Setup,
 * Buffer, WIP). Internal code/type names are irrelevant here; this only
 * inspects rendered, user-visible text.
 */
const forbiddenTerms = [
  'Current Time', 'Scheduled Start', 'Scheduled Finish', 'Actual Start', 'Actual Finish',
  'Scheduled', 'Actual', 'Performance', 'Quality', 'Resource', 'Produced', 'Good', 'Reject', 'Rework', 'Run Time',
  'Expected Quantity', 'Resource Health', 'Lot Health', 'Downstream', 'Upstream', 'Unknown',
  'On Track', 'At Risk', 'Late Not Started', 'Behind Plan', 'Ahead of Plan', 'Started Late',
  'Completed', 'Released', 'Blocked', 'Workspace', 'Status', 'Baseline', 'Fixture', 'TBD',
  'Health', 'Source', 'Capability', 'Capabilities',
];

const routes = [
  ['Visão Executiva', '/demo/fundicao-dc'],
  ['Visão Estratégica', '/demo/fundicao-dc/strategic'],
  ['Plano', '/demo/fundicao-dc/production-scheduling'],
  ['Preparação', '/demo/fundicao-dc/production-readiness'],
  ['Execução', '/demo/fundicao-dc/production-execution'],
  ['Acompanhamento', '/demo/fundicao-dc/production-monitoring'],
  ['Aderência', '/demo/fundicao-dc/production-adherence'],
  ['Qualidade', '/demo/fundicao-dc/production-quality'],
  ['OEE', '/demo/fundicao-dc/oee'],
  ['Gestão da Ordem', '/demo/fundicao-dc/orders/lot-sd-401'],
] as const;

for (const [name, path] of routes) {
  test(`terminology scan: ${name} shows no forbidden English UI strings`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    const text = await page.locator('body').innerText();
    for (const term of forbiddenTerms) {
      const pattern = new RegExp(`\\b${term}\\b`);
      expect(pattern.test(text), `Found forbidden term "${term}" on ${name} (${path})`).toBe(false);
    }
  });
}
