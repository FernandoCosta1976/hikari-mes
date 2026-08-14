import { scenarioDefinitionAdapter } from '../adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from './scenarioStore';

test('initializes and atomically resets the scenario', () => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc')!;
  useScenarioStore.getState().initializeScenario(fundicaoDcScenario);
  expect(useScenarioStore.getState().definition?.id).toBe('fundicao-dc');
  expect(useScenarioStore.getState().initialized).toBe(true);
  useScenarioStore.getState().selectDateOffset(2);
  useScenarioStore.getState().filterByDestination('ENGINEERING');
  useScenarioStore.getState().activateWf001Scenario('SCN-WF001-06');
  useScenarioStore.getState().resetScenario();
  expect(useScenarioStore.getState().definition?.id).toBe('fundicao-dc');
  expect(useScenarioStore.getState().initialized).toBe(true);
  expect(useScenarioStore.getState().selectedDateOffset).toBe(0);
  expect(useScenarioStore.getState().selectedDestination).toBe('ALL');
  expect(useScenarioStore.getState().activeWf001ScenarioId).toBe('SCN-WF001-01');
});
