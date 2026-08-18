import { describe, expect, it } from 'vitest';
import { fundicaoDcProductionExecutionFixture } from '../fixtures/fundicaoDcProductionExecution';
import { fundicaoDcScenario } from '../scenarios/fundicaoDcScenario';
import { qualityRate } from '../../domain/production-quality/models';
import { computeFundicaoDcQualitySummary, computeFundicaoDcShiftQualitySummaries } from './qualitySummaryAdapter';

const executionsByLot = Object.fromEntries(fundicaoDcProductionExecutionFixture.map((execution) => [execution.lotId, execution]));
const definition = fundicaoDcScenario.productionScheduling;
const currentTime = fundicaoDcScenario.currentScenarioTime;

describe('computeFundicaoDcQualitySummary', () => {
  it('totals Produced/Good/Reject/Rework for the day (only Lots with a known Execution fact and an already-due Scheduled Start) and ranks DC03 as the main loss', () => {
    const day = computeFundicaoDcQualitySummary(definition, executionsByLot, currentTime);
    expect(day).toMatchObject({ produced: 174, good: 163, reject: 5, rework: 6 });
    expect(day.qualityRate).toBeCloseTo(0.9368, 3);
    expect(day.losses.map((loss) => loss.resourceId)).toEqual(['DC03', 'DC01', 'DC02']);
  });

  it('Capability 09 (Section 5/6) — per-Resource rows never over-classify their own Produced total, and the day Quality Rate matches good/classified computed from the SAME totals', () => {
    const day = computeFundicaoDcQualitySummary(definition, executionsByLot, currentTime);
    for (const row of day.rows) {
      expect(row.classified).toBe(row.quality.good + row.quality.reject + row.quality.rework);
      expect(row.classified).toBeLessThanOrEqual(row.producedQuantity);
      expect(row.pending).toBe(row.producedQuantity - row.classified);
    }
    expect(day.classified).toBe(day.good + day.reject + day.rework);
    expect(day.qualityRate).toBeCloseTo(qualityRate(day.good, day.classified)!, 6);
  });
});

describe('computeFundicaoDcShiftQualitySummaries', () => {
  const shifts = computeFundicaoDcShiftQualitySummaries(definition, executionsByLot, currentTime);

  it('allocates DC02 alone to Turno 1 (98% quality) and the other due Lots to Turno 2', () => {
    const turno1 = shifts.find((shift) => shift.shiftId === 'SHIFT_1')!;
    const turno2 = shifts.find((shift) => shift.shiftId === 'SHIFT_2')!;
    expect(turno1).toMatchObject({ status: 'COMPLETED', produced: 50, good: 49, reject: 1, rework: 0 });
    expect(turno1.qualityRate).toBeCloseTo(0.98, 3);
    expect(turno2).toMatchObject({ status: 'IN_PROGRESS', produced: 124, good: 114, reject: 4, rework: 6 });
  });

  it('reports Turno 3 as N/A rather than a fabricated zero rate', () => {
    const turno3 = shifts.find((shift) => shift.shiftId === 'SHIFT_3')!;
    expect(turno3.produced).toBe(0);
    expect(turno3.qualityRate).toBeNull();
  });
});
