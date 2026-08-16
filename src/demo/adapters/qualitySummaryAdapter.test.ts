import { describe, expect, it } from 'vitest';
import { fundicaoDcProductionExecutionFixture } from '../fixtures/fundicaoDcProductionExecution';
import { fundicaoDcScenario } from '../scenarios/fundicaoDcScenario';
import { computeFundicaoDcQualitySummary, computeFundicaoDcShiftQualitySummaries } from './qualitySummaryAdapter';

const executionsByLot = Object.fromEntries(fundicaoDcProductionExecutionFixture.map((execution) => [execution.lotId, execution]));
const definition = fundicaoDcScenario.productionScheduling;
const currentTime = fundicaoDcScenario.currentScenarioTime;

describe('computeFundicaoDcQualitySummary', () => {
  it('totals Produced/Good/Reject/Rework for the day and ranks DC04 as the main loss', () => {
    const day = computeFundicaoDcQualitySummary(definition, executionsByLot, currentTime);
    expect(day).toMatchObject({ produced: 209, good: 191, reject: 12, rework: 6 });
    expect(day.qualityRate).toBeCloseTo(0.9139, 3);
    expect(day.losses.map((loss) => loss.resourceId)).toEqual(['DC04', 'DC03', 'DC01', 'DC02']);
  });
});

describe('computeFundicaoDcShiftQualitySummaries', () => {
  const shifts = computeFundicaoDcShiftQualitySummaries(definition, executionsByLot, currentTime);

  it('allocates DC02 alone to Turno 1 (98% quality) and the other four to Turno 2', () => {
    const turno1 = shifts.find((shift) => shift.shiftId === 'SHIFT_1')!;
    const turno2 = shifts.find((shift) => shift.shiftId === 'SHIFT_2')!;
    expect(turno1).toMatchObject({ status: 'COMPLETED', produced: 50, good: 49, reject: 1, rework: 0 });
    expect(turno1.qualityRate).toBeCloseTo(0.98, 3);
    expect(turno2).toMatchObject({ status: 'IN_PROGRESS', produced: 159, good: 142, reject: 11, rework: 6 });
  });

  it('reports Turno 3 as N/A rather than a fabricated zero rate', () => {
    const turno3 = shifts.find((shift) => shift.shiftId === 'SHIFT_3')!;
    expect(turno3.produced).toBe(0);
    expect(turno3.qualityRate).toBeNull();
  });
});
