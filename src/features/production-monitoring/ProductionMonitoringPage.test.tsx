import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { ProductionMonitoringPage } from './ProductionMonitoringPage';

beforeEach(() => { useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false }); useScenarioStore.getState().initializeScenario(scenarioDefinitionAdapter.findById('fundicao-dc')!); useScenarioStore.getState().resetScenario(); });

test('shows five Resources, coherent WIP, Scheduled versus Actual and the active event', () => {
  renderWithFoundation(<ProductionMonitoringPage />);
  expect(screen.getByRole('heading', { name: 'O que está acontecendo na produção agora?' })).toBeInTheDocument();
  const timeline = screen.getByTestId('live-production-timeline');
  for (const resource of ['DC01','DC02','DC03','DC04','DC05']) expect(within(timeline).getByText(resource)).toBeInTheDocument();
  expect(within(timeline).getAllByText('PLANEJADO')).toHaveLength(5);
  expect(within(timeline).getAllByText('REAL')).toHaveLength(5);
  expect(screen.getByText(/DC03 · Lote 266 · Ferramental · 18 min/)).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Resumo de produção em andamento' })).toHaveTextContent('Aguardando1Em produção2Parados1Concluídos1');
});

test('opens Lot and Resource contexts without execution controls', async () => {
  const user = userEvent.setup(); renderWithFoundation(<ProductionMonitoringPage />);
  await user.click(screen.getByRole('button', { name: /DC03.*Parada/ }));
  const resourceDialog = screen.getByRole('dialog', { name: 'DC03' });
  expect(resourceDialog).toHaveTextContent('Lote atual: 266');
  expect(resourceDialog).toHaveTextContent('Molde atual');
  expect(resourceDialog).toHaveTextContent('M-118');
  expect(resourceDialog).toHaveTextContent('Atenção');
  expect(screen.queryByRole('button', { name: /Pausar|Retomar|Concluir|Iniciar produção/ })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Fechar contexto de acompanhamento' }));
  await user.click(screen.getAllByRole('button', { name: /^Lote 265/ })[0]);
  expect(screen.getByRole('dialog', { name: 'Lote 265' })).toHaveTextContent('83 / 100 · 83%');
});
