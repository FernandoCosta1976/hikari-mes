import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test } from 'vitest';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { ScenarioResetControl } from './ScenarioResetControl';

beforeEach(() => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!;
  useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false });
  useScenarioStore.getState().initializeScenario(fundicaoDcScenario);
  useScenarioStore.getState().resetScenario();
});

test('shows the Alterado indicator only after a decision, and clears it on reset', async () => {
  const user = userEvent.setup();
  render(<ScenarioResetControl />);
  expect(screen.queryByText('Alterado')).not.toBeInTheDocument();

  useScenarioStore.getState().confirmPreparation('lot-270');
  expect(await screen.findByText('Alterado')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Reiniciar cenário' }));
  const confirm = screen.getByRole('alertdialog', { name: 'Reiniciar cenário demonstrativo?' });
  await user.click(within(confirm).getByRole('button', { name: 'Reiniciar cenário' }));
  expect(screen.queryByText('Alterado')).not.toBeInTheDocument();
});

test('cancel closes the confirmation without discarding decisions', async () => {
  const user = userEvent.setup();
  useScenarioStore.getState().confirmPreparation('lot-270');
  render(<ScenarioResetControl />);
  await user.click(screen.getByRole('button', { name: 'Reiniciar cenário' }));
  await user.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(useScenarioStore.getState().preparationConfirmedByLotId['lot-270']).toBe(true);
});
