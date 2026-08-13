import { fundicaoDcScenario } from '../scenarios/fundicaoDcScenario';
import { useScenarioStore } from './scenarioStore';

test('initializes and atomically resets the scenario', () => {
  useScenarioStore.getState().initializeScenario(fundicaoDcScenario);
  expect(useScenarioStore.getState().definition?.id).toBe('fundicao-dc');
  expect(useScenarioStore.getState().initialized).toBe(true);
  useScenarioStore.getState().resetScenario();
  expect(useScenarioStore.getState().definition).toBeNull();
  expect(useScenarioStore.getState().initialized).toBe(false);
});
