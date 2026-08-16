import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { ProductionQualityPage } from './ProductionQualityPage';

beforeEach(() => { useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false }); useScenarioStore.getState().initializeScenario(scenarioDefinitionAdapter.findById('fundicao-dc')!); useScenarioStore.getState().resetScenario(); });

test('shows Turno 2 in progress beside the day accumulated, Turno 1 history and a highlighted machine panel', () => {
  renderWithFoundation(<ProductionQualityPage />);
  expect(screen.getByRole('heading', { name: 'Quanto produzimos e quanto foi bom?' })).toBeInTheDocument();

  const turnoRow = screen.getByRole('region', { name: 'Qualidade do Turno 2 e acumulado do dia' });
  expect(turnoRow).toHaveTextContent('TURNO 2 · EM ANDAMENTO');
  expect(turnoRow).toHaveTextContent('159');
  expect(turnoRow).toHaveTextContent('Performance vs. Ideal Cycle Time');
  expect(turnoRow).toHaveTextContent('88%');
  expect(turnoRow).toHaveTextContent('Acumulado do dia');
  expect(turnoRow).toHaveTextContent('91%');

  const history = screen.getByRole('region', { name: 'Turnos concluídos hoje' });
  expect(history).toHaveTextContent('Turno 1');
  expect(history).toHaveTextContent('50 peças');
  expect(history).toHaveTextContent('Quality 98%');

  const machines = screen.getByRole('region', { name: 'Situação das Máquinas' });
  const dc05 = within(machines).getByRole('button', { name: /DC05/ });
  expect(dc05).toHaveTextContent('Aguardando');
  const dc04 = within(machines).getByRole('button', { name: /DC04/ });
  expect(dc04).toHaveAttribute('data-tone', 'attention');
  expect(dc04).toHaveTextContent('refugadas');
});

test('opens the Qualidade & Performance drill-down without execution controls', async () => {
  const user = userEvent.setup(); renderWithFoundation(<ProductionQualityPage />);
  const machines = screen.getByRole('region', { name: 'Situação das Máquinas' });
  await user.click(within(machines).getByRole('button', { name: /DC04/ }));
  const dialog = screen.getByRole('dialog', { name: /DC04/ });
  expect(dialog).toHaveTextContent('Quality Rate');
  expect(dialog).toHaveTextContent('Ideal Cycle Time');
  expect(screen.queryByRole('button', { name: /Pausar|Retomar|Concluir|Iniciar produção/ })).not.toBeInTheDocument();
});
