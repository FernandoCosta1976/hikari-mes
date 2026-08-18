import { scenarioDefinitionAdapter } from '../adapters/scenarioDefinitionAdapter';
import { activeEventForLot } from '../../domain/production-monitoring/models';
import { accumulatedQuality, classifiedQuantity, qualityRate } from '../../domain/production-quality/models';
import { selectAllProductionEvents, selectAllQualityConfirmations, selectConfirmedQuantityByLotId, useScenarioStore } from './scenarioStore';

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

describe('Capability 08 — Registrar Parada / Retomar Produção materializes a governed Production Event (Section 5/6/7/26/27)', () => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc-legacy')!;

  beforeEach(() => {
    useScenarioStore.getState().initializeScenario(fundicaoDcScenario);
    useScenarioStore.getState().resetScenario();
  });

  test('Pause opens a Production Event using the Session Clock, the actual Resource and the actual Operator — never Date.now()', () => {
    useScenarioStore.getState().startLotExecution('lot-271');
    const clockAtStart = useScenarioStore.getState().sessionClock!;
    const execution = useScenarioStore.getState().productionExecutions['lot-271'];
    useScenarioStore.getState().pauseLotExecution('lot-271', 'EQUIPMENT_FAILURE', 'Correia rompida');
    const event = activeEventForLot(useScenarioStore.getState().productionEvents['lot-271'] ?? [], 'lot-271');
    expect(event).toBeDefined();
    expect(event!.status).toBe('ACTIVE');
    expect(event!.eventType).toBe('EQUIPMENT_FAILURE');
    expect(event!.observation).toBe('Correia rompida');
    expect(event!.resourceId).toBe(execution.resourceId);
    expect(event!.operator).toBeTruthy();
    expect(event!.dataOrigin).toBe('USER_SIMULATION');
    // Deterministic — the event's startedAt is the advanced Session Clock, strictly after the pre-pause clock.
    expect(Date.parse(event!.startedAt)).toBeGreaterThan(Date.parse(clockAtStart));
    expect(useScenarioStore.getState().sessionClock).toBe(event!.startedAt);
  });

  test('Resume closes the SAME open Event — never asks for the reason again, endedAt matches the new Session Clock', () => {
    useScenarioStore.getState().startLotExecution('lot-271');
    useScenarioStore.getState().pauseLotExecution('lot-271', 'MATERIAL_SHORTAGE');
    const opened = activeEventForLot(useScenarioStore.getState().productionEvents['lot-271'] ?? [], 'lot-271')!;
    useScenarioStore.getState().resumeLotExecution('lot-271');
    const events = useScenarioStore.getState().productionEvents['lot-271'] ?? [];
    expect(events).toHaveLength(1); // resume never creates a second Event
    expect(events[0].eventId).toBe(opened.eventId);
    expect(events[0].status).toBe('CLOSED');
    expect(events[0].endedAt).toBe(useScenarioStore.getState().sessionClock);
    expect(activeEventForLot(events, 'lot-271')).toBeUndefined();
  });

  test('a second Pause/Resume cycle on the same Requirement opens a distinct second Event — the history accumulates, never overwrites', () => {
    useScenarioStore.getState().startLotExecution('lot-271');
    useScenarioStore.getState().pauseLotExecution('lot-271', 'TOOLING');
    useScenarioStore.getState().resumeLotExecution('lot-271');
    useScenarioStore.getState().pauseLotExecution('lot-271', 'OTHER');
    const events = useScenarioStore.getState().productionEvents['lot-271'] ?? [];
    expect(events).toHaveLength(2);
    expect(events[0].status).toBe('CLOSED');
    expect(events[1].status).toBe('ACTIVE');
    expect(events[1].eventType).toBe('OTHER');
  });

  test('Reset restores the exact Event baseline — live Pause/Resume events are discarded, seeded Events are not altered', () => {
    const seedEvents = useScenarioStore.getState().productionEvents;
    useScenarioStore.getState().startLotExecution('lot-271');
    useScenarioStore.getState().pauseLotExecution('lot-271', 'EQUIPMENT_FAILURE');
    expect(useScenarioStore.getState().productionEvents['lot-271']).toHaveLength(1);
    useScenarioStore.getState().resetScenario();
    expect(useScenarioStore.getState().productionEvents['lot-271']).toBeUndefined();
    expect(useScenarioStore.getState().productionEvents).toEqual(seedEvents);
  });

  test('selectAllProductionEvents flattens the per-Requirement Event map into the single source every screen reads', () => {
    useScenarioStore.getState().startLotExecution('lot-271');
    useScenarioStore.getState().pauseLotExecution('lot-271', 'EQUIPMENT_FAILURE');
    const flat = selectAllProductionEvents(useScenarioStore.getState());
    expect(flat.some((event) => event.lotId === 'lot-271' && event.status === 'ACTIVE')).toBe(true);
  });
});

/**
 * Capability 09 — Registrar Qualidade (Section 3/5/8/31): lot-sd-507 is the
 * ONE reference Requirement seeded with a Pending Classification balance
 * (Produced 65, Classified 50, Pending 15) — the same demonstrative fact
 * used by the E2E journey, exercised here at the store layer.
 */
describe('Capability 09 — Registrar Qualidade (confirmQuality)', () => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc')!;

  beforeEach(() => {
    useScenarioStore.getState().initializeScenario(fundicaoDcScenario);
    useScenarioStore.getState().resetScenario();
  });

  test('accumulates multiple Quality Confirmations for the same Requirement, each with a distinct id — never overwrites', () => {
    expect(useScenarioStore.getState().productionQualityConfirmations['lot-sd-507']).toHaveLength(1); // seed
    useScenarioStore.getState().confirmQuality('lot-sd-507', 10, 3, 'PROCESS_DEFECT');
    useScenarioStore.getState().confirmQuality('lot-sd-507', 2, 0);
    const all = useScenarioStore.getState().productionQualityConfirmations['lot-sd-507'];
    expect(all).toHaveLength(3);
    expect(new Set(all.map((c) => c.id)).size).toBe(3);
    expect(accumulatedQuality(all)).toEqual({ good: 48 + 10 + 2, reject: 2 + 3, rework: 0 });
  });

  test('cannot classify beyond the Pending balance — an over-limit increment is rejected, state unchanged', () => {
    const before = useScenarioStore.getState().productionQualityConfirmations['lot-sd-507'];
    useScenarioStore.getState().confirmQuality('lot-sd-507', 14, 2, 'DIMENSIONAL'); // Pending is 15, this asks for 16
    expect(useScenarioStore.getState().productionQualityConfirmations['lot-sd-507']).toBe(before);
  });

  test('Reject > 0 without a reasonCode is rejected — state unchanged', () => {
    const before = useScenarioStore.getState().productionQualityConfirmations['lot-sd-507'];
    useScenarioStore.getState().confirmQuality('lot-sd-507', 0, 2);
    expect(useScenarioStore.getState().productionQualityConfirmations['lot-sd-507']).toBe(before);
  });

  test('registering Quality changes the Quality Rate but never Produced (Capability 06 aggregate) nor Execution Status', () => {
    const producedBefore = selectConfirmedQuantityByLotId(useScenarioStore.getState())['lot-sd-507'];
    const statusBefore = useScenarioStore.getState().productionExecutions['lot-sd-507'].status;
    useScenarioStore.getState().confirmQuality('lot-sd-507', 10, 5, 'VISUAL');
    const state = useScenarioStore.getState();
    expect(selectConfirmedQuantityByLotId(state)['lot-sd-507']).toBe(producedBefore);
    expect(state.productionExecutions['lot-sd-507'].status).toBe(statusBefore);
    const totals = accumulatedQuality(state.productionQualityConfirmations['lot-sd-507']);
    expect(qualityRate(totals.good, classifiedQuantity(totals))).toBeCloseTo(58 / 65, 5);
  });

  test('Reset restores the exact Quality Confirmation baseline — user classifications are discarded', () => {
    const seed = useScenarioStore.getState().productionQualityConfirmations;
    useScenarioStore.getState().confirmQuality('lot-sd-507', 10, 5, 'VISUAL');
    expect(useScenarioStore.getState().productionQualityConfirmations['lot-sd-507']).toHaveLength(2);
    useScenarioStore.getState().resetScenario();
    expect(useScenarioStore.getState().productionQualityConfirmations).toEqual(seed);
  });

  test('selectAllQualityConfirmations flattens the per-Requirement map into the single source every screen reads', () => {
    useScenarioStore.getState().confirmQuality('lot-sd-507', 10, 5, 'VISUAL');
    const flat = selectAllQualityConfirmations(useScenarioStore.getState());
    expect(flat.some((c) => c.lotId === 'lot-sd-507' && c.goodQuantity === 10 && c.rejectQuantity === 5)).toBe(true);
  });
});
