import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { ProductionMonitoringPage } from './ProductionMonitoringPage';

beforeEach(() => { useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false }); useScenarioStore.getState().initializeScenario(scenarioDefinitionAdapter.findById('fundicao-dc')!); useScenarioStore.getState().resetScenario(); });

test('shows the 2026-07-10 Scenario Clock 09:15 context and all five Resources with distinct states', () => {
  renderWithFoundation(<ProductionMonitoringPage />);
  expect(screen.getByRole('heading', { name: 'O que está acontecendo em relação ao plano?' })).toBeInTheDocument();
  expect(screen.getByText('10/07/2026 · Dados simulados até 09:15 · Futuro projetado')).toBeInTheDocument();
  const timeline = screen.getByTestId('live-production-timeline');
  for (const resource of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) expect(within(timeline).getByText(resource)).toBeInTheDocument();
  // Diversity across the states genuinely present at 09:15 — four DCs running, DC03 ready to release (not yet released or started).
  expect(within(timeline).getAllByText('Em execução').length).toBe(4);
  expect(within(timeline).getByText('Pronto para liberar')).toBeInTheDocument();
});

test('KPI strip reflects the real 23-requirement reference dataset totals at 09:15', () => {
  renderWithFoundation(<ProductionMonitoringPage />);
  const strip = screen.getByRole('region', { name: 'Resumo operacional do dia' });
  expect(strip).toHaveTextContent('Planejado até agora1.500');
  expect(strip).toHaveTextContent('Realizado até agora1.000');
  expect(strip).toHaveTextContent('Em execução4');
  expect(strip).toHaveTextContent('Atrasados1');
  expect(strip).toHaveTextContent('A executar6');
  expect(strip).toHaveTextContent('Projeção do dia2.100');
});

test('opens the NOT_STARTED DC03 requirement context — scheduled start already passed, no appointment yet', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionMonitoringPage />);
  const dc03Lane = screen.getByTestId('live-production-timeline').querySelector<HTMLElement>('section[data-status="NOT_STARTED"]')!;
  await user.click(within(dc03Lane).getAllByRole('button')[0]);
  const dialog = screen.getByRole('dialog', { name: '1S4-E5411-W0' });
  expect(dialog).toHaveTextContent('Lote Linha C331');
  expect(dialog).toHaveTextContent('MáquinaDC03');
  expect(dialog).toHaveTextContent('SituaçãoPronto para liberar');
  expect(dialog).toHaveTextContent('Produção— / 100');
  expect(dialog).toHaveTextContent('Atrasado');
});

test('DC05 setup-overrun Event delays the requirement start, visible end to end from the block to the modal, without double-counting the downtime already reflected in Realizado', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionMonitoringPage />);
  const runningLanes = screen.getByTestId('live-production-timeline').querySelectorAll<HTMLElement>('section[data-status="RUNNING"]');
  const dc05Lane = runningLanes[runningLanes.length - 1]!; // DC01, DC02, DC04, DC05 are RUNNING in Resource order — DC05 is last
  await user.click(within(dc05Lane).getAllByRole('button')[0]);
  const dialog = screen.getByRole('dialog', { name: '1ST-E1310-W0' });
  expect(dialog).toHaveTextContent('Realizado08:45');
  expect(dialog).toHaveTextContent('SituaçãoEm execução');
  expect(dialog).toHaveTextContent('Produção18 / 100');
  expect(dialog).toHaveTextContent('Em risco');
  expect(dialog).toHaveTextContent('Conclusão projetada 11:23');
  expect(dialog).toHaveTextContent('Ferramental');
});

test('Unknown != 0 — a requirement with no appointment never shows a fabricated zero', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionMonitoringPage />);
  const dc03Lane = screen.getByTestId('live-production-timeline').querySelector<HTMLElement>('section[data-status="NOT_STARTED"]')!;
  await user.click(within(dc03Lane).getAllByRole('button')[0]);
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveTextContent('Realizado—');
  expect(dialog).toHaveTextContent('Ausência de apontamento não significa zero produzido.');
  expect(dialog).toHaveTextContent('Produção— / 100');
  expect(dialog).not.toHaveTextContent('Produção0 / 100');
});

test('has no fabricated Material A/B/C and no execution controls (Acompanhamento does not start, pause or complete production)', () => {
  renderWithFoundation(<ProductionMonitoringPage />);
  expect(screen.queryByText('Material A')).not.toBeInTheDocument();
  expect(screen.queryByText('Material B')).not.toBeInTheDocument();
  expect(screen.queryByText('Material C')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Iniciar produção|Pausar|Retomar|Concluir/ })).not.toBeInTheDocument();
});
