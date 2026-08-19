import { beforeEach, describe, expect, test } from 'vitest';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { computeOperationalTimeline } from '../../demo/adapters/operationalTimelineAdapter';
import { selectAllProductionEvents, selectProductionExecutions, selectProductionScheduling, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { validateScheduledResourcePlan } from '../production-scheduling/calculations';

/**
 * HIKARI MES — Timeline Unification round. Section 43/44/45/48: the Current
 * Plan produced by the Unified Operational Timeline must never overlap on
 * any Resource, and every screen calling `computeOperationalTimeline` with
 * the same inputs must get back the exact same Original/Current/Actual/
 * Projected signature per Requirement — verified against the REAL reference
 * scenario (fundicao-dc, 2026-07-10 09:15), not a synthetic dataset, and
 * again after a live mutation that triggers a real cascade.
 */
describe('Unified Operational Timeline — invariants against the real reference scenario', () => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc')!;

  beforeEach(() => {
    useScenarioStore.getState().initializeScenario(fundicaoDcScenario);
    useScenarioStore.getState().resetScenario();
  });

  test('Current Plan never overlaps on any Resource at the 09:15 baseline (Section 43)', () => {
    const state = useScenarioStore.getState();
    const definition = selectProductionScheduling(state)!;
    const executionsByLot = selectProductionExecutions(state);
    const events = selectAllProductionEvents(state);
    const currentTime = state.sessionClock ?? state.definition!.currentScenarioTime;
    const timeline = computeOperationalTimeline(definition, executionsByLot, currentTime, events);
    const pseudoLots = timeline.map((entry) => ({ id: entry.requirementId, scheduledResourceId: entry.resourceId, scheduledStart: entry.currentStart, scheduledFinish: entry.currentFinish }));
    const violations = validateScheduledResourcePlan(pseudoLots as never, []);
    const overlaps = violations.filter((violation) => violation.type === 'SAME_RESOURCE_OVERLAP');
    expect(overlaps, JSON.stringify(overlaps)).toEqual([]);
  });

  test('Current Plan still never overlaps after a live delay cascades through a Resource queue (Section 43/44)', () => {
    useScenarioStore.getState().startLotExecution('lot-sd-514');
    useScenarioStore.getState().pauseLotExecution('lot-sd-514', 'EQUIPMENT_FAILURE');
    const state = useScenarioStore.getState();
    const definition = selectProductionScheduling(state)!;
    const executionsByLot = selectProductionExecutions(state);
    const events = selectAllProductionEvents(state);
    const currentTime = state.sessionClock ?? state.definition!.currentScenarioTime;
    const timeline = computeOperationalTimeline(definition, executionsByLot, currentTime, events);
    const pseudoLots = timeline.map((entry) => ({ id: entry.requirementId, scheduledResourceId: entry.resourceId, scheduledStart: entry.currentStart, scheduledFinish: entry.currentFinish }));
    const violations = validateScheduledResourcePlan(pseudoLots as never, []);
    expect(violations.filter((violation) => violation.type === 'SAME_RESOURCE_OVERLAP')).toEqual([]);
  });

  test('cross-screen signature: the SAME requirementId returns an identical Original/Current/Actual/Projected signature on every call with the same inputs (Section 45/48)', () => {
    useScenarioStore.getState().startLotExecution('lot-sd-514');
    useScenarioStore.getState().pauseLotExecution('lot-sd-514', 'TOOLING');
    const state = useScenarioStore.getState();
    const definition = selectProductionScheduling(state)!;
    const executionsByLot = selectProductionExecutions(state);
    const events = selectAllProductionEvents(state);
    const currentTime = state.sessionClock ?? state.definition!.currentScenarioTime;

    // Simulates what Plano, Preparação, Acompanhamento and Aderência each independently call.
    const fromPlano = computeOperationalTimeline(definition, executionsByLot, currentTime, events);
    const fromAcompanhamento = computeOperationalTimeline(definition, executionsByLot, currentTime, events);
    const fromAderencia = computeOperationalTimeline(definition, executionsByLot, currentTime, events);

    for (const entry of fromPlano) {
      const inAcompanhamento = fromAcompanhamento.find((item) => item.requirementId === entry.requirementId)!;
      const inAderencia = fromAderencia.find((item) => item.requirementId === entry.requirementId)!;
      expect(inAcompanhamento).toEqual(entry);
      expect(inAderencia).toEqual(entry);
    }
  });
});
