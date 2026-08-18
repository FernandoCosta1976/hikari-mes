import { screen, within } from '@testing-library/react';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { StrategicViewPage } from './StrategicViewPage';

beforeEach(() => { useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false }); useScenarioStore.getState().initializeScenario(scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!); useScenarioStore.getState().resetScenario(); });

test('shows the executive cockpit with Meta 2.000, RISCO status and the five machines with shared Lot Health icons', () => {
  renderWithFoundation(<StrategicViewPage />);
  expect(screen.getByRole('heading', { name: 'Como está a saúde da Fundição DC?' })).toBeInTheDocument();
  expect(screen.getByText('RISCO')).toBeInTheDocument();

  const production = screen.getByRole('heading', { name: 'Eficácia' }).closest('article')!;
  expect(production).toHaveTextContent('Meta');
  expect(production).toHaveTextContent('2.000');
  expect(production).toHaveTextContent('Produzido');
  expect(production).toHaveTextContent('174');

  const machines = screen.getByRole('heading', { name: 'Situação das Máquinas' }).closest('section')!;
  for (const resource of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) expect(within(machines).getByText(resource)).toBeInTheDocument();
  expect(within(machines).getByText('Atrasado para iniciar')).toBeInTheDocument();
  expect(within(machines).getByText('Abaixo do plano')).toBeInTheDocument();

  const priorities = screen.getByRole('heading', { name: 'Prioridades agora' }).closest('section')!;
  const items = within(priorities).getAllByRole('listitem');
  expect(items.length).toBeLessThanOrEqual(3);
  expect(items[0]).toHaveTextContent('DC05');
  expect(items[0]).toHaveTextContent('Atrasado para iniciar');
});

test('links each quadrant to its existing operational perspective without duplicating functionality', () => {
  renderWithFoundation(<StrategicViewPage />);
  expect(screen.getByRole('link', { name: /Ver Plano/ })).toHaveAttribute('href', '/demo/fundicao-dc/production-scheduling');
  expect(screen.getByRole('link', { name: /Entender perda/ })).toHaveAttribute('href', '/demo/fundicao-dc/oee');
  expect(screen.getByRole('link', { name: /Ver Aderência/ })).toHaveAttribute('href', '/demo/fundicao-dc/production-adherence');
  expect(screen.getByRole('link', { name: /Ver Qualidade/ })).toHaveAttribute('href', '/demo/fundicao-dc/production-quality');
});

test('never renders a red tone anywhere on the page', () => {
  const { container } = renderWithFoundation(<StrategicViewPage />);
  const toneEls = container.querySelectorAll('[data-tone]');
  for (const el of toneEls) expect(el.getAttribute('data-tone')).not.toMatch(/red|danger|critical/i);
});
