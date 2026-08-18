import { describe, expect, it } from 'vitest';
import { fundicaoDcProductionExecutionFixture } from '../fixtures/fundicaoDcProductionExecution';
import { fundicaoDcScenario } from '../scenarios/fundicaoDcScenario';
import { computeFundicaoDcOeeSummary, computeFundicaoDcShiftOeeSummaries } from './oeeSummaryAdapter';

const executionsByLot = Object.fromEntries(fundicaoDcProductionExecutionFixture.map((execution) => [execution.lotId, execution]));
const definition = fundicaoDcScenario.productionScheduling;
const currentTime = fundicaoDcScenario.currentScenarioTime;

describe('computeFundicaoDcShiftOeeSummaries', () => {
  const summaries = computeFundicaoDcShiftOeeSummaries(definition, executionsByLot, currentTime);

  it('classifies Turno 3 and Turno 1 as completed and Turno 2 as in progress (Current Time 17:23)', () => {
    expect(summaries.map((s) => [s.shiftId, s.status])).toEqual([
      ['SHIFT_3', 'COMPLETED'],
      ['SHIFT_1', 'COMPLETED'],
      ['SHIFT_2', 'IN_PROGRESS'],
    ]);
  });

  it('reports Turno 3 as N/A (no tracked Lot falls in that window), never a fabricated zero', () => {
    const turno3 = summaries.find((s) => s.shiftId === 'SHIFT_3')!;
    expect(turno3.rows).toHaveLength(0);
    expect(turno3.areaAvailability).toBeNull();
    expect(turno3.areaPerformance).toBeNull();
    expect(turno3.areaQuality).toBeNull();
    expect(turno3.areaOee).toBeNull();
  });

  it('allocates DC02 alone to Turno 1 and DC01/DC03/DC04/DC05 to Turno 2', () => {
    const turno1 = summaries.find((s) => s.shiftId === 'SHIFT_1')!;
    const turno2 = summaries.find((s) => s.shiftId === 'SHIFT_2')!;
    expect(turno1.rows.map((r) => r.resourceId)).toEqual(['DC02']);
    expect(turno2.rows.map((r) => r.resourceId).sort()).toEqual(['DC01', 'DC03', 'DC04', 'DC05']);
    expect(turno1.areaOee).toBeCloseTo(0.7510, 3);
    expect(turno2.areaOee).toBeCloseTo(0.6692, 3);
  });

  it('sums Shift Availability/Performance/Quality from the same per-Resource facts as the day summary, not a duplicated formula', () => {
    const day = computeFundicaoDcOeeSummary(definition, executionsByLot, currentTime);
    const allShiftRows = summaries.flatMap((s) => s.rows);
    expect(allShiftRows.map((r) => r.resourceId).sort()).toEqual(day.rows.map((r) => r.resourceId).sort());
    for (const shiftRow of allShiftRows) {
      const dayRow = day.rows.find((r) => r.resourceId === shiftRow.resourceId)!;
      expect(shiftRow.oee).toBe(dayRow.oee);
    }
  });
});
