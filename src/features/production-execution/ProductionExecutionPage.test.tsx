import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { ProductionExecutionPage } from './ProductionExecutionPage';

beforeEach(() => { useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false }); useScenarioStore.getState().initializeScenario(scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!); useScenarioStore.getState().resetScenario(); });
test('shows five Resources, parallel execution and the shared Current Time', () => {
  renderWithFoundation(<ProductionExecutionPage />);
  expect(screen.getByRole('heading', { name: 'O que está sendo executado agora?' })).toBeInTheDocument();
  const board = screen.getByRole('region', { name: 'Situação das cinco máquinas' });
  for (const resource of ['DC01','DC02','DC03','DC04','DC05']) expect(within(board).getByText(resource)).toBeInTheDocument();
  expect(within(board).getAllByText('Em produção')).toHaveLength(2);
  expect(screen.getByText(/Horário atual 17:23/)).toBeInTheDocument();
});
test('shows the installed Mold and the Apontamento da Produção (Automatic and Manual origins)', () => {
  renderWithFoundation(<ProductionExecutionPage />);
  const board = screen.getByRole('region', { name: 'Situação das cinco máquinas' });
  const dc04Card = within(board).getByText('DC04').closest('article')!;
  expect(within(dc04Card).getByLabelText(/Molde instalado.*M-302/)).toBeInTheDocument();
  expect(within(dc04Card).getByText('Manutenção recomendada')).toBeInTheDocument();
  expect(within(dc04Card).getByText('Apontamento da produção')).toBeInTheDocument();
  expect(within(dc04Card).getByLabelText(/Último apontamento.*\+10 peças/)).toBeInTheDocument();
  const history = within(dc04Card).getByText('Histórico de apontamentos').closest('details')!;
  expect(within(history).getAllByText(/Automação/).length).toBeGreaterThan(0);
  expect(within(history).getByText(/Operador/)).toBeInTheDocument();
});
test('starts, pauses, resumes and completes explicitly once the Session Clock reaches Scheduled Finish', async () => {
  const user = userEvent.setup(); renderWithFoundation(<ProductionExecutionPage />);
  await user.click(screen.getByRole('button', { name: 'Iniciar produção' }));
  const board = screen.getByRole('region', { name: 'Situação das cinco máquinas' });
  const dc05Card = () => within(board).getByText('DC05').closest('article')!;
  await user.selectOptions(screen.getByLabelText('Motivo da pausa na DC05'), 'QUALITY'); await user.click(within(dc05Card()).getByRole('button', { name: 'Pausar' }));
  expect(useScenarioStore.getState().productionExecutions['lot-271']).toMatchObject({ status: 'PAUSED', pauses: [{ reason: 'QUALITY' }] });
  // Concluir stays hidden on DC05 until the Session Clock reaches lot-271's own Scheduled Finish (18:00) — no
  // manual quantity entry exists this round, so two Pause/Resume cycles (each a fixed +15min step) get there.
  // (The Session Clock is shared across every Resource, so another Resource may show Concluir sooner — that's
  // an intentional consequence of one Session Operational Clock, not scoped per-lot.)
  expect(within(dc05Card()).queryAllByRole('button', { name: 'Concluir' })).toHaveLength(0);
  await user.click(within(dc05Card()).getByRole('button', { name: 'Retomar' }));
  await user.click(within(dc05Card()).getByRole('button', { name: 'Pausar' }));
  await user.click(within(dc05Card()).getByRole('button', { name: 'Retomar' }));
  await user.click(within(dc05Card()).getByRole('button', { name: 'Concluir' }));
  expect(within(dc05Card()).getByText('Concluída')).toBeInTheDocument();
  expect(useScenarioStore.getState().productionExecutions['lot-271']).toMatchObject({ status: 'COMPLETED', producedQuantity: 70, plannedQuantity: 70 });
});
