import { describe, expect, it } from 'vitest';
import { fundicaoDcIdealCycleTimeSecondsFixture } from '../../demo/fixtures/fundicaoDcIdealCycleTime';
import { fundicaoDcProductionConfirmationsFixture } from '../../demo/fixtures/fundicaoDcProductionConfirmations';
import { fundicaoDcProductionExecutionFixture } from '../../demo/fixtures/fundicaoDcProductionExecution';
import { fundicaoDcQualityConfirmationsFixture } from '../../demo/fixtures/fundicaoDcQualityConfirmations';
import { fundicaoDcScenario } from '../../demo/scenarios/fundicaoDcScenario';
import { confirmedQuantityByLot, groupConfirmationsByRequirement } from '../production-confirmation/models';
import { knownRunTimeMinutes } from '../production-quality/models';
import { aggregateAvailability, aggregatePerformance, aggregateQuality, assessAvailability, assessOee, assessPerformance, plannedProductionTimeMinutes, topOeeImpacts, type ResourceOeeRow } from './calculations';

const currentTime = fundicaoDcScenario.currentScenarioTime;
const shifts = fundicaoDcScenario.productionScheduling.shifts;
const lots = fundicaoDcScenario.productionScheduling.lots;
const executionByLot = Object.fromEntries(fundicaoDcProductionExecutionFixture.map((execution) => [execution.lotId, execution]));
const confirmationsByLot = Object.fromEntries(fundicaoDcQualityConfirmationsFixture.map((confirmation) => [confirmation.lotId, confirmation]));
const producedQuantityByLotId = confirmedQuantityByLot(groupConfirmationsByRequirement(fundicaoDcProductionConfirmationsFixture));
const lot = (id: string) => lots.find((item) => item.id === id)!;

function rowFor(lotId: string): ResourceOeeRow {
  const execution = executionByLot[lotId];
  const l = lot(lotId);
  const runTimeMinutes = knownRunTimeMinutes(execution, currentTime);
  const plannedTimeMinutes = plannedProductionTimeMinutes(l, execution, shifts, currentTime);
  const idealCycleTimeSeconds = fundicaoDcIdealCycleTimeSecondsFixture[l.materialId] ?? null;
  const confirmation = confirmationsByLot[lotId];
  const producedQuantity = producedQuantityByLotId[lotId] ?? 0;
  const goodQuantity = confirmation?.goodQuantity ?? null;
  const availability = assessAvailability(runTimeMinutes, plannedTimeMinutes);
  const performance = assessPerformance(idealCycleTimeSeconds, producedQuantity, runTimeMinutes);
  const classified = confirmation ? confirmation.goodQuantity + confirmation.rejectQuantity + (confirmation.reworkQuantity ?? 0) : 0;
  const quality = confirmation && classified > 0 ? confirmation.goodQuantity / classified : null;
  return { resourceId: execution.resourceId, runTimeMinutes, plannedTimeMinutes, idealCycleTimeSeconds, producedQuantity, classifiedQuantity: classified, goodQuantity, availability, performance, quality, oee: assessOee(availability, performance, quality) };
}

const rows = ['lot-265', 'lot-264', 'lot-266', 'lot-268', 'lot-271'].map(rowFor);

describe('plannedProductionTimeMinutes', () => {
  it('counts the gap between Scheduled and Actual Start against Availability for a normal start (DC01)', () => {
    expect(plannedProductionTimeMinutes(lot('lot-265'), executionByLot['lot-265'], shifts, currentTime)).toBe(113);
  });
  it('anchors on Actual Start when it precedes Scheduled Start (DC04 early start)', () => {
    expect(plannedProductionTimeMinutes(lot('lot-268'), executionByLot['lot-268'], shifts, currentTime)).toBe(73);
  });
  it('is not calculable before a Lot starts (DC05)', () => {
    expect(plannedProductionTimeMinutes(lot('lot-271'), executionByLot['lot-271'], shifts, currentTime)).toBeNull();
  });
});

describe('per-Resource OEE', () => {
  it('computes DC01, DC02, DC03, DC04 within the 0..100% domain', () => {
    const [dc01, dc02, dc03, dc04, dc05] = rows;
    expect(dc01.availability).toBeCloseTo(0.9646, 3);
    expect(dc01.performance).toBeCloseTo(0.9138, 3);
    expect(dc01.oee).toBeCloseTo(0.8389, 3);
    expect(dc02.oee).toBeCloseTo(0.7510, 3);
    expect(dc03.availability).toBeCloseTo(0.6814, 3);
    expect(dc03.oee).toBeCloseTo(0.4904, 3);
    expect(dc04.availability).toBe(1);
    expect(dc04.performance).toBeCloseTo(0.8790, 3);
    expect(dc04.performance).toBeLessThan(1);
    expect(dc04.oee).toBeCloseTo(0.7032, 3);
    for (const row of rows) {
      for (const value of [row.availability, row.performance, row.quality, row.oee]) {
        if (value === null) continue;
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
    expect(dc05.availability).toBeNull();
    expect(dc05.performance).toBeNull();
    expect(dc05.quality).toBeNull();
    expect(dc05.oee).toBeNull();
  });
});

describe('area aggregation', () => {
  it('is not a simple average of per-Resource ratios', () => {
    const simpleAverage = rows.filter((row) => row.availability !== null).reduce((sum, row, _, arr) => sum + row.availability! / arr.length, 0);
    const aggregated = aggregateAvailability(rows)!;
    expect(aggregated).not.toBeCloseTo(simpleAverage, 6);
    expect(aggregated).toBeCloseTo(0.8886, 3);
  });
  it('computes area Performance and Quality from totals', () => {
    expect(aggregatePerformance(rows)).toBeCloseTo(0.8611, 3);
    expect(aggregateQuality(rows)).toBeCloseTo(0.9139, 3);
  });
});

describe('topOeeImpacts', () => {
  it('ranks DC03 Availability as the largest known loss', () => {
    const impacts = topOeeImpacts(rows);
    expect(impacts[0].dimension).toBe('AVAILABILITY');
    expect(impacts[0].resourceId).toBe('DC03');
    expect(impacts[0].lossFraction).toBeCloseTo(0.3186, 3);
  });
});
