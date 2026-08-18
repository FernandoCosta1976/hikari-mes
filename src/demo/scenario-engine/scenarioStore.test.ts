import { scenarioDefinitionAdapter } from '../adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from './scenarioStore';

test('initializes and atomically resets the scenario', () => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!;
  useScenarioStore.getState().initializeScenario(fundicaoDcScenario);
  expect(useScenarioStore.getState().definition?.id).toBe('fundicao-dc-legacy');
  expect(useScenarioStore.getState().initialized).toBe(true);
  useScenarioStore.getState().selectDateOffset(2);
  useScenarioStore.getState().filterByDestination('ENGINEERING');
  useScenarioStore.getState().selectScheduleView('SHIFT_2');
  useScenarioStore.getState().activateWf001Scenario('SCN-WF001-06');
  useScenarioStore.getState().resetScenario();
  expect(useScenarioStore.getState().definition?.id).toBe('fundicao-dc-legacy');
  expect(useScenarioStore.getState().initialized).toBe(true);
  expect(useScenarioStore.getState().selectedDateOffset).toBe(0);
  expect(useScenarioStore.getState().selectedDestination).toBe('ALL');
  expect(useScenarioStore.getState().selectedScheduleView).toBe('24H');
  expect(useScenarioStore.getState().activeWf001ScenarioId).toBe('SCN-WF001-01');
});

test('stores a demonstrative release and clears it on reset', () => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!;
  useScenarioStore.getState().initializeScenario(fundicaoDcScenario);
  useScenarioStore.getState().resetScenario();
  useScenarioStore.getState().releaseLot('lot-251');
  expect(useScenarioStore.getState().productionReleases['lot-251']).toMatchObject({ status: 'RELEASED', demonstrative: true });
  useScenarioStore.getState().releaseLot('lot-267');
  expect(useScenarioStore.getState().productionReleases['lot-267']).toMatchObject({ status: 'BLOCKED_FOR_RELEASE' });
  useScenarioStore.getState().resetScenario();
  expect(useScenarioStore.getState().productionReleases['lot-251']).toBeUndefined();
  expect(useScenarioStore.getState().productionReleases['lot-265']).toMatchObject({ status: 'RELEASED' });
});

test('controls execution using the shared Session Operational Clock and restores the fixture on reset', () => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!;
  useScenarioStore.getState().initializeScenario(fundicaoDcScenario); useScenarioStore.getState().resetScenario();
  expect(useScenarioStore.getState().productionExecutions['lot-271'].status).toBe('NOT_STARTED');
  expect(useScenarioStore.getState().sessionClock).toBe(fundicaoDcScenario.currentScenarioTime);
  useScenarioStore.getState().startLotExecution('lot-271');
  expect(useScenarioStore.getState().productionExecutions['lot-271']).toMatchObject({ status: 'IN_PROGRESS', actualStart: fundicaoDcScenario.currentScenarioTime });
  useScenarioStore.getState().updateLotProducedQuantity('lot-271', 33);
  useScenarioStore.getState().pauseLotExecution('lot-271', 'QUALITY');
  expect(useScenarioStore.getState().productionExecutions['lot-271']).toMatchObject({ status: 'PAUSED', producedQuantity: 33, pauses: [{ reason: 'QUALITY' }] });
  // Pause/Resume/Complete each advance the Session Clock by a fixed, deterministic step (never real time)
  // until it reaches lot-271's own Scheduled Finish (18:00) — Complete then sets produced = planned quantity,
  // matching every other COMPLETED Requirement in the canonical datasets (no manual quantity entry this round).
  useScenarioStore.getState().resumeLotExecution('lot-271'); useScenarioStore.getState().completeLotExecution('lot-271');
  const completed = useScenarioStore.getState().productionExecutions['lot-271'];
  expect(completed).toMatchObject({ status: 'COMPLETED', producedQuantity: 70, plannedQuantity: 70 });
  expect(Date.parse(completed.actualFinish!)).toBeGreaterThanOrEqual(Date.parse('2025-05-15T18:00:00-03:00'));
  expect(useScenarioStore.getState().sessionClock).toBe(completed.actualFinish);
  useScenarioStore.getState().resetScenario();
  expect(useScenarioStore.getState().productionExecutions['lot-271']).toMatchObject({ status: 'NOT_STARTED', producedQuantity: 0 });
  expect(useScenarioStore.getState().sessionClock).toBe(fundicaoDcScenario.currentScenarioTime);
});
