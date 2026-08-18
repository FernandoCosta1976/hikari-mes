import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { selectConfirmedQuantityByLotId, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
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
test('starts, pauses, resumes, registers production incrementally and completes once confirmed quantity reaches Planned Quantity', async () => {
  const user = userEvent.setup(); renderWithFoundation(<ProductionExecutionPage />);
  await user.click(screen.getByRole('button', { name: 'Iniciar produção' }));
  const board = screen.getByRole('region', { name: 'Situação das cinco máquinas' });
  const dc05Card = () => within(board).getByText('DC05').closest('article')!;
  await user.selectOptions(screen.getByLabelText('Motivo da pausa na DC05'), 'QUALITY'); await user.click(within(dc05Card()).getByRole('button', { name: 'Pausar' }));
  expect(useScenarioStore.getState().productionExecutions['lot-271']).toMatchObject({ status: 'PAUSED', pauses: [{ reason: 'QUALITY' }] });
  await user.click(within(dc05Card()).getByRole('button', { name: 'Retomar' }));
  // Concluir stays hidden until the confirmed Production total reaches Planned Quantity (Capability 06) — no
  // longer a Session Clock/Scheduled Finish convention.
  expect(within(dc05Card()).queryAllByRole('button', { name: 'Concluir' })).toHaveLength(0);
  await user.type(within(dc05Card()).getByLabelText('Quantidade produzida na DC05'), '30');
  await user.click(within(dc05Card()).getByRole('button', { name: 'Registrar produção' }));
  expect(selectConfirmedQuantityByLotId(useScenarioStore.getState())['lot-271']).toBe(30);
  expect(within(dc05Card()).queryAllByRole('button', { name: 'Concluir' })).toHaveLength(0);
  await user.type(within(dc05Card()).getByLabelText('Quantidade produzida na DC05'), '40');
  await user.click(within(dc05Card()).getByRole('button', { name: 'Registrar produção' }));
  expect(selectConfirmedQuantityByLotId(useScenarioStore.getState())['lot-271']).toBe(70);
  await user.click(within(dc05Card()).getByRole('button', { name: 'Concluir' }));
  expect(within(dc05Card()).getByText('Concluída')).toBeInTheDocument();
  expect(useScenarioStore.getState().productionExecutions['lot-271']).toMatchObject({ status: 'COMPLETED', plannedQuantity: 70 });
});
