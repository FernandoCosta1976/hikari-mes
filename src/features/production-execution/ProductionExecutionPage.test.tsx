import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { ProductionExecutionPage } from './ProductionExecutionPage';

beforeEach(() => { useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false }); useScenarioStore.getState().initializeScenario(scenarioDefinitionAdapter.findById('fundicao-dc')!); useScenarioStore.getState().resetScenario(); });
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
test('starts, updates, pauses, resumes and completes explicitly', async () => {
  const user = userEvent.setup(); renderWithFoundation(<ProductionExecutionPage />);
  await user.click(screen.getByRole('button', { name: 'Iniciar produção' }));
  const quantity = screen.getByLabelText('Quantidade produzida na DC05'); await user.clear(quantity); await user.type(quantity, '33');
  await user.selectOptions(screen.getByLabelText('Motivo da pausa na DC05'), 'QUALITY'); await user.click(screen.getAllByRole('button', { name: 'Pausar' }).at(-1)!);
  expect(useScenarioStore.getState().productionExecutions['lot-271']).toMatchObject({ status: 'PAUSED', pauses: [{ reason: 'QUALITY' }] }); await user.click(screen.getAllByRole('button', { name: 'Retomar' }).at(-1)!); await user.click(screen.getAllByRole('button', { name: 'Concluir' }).at(-1)!);
  expect(screen.getAllByText('Concluída').length).toBeGreaterThan(1); expect(useScenarioStore.getState().productionExecutions['lot-271']).toMatchObject({ producedQuantity: 33, plannedQuantity: 70 });
});
