import { scenarioDefinitionAdapter } from '../adapters/scenarioDefinitionAdapter';
import { selectConfirmedQuantityByLotId, useScenarioStore } from './scenarioStore';

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

test('controls execution and production confirmation using the shared Session Operational Clock, and restores both on reset', () => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!;
  useScenarioStore.getState().initializeScenario(fundicaoDcScenario); useScenarioStore.getState().resetScenario();
  expect(useScenarioStore.getState().productionExecutions['lot-271'].status).toBe('NOT_STARTED');
  expect(useScenarioStore.getState().sessionClock).toBe(fundicaoDcScenario.currentScenarioTime);
  useScenarioStore.getState().startLotExecution('lot-271');
  expect(useScenarioStore.getState().productionExecutions['lot-271']).toMatchObject({ status: 'IN_PROGRESS', actualStart: fundicaoDcScenario.currentScenarioTime });
  useScenarioStore.getState().confirmProduction('lot-271', 33);
  useScenarioStore.getState().pauseLotExecution('lot-271', 'QUALITY');
  expect(useScenarioStore.getState().productionExecutions['lot-271']).toMatchObject({ status: 'PAUSED', pauses: [{ reason: 'QUALITY' }] });
  expect(selectConfirmedQuantityByLotId(useScenarioStore.getState())['lot-271']).toBe(33);
  // Complete now depends on the confirmed Production total reaching Planned Quantity (Section 18) —
  // never a Session Clock/Scheduled Finish convention. Confirming production never advances the clock
  // (Section 31); only Pause/Resume/Complete do, in fixed deterministic steps.
  useScenarioStore.getState().resumeLotExecution('lot-271');
  useScenarioStore.getState().completeLotExecution('lot-271');
  expect(useScenarioStore.getState().productionExecutions['lot-271'].status).toBe('IN_PROGRESS'); // still below Planned Quantity — Complete is a no-op
  useScenarioStore.getState().confirmProduction('lot-271', 37);
  expect(selectConfirmedQuantityByLotId(useScenarioStore.getState())['lot-271']).toBe(70);
  const clockBeforeComplete = useScenarioStore.getState().sessionClock;
  useScenarioStore.getState().completeLotExecution('lot-271');
  const completed = useScenarioStore.getState().productionExecutions['lot-271'];
  expect(completed.status).toBe('COMPLETED');
  expect(Date.parse(completed.actualFinish!)).toBeGreaterThan(Date.parse(clockBeforeComplete!));
  expect(useScenarioStore.getState().sessionClock).toBe(completed.actualFinish);
  useScenarioStore.getState().resetScenario();
  expect(useScenarioStore.getState().productionExecutions['lot-271']).toMatchObject({ status: 'NOT_STARTED' });
  expect(selectConfirmedQuantityByLotId(useScenarioStore.getState())['lot-271']).toBeUndefined();
  expect(useScenarioStore.getState().sessionClock).toBe(fundicaoDcScenario.currentScenarioTime);
});

test('Capability 06 — each confirmProduction call creates a distinct confirmation (no duplicate ids)', () => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!;
  useScenarioStore.getState().initializeScenario(fundicaoDcScenario); useScenarioStore.getState().resetScenario();
  useScenarioStore.getState().startLotExecution('lot-271');
  useScenarioStore.getState().confirmProduction('lot-271', 20);
  useScenarioStore.getState().confirmProduction('lot-271', 20);
  const confirmations = useScenarioStore.getState().productionConfirmations['lot-271'];
  expect(confirmations).toHaveLength(2);
  expect(new Set(confirmations.map((c) => c.id)).size).toBe(2);
  expect(selectConfirmedQuantityByLotId(useScenarioStore.getState())['lot-271']).toBe(40);
});

test('Capability 06 — a historical (COMPLETED) Requirement rejects new confirmations, and Reset restores its exact seed confirmations', () => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc')!;
  useScenarioStore.getState().initializeScenario(fundicaoDcScenario); useScenarioStore.getState().resetScenario();
  const seedConfirmations = useScenarioStore.getState().productionConfirmations['lot-sd-501'];
  expect(seedConfirmations).toHaveLength(1);
  expect(seedConfirmations[0].dataOrigin).toBe('DEMONSTRATIVE_CONFIRMATION');
  useScenarioStore.getState().confirmProduction('lot-sd-501', 10); // lot-sd-501 is already COMPLETED at baseline
  expect(useScenarioStore.getState().productionConfirmations['lot-sd-501']).toBe(seedConfirmations); // no-op, same array reference
  useScenarioStore.getState().resetScenario();
  expect(useScenarioStore.getState().productionConfirmations['lot-sd-501']).toEqual(seedConfirmations);
});
