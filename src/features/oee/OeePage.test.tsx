import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { OeePage } from './OeePage';

beforeEach(() => { useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false }); useScenarioStore.getState().initializeScenario(scenarioDefinitionAdapter.findById('fundicao-dc')!); useScenarioStore.getState().resetScenario(); });

test('shows Turno 2 beside the day accumulated, a simplified Turno 1/3 history and a highlighted DC03/DC01 machine panel', () => {
  renderWithFoundation(<OeePage />);
  expect(screen.getByRole('heading', { name: 'Como estamos performando e por quê?' })).toBeInTheDocument();

  const turnoRow = screen.getByRole('region', { name: 'OEE do Turno 2 e acumulado do dia' });
  expect(turnoRow).toHaveTextContent('TURNO 2 · EM ANDAMENTO');
  expect(turnoRow).toHaveTextContent('Parcial até 17:23');
  expect(turnoRow).toHaveTextContent('68%');
  expect(turnoRow).toHaveTextContent('Desempenho');
  expect(turnoRow).toHaveTextContent('DC03');
  expect(turnoRow).toHaveTextContent('Acumulado do dia');
  expect(turnoRow).toHaveTextContent('70%');

  const history = screen.getByRole('region', { name: 'Turnos concluídos hoje' });
  expect(history).toHaveTextContent('Turno 3');
  expect(history).toHaveTextContent('0 peças');
  expect(history).toHaveTextContent('OEE N/A');
  expect(history).toHaveTextContent('Turno 1');
  expect(history).toHaveTextContent('50 peças');
  expect(history).toHaveTextContent('OEE 75%');
  expect(history).not.toHaveTextContent('Disponibilidade');

  const machines = screen.getByRole('region', { name: 'Situação das Máquinas' });
  const dc05 = within(machines).getByRole('button', { name: /DC05/ });
  expect(dc05).toHaveTextContent('N/A');
  expect(dc05).toHaveTextContent('Aguardando produção');
  const dc03 = within(machines).getByRole('button', { name: /DC03/ });
  expect(dc03).toHaveAttribute('data-tone', 'attention');
  expect(dc03).toHaveTextContent('Ferramental ativo');
  const dc01 = within(machines).getByRole('button', { name: /DC01/ });
  expect(dc01).toHaveAttribute('data-tone', 'positive');
});

test('opens Resource and Turno-scoped dimension drill-downs, and keeps details collapsed by default', async () => {
  const user = userEvent.setup(); renderWithFoundation(<OeePage />);

  expect(screen.getByText(/Ranking simples por impacto conhecido/)).not.toBeVisible();
  const disclosure = screen.getByText(/Como chegamos a este resultado\?/).closest('details')!;
  expect(disclosure).not.toHaveAttribute('open');

  const machines = screen.getByRole('region', { name: 'Situação das Máquinas' });
  await user.click(within(machines).getByRole('button', { name: /DC03/ }));
  const resourceDialog = screen.getByRole('dialog', { name: /DC03/ });
  expect(resourceDialog).toHaveTextContent('Tempo de produção planejado');
  await user.click(within(resourceDialog).getByRole('button', { name: 'Fechar contexto de OEE' }));

  const turnoRow = screen.getByRole('region', { name: 'OEE do Turno 2 e acumulado do dia' });
  await user.click(within(turnoRow).getByRole('button', { name: /Disponibilidade/ }));
  const dimensionDialog = screen.getByRole('dialog', { name: /Disponibilidade/ });
  expect(dimensionDialog).toHaveTextContent('Planejado');
  expect(dimensionDialog).toHaveTextContent('TURNO 2');
});
