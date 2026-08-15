import { describe, expect, test } from 'vitest';
import { fundicaoDcScenario } from '../../demo/scenarios/fundicaoDcScenario';
import { materialResourceEligibilityAdapter } from '../../demo/adapters/materialResourceEligibilityAdapter';
import { fundicaoDcMaterialResourceEligibilityFixture } from '../../demo/fixtures/fundicaoDcMaterialResourceEligibility';
import { minutesBetween } from './temporalMath';
import { lotOverlapsBreak, shiftForLot } from './shifts';
import { validateScheduledResourcePlan } from './calculations';

const definition = fundicaoDcScenario.productionScheduling;
const businessDate = definition.schedules[0].businessDate;
const lots = definition.lots.filter((lot) => !lot.id.includes('-d'));

describe('demonstrative 24-hour shift plan', () => {
  test('defines exactly three shifts with three governed demonstrative breaks each', () => {
    expect(definition.shifts).toHaveLength(3);
    for (const shift of definition.shifts) expect(shift.breaks).toHaveLength(3);
    for (const shift of definition.shifts) {
      expect(minutesBetween(`${businessDate}T${shift.breaks[0].startTime}:00-03:00`, `${businessDate}T${shift.breaks[0].endTime}:00-03:00`)).toBe(15);
      expect(minutesBetween(`${businessDate}T${shift.breaks[1].startTime}:00-03:00`, `${businessDate}T${shift.breaks[1].endTime}:00-03:00`)).toBe(45);
      expect(minutesBetween(`${businessDate}T${shift.breaks[2].startTime}:00-03:00`, `${businessDate}T${shift.breaks[2].endTime}:00-03:00`)).toBe(15);
    }
  });

  test('keeps every Lot inside exactly one shift while allowing planned-break overlap', () => {
    for (const lot of lots) {
      expect(definition.shifts.filter((shift) => shiftForLot(lot, [shift], businessDate))).toHaveLength(1);
    }
    expect(lots.some((lot) => definition.shifts.some((shift) => shift.breaks.some((plannedBreak) => lotOverlapsBreak(lot, plannedBreak, businessDate))))).toBe(true);
    expect(lotOverlapsBreak(lots.find((lot) => lot.id === 'lot-251')!, definition.shifts[0].breaks[0], businessDate)).toBe(true);
    expect(lotOverlapsBreak(lots.find((lot) => lot.id === 'lot-254')!, definition.shifts[0].breaks[1], businessDate)).toBe(true);
  });

  test('reconciles the exact daily and per-shift commitments and governed Lot-size mix', () => {
    expect(lots).toHaveLength(27);
    expect(lots.reduce((sum, lot) => sum + lot.quantity, 0)).toBe(2000);
    expect(lots.filter((lot) => lot.quantity === 100)).toHaveLength(9);
    expect(lots.filter((lot) => lot.quantity === 70)).toHaveLength(10);
    expect(lots.filter((lot) => lot.quantity === 50)).toHaveLength(8);
    expect(definition.shifts.map((shift) => lots.filter((lot) => shiftForLot(lot, [shift], businessDate)).reduce((sum, lot) => sum + lot.quantity, 0))).toEqual([570, 830, 600]);
    expect(definition.shifts.map((shift) => lots.filter((lot) => shiftForLot(lot, [shift], businessDate)).length)).toEqual([7, 12, 8]);
  });

  test('keeps Resource eligibility and same-Resource overlap invariants across the full day', () => {
    const eligibilities = materialResourceEligibilityAdapter(fundicaoDcMaterialResourceEligibilityFixture);
    expect(validateScheduledResourcePlan(lots, eligibilities)).toEqual([]);
    expect(lots.some((lot, index) => lots.slice(index + 1).some((candidate) => lot.scheduledResourceId !== candidate.scheduledResourceId && lot.scheduledStart < candidate.scheduledFinish && candidate.scheduledStart < lot.scheduledFinish))).toBe(true);
  });
});
