import { describe, expect, it } from 'vitest';
import { fundicaoDcProductionExecutionFixture } from '../fixtures/fundicaoDcProductionExecution';
import { fundicaoDcScenario } from '../scenarios/fundicaoDcScenario';
import { computeFundicaoDcAdherenceSummary, computeFundicaoDcShiftAdherenceSummaries, rankedExceptions } from './adherenceSummaryAdapter';

const executionsByLot = Object.fromEntries(fundicaoDcProductionExecutionFixture.map((execution) => [execution.lotId, execution]));
const definition = fundicaoDcScenario.productionScheduling;
const currentTime = fundicaoDcScenario.currentScenarioTime;

describe('computeFundicaoDcAdherenceSummary', () => {
  it('counts 3/5 Lots on plan for the day (DC03 stopped, DC04 early)', () => {
    const day = computeFundicaoDcAdherenceSummary(definition, executionsByLot, currentTime);
    expect(day).toMatchObject({ onPlan: 3, total: 5, ratio: 0.6 });
  });
});

describe('computeFundicaoDcShiftAdherenceSummaries', () => {
  const shifts = computeFundicaoDcShiftAdherenceSummaries(definition, executionsByLot, currentTime);

  it('allocates DC02 alone to Turno 1 (fully on plan) and the other four to Turno 2 (Current Time 17:23)', () => {
    const turno1 = shifts.find((shift) => shift.shiftId === 'SHIFT_1')!;
    const turno2 = shifts.find((shift) => shift.shiftId === 'SHIFT_2')!;
    expect(turno1).toMatchObject({ status: 'COMPLETED', onPlan: 1, total: 1, ratio: 1 });
    expect(turno2).toMatchObject({ status: 'IN_PROGRESS', onPlan: 2, total: 4, ratio: 0.5 });
    expect(turno2.rows.map((row) => row.resourceId).sort()).toEqual(['DC01', 'DC03', 'DC04', 'DC05']);
  });

  it('reports Turno 3 with zero tracked Lots rather than a fabricated ratio', () => {
    const turno3 = shifts.find((shift) => shift.shiftId === 'SHIFT_3')!;
    expect(turno3.total).toBe(0);
    expect(turno3.rows).toHaveLength(0);
  });
});

describe('rankedExceptions', () => {
  it('ranks DC03 (stopped) above DC04 (early) and excludes on-plan Resources', () => {
    const day = computeFundicaoDcAdherenceSummary(definition, executionsByLot, currentTime);
    const exceptions = rankedExceptions(day.rows);
    expect(exceptions.map((row) => row.resourceId)).toEqual(['DC03', 'DC04']);
    expect(exceptions[0].impact?.impactedLot.scheduledResourceId).toBe('DC03');
  });
});
