import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { ProductionAdherencePage } from './ProductionAdherencePage';

beforeEach(() => { useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false }); useScenarioStore.getState().initializeScenario(scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!); useScenarioStore.getState().resetScenario(); });

test('shows Turno 2 in progress beside the day accumulated, Turno 1 history and a highlighted machine panel', () => {
  renderWithFoundation(<ProductionAdherencePage />);
  expect(screen.getByRole('heading', { name: 'Estamos executando conforme o planejado?' })).toBeInTheDocument();

  const turnoRow = screen.getByRole('region', { name: 'Aderência do Turno 2 e acumulado do dia' });
  expect(turnoRow).toHaveTextContent('TURNO 2 · EM ANDAMENTO');
  expect(turnoRow).toHaveTextContent('1 / 3');
  expect(turnoRow).toHaveTextContent('Principal desvio');
  expect(turnoRow).toHaveTextContent('DC03');
  expect(turnoRow).toHaveTextContent('Parado');
  expect(turnoRow).toHaveTextContent('Acumulado do dia');
  expect(turnoRow).toHaveTextContent('2 / 4');

  const history = screen.getByRole('region', { name: 'Turnos concluídos hoje' });
  expect(history).toHaveTextContent('Turno 1');
  expect(history).toHaveTextContent('1/1 Lotes conformes');

  const machines = screen.getByRole('region', { name: 'Situação das Máquinas' });
  const dc03 = within(machines).getByRole('button', { name: /DC03/ });
  expect(dc03).toHaveAttribute('data-tone', 'attention');
  expect(dc03).toHaveTextContent('Pausado');
  const dc04 = within(machines).getByRole('button', { name: /DC04/ });
  expect(dc04).toHaveTextContent('-140 min');
});

test('opens the Aderência drill-down for a deviated Lot without execution controls', async () => {
  const user = userEvent.setup(); renderWithFoundation(<ProductionAdherencePage />);
  const machines = screen.getByRole('region', { name: 'Situação das Máquinas' });
  await user.click(within(machines).getByRole('button', { name: /DC03/ }));
  const dialog = screen.getByRole('dialog', { name: /DC03/ });
  expect(dialog).toHaveTextContent('Parado');
  expect(dialog).toHaveTextContent('Início planejado');
  expect(screen.queryByRole('button', { name: /Pausar|Retomar|Concluir|Iniciar produção/ })).not.toBeInTheDocument();
});
