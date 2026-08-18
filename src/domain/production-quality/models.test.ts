import { describe, expect, it } from 'vitest';
import { fundicaoDcIdealCycleTimeSecondsFixture } from '../../demo/fixtures/fundicaoDcIdealCycleTime';
import { fundicaoDcProductionExecutionFixture } from '../../demo/fixtures/fundicaoDcProductionExecution';
import { fundicaoDcQualityConfirmationsFixture } from '../../demo/fixtures/fundicaoDcQualityConfirmations';
import { fundicaoDcScenario } from '../../demo/scenarios/fundicaoDcScenario';
import { accumulatedQuality, assessPerformanceFoundation, buildQualityConfirmation, classifiedQuantity, groupQualityConfirmationsByRequirement, knownRunTimeMinutes, pendingClassification, qualityRate, sortByQualityLossDescending, validateQualityIncrement, type ProductionQualityConfirmation } from './models';
import type { ProductionEvent } from '../production-monitoring/models';

const currentTime = fundicaoDcScenario.currentScenarioTime;
const executionByLot = Object.fromEntries(fundicaoDcProductionExecutionFixture.map((execution) => [execution.lotId, execution]));
const lots = fundicaoDcScenario.productionScheduling.lots;
const lot = (id: string) => lots.find((item) => item.id === id)!;

const confirmation = (overrides: Partial<ProductionQualityConfirmation> = {}): ProductionQualityConfirmation => ({
  id: 'q1', lotId: 'lot-265', resourceId: 'DC01', goodQuantity: 0, rejectQuantity: 0, confirmedAt: currentTime, dataOrigin: 'USER_SIMULATION', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED', ...overrides,
});

describe('Capability 09 — Quality aggregation (Section 5/6)', () => {
  it('accumulatedQuality sums good/reject/rework across multiple confirmations for the SAME Requirement — never overwrites', () => {
    const confirmations = [confirmation({ id: 'q1', goodQuantity: 48, rejectQuantity: 2 }), confirmation({ id: 'q2', goodQuantity: 13, rejectQuantity: 2 })];
    expect(accumulatedQuality(confirmations)).toEqual({ good: 61, reject: 4, rework: 0 });
  });

  it('classifiedQuantity = good + reject + rework', () => {
    expect(classifiedQuantity({ good: 61, reject: 4, rework: 0 })).toBe(65);
  });

  it('pendingClassification = Produced - Classified, never negative', () => {
    expect(pendingClassification(65, 50)).toBe(15);
    expect(pendingClassification(65, 65)).toBe(0);
    expect(pendingClassification(65, 70)).toBe(0); // over-classification never reads as negative pending
  });

  it('qualityRate = Good / Classified, never over Produced — a Requirement still Pending is neither good nor bad', () => {
    expect(qualityRate(48, 50)).toBeCloseTo(48 / 50);
    expect(qualityRate(0, 0)).toBeNull();
  });

  it('groupQualityConfirmationsByRequirement groups a flat seed list by Requirement, mirroring groupConfirmationsByRequirement', () => {
    const grouped = groupQualityConfirmationsByRequirement([confirmation({ id: 'q1', lotId: 'lot-a' }), confirmation({ id: 'q2', lotId: 'lot-b' }), confirmation({ id: 'q3', lotId: 'lot-a' })]);
    expect(Object.keys(grouped).sort()).toEqual(['lot-a', 'lot-b']);
    expect(grouped['lot-a']).toHaveLength(2);
  });
});

describe('Capability 09 — validateQualityIncrement (Section 9/11)', () => {
  it('rejects a non-integer increment', () => {
    expect(validateQualityIncrement({ goodIncrement: 1.5, rejectIncrement: 0, pendingQuantity: 10 })).toEqual({ kind: 'MUST_BE_INTEGER' });
  });
  it('rejects a negative increment', () => {
    expect(validateQualityIncrement({ goodIncrement: -1, rejectIncrement: 0, pendingQuantity: 10 })).toEqual({ kind: 'NEGATIVE_QUANTITY' });
  });
  it('requires a positive total — good + reject must be > 0', () => {
    expect(validateQualityIncrement({ goodIncrement: 0, rejectIncrement: 0, pendingQuantity: 10 })).toEqual({ kind: 'REQUIRES_POSITIVE_TOTAL' });
  });
  it('cannot classify more than the Pending balance — reports the exact figure', () => {
    expect(validateQualityIncrement({ goodIncrement: 8, rejectIncrement: 8, pendingQuantity: 10 })).toEqual({ kind: 'EXCEEDS_PENDING', pending: 10 });
  });
  it('an increment landing exactly on the Pending balance is valid', () => {
    expect(validateQualityIncrement({ goodIncrement: 8, rejectIncrement: 2, pendingQuantity: 10, reasonCode: 'DIMENSIONAL' })).toBeNull();
  });
  it('Reject > 0 requires a reasonCode', () => {
    expect(validateQualityIncrement({ goodIncrement: 0, rejectIncrement: 2, pendingQuantity: 10 })).toEqual({ kind: 'REQUIRES_REASON' });
  });
  it('Reject == 0 never requires a reasonCode', () => {
    expect(validateQualityIncrement({ goodIncrement: 5, rejectIncrement: 0, pendingQuantity: 10 })).toBeNull();
  });
  it('a reasonCode present with Reject > 0 is valid', () => {
    expect(validateQualityIncrement({ goodIncrement: 3, rejectIncrement: 2, pendingQuantity: 10, reasonCode: 'DIMENSIONAL' })).toBeNull();
  });
});

describe('Capability 09 — buildQualityConfirmation', () => {
  it('captures the actual Resource and the Session Clock instant, never Date.now()', () => {
    const built = buildQualityConfirmation({ id: 'q9', lotId: 'lot-sd-507', resourceId: 'DC01', operator: 'Operador 01 · demonstrativo', goodQuantity: 13, rejectQuantity: 2, reasonCode: 'DIMENSIONAL', confirmedAt: '2026-07-10T09:15:00-03:00', dataOrigin: 'USER_SIMULATION' });
    expect(built.resourceId).toBe('DC01');
    expect(built.confirmedAt).toBe('2026-07-10T09:15:00-03:00');
    expect(built.demonstrative).toBe(true);
  });
});

describe('Capability 09 — sortByQualityLossDescending', () => {
  it('ranks the worst Reject+Rework first and drops rows with zero loss', () => {
    const ranked = sortByQualityLossDescending([
      { resourceId: 'DC01', reject: 4, rework: 0 },
      { resourceId: 'DC03', reject: 0, rework: 6 },
      { resourceId: 'DC04', reject: 7, rework: 0 },
      { resourceId: 'DC02', reject: 0, rework: 0 },
    ]).map((row) => row.resourceId);
    expect(ranked).toEqual(['DC04', 'DC03', 'DC01']);
  });
});

describe('knownRunTimeMinutes', () => {
  it('excludes the ongoing pause from DC03 run time', () => {
    expect(knownRunTimeMinutes(executionByLot['lot-266'], currentTime)).toBe(77);
  });
  it('returns null before a Lot has started (DC05)', () => {
    expect(knownRunTimeMinutes(executionByLot['lot-271'], currentTime)).toBeNull();
  });

  describe('Capability 08 — Section 17/18: with `events` supplied, Run Time subtracts governed Unplanned Downtime, never every execution pause blindly', () => {
    const execution = { ...executionByLot['lot-265'], lotId: 'lot-265', actualStart: '2025-05-15T15:00:00-03:00', actualFinish: undefined, pauses: [] };
    const now = '2025-05-15T16:00:00-03:00'; // 60 min elapsed window

    const event = (overrides: Partial<ProductionEvent>): ProductionEvent => ({ eventId: 'e1', resourceId: execution.resourceId, lotId: 'lot-265', eventType: 'EQUIPMENT_FAILURE', startedAt: '2025-05-15T15:10:00-03:00', endedAt: '2025-05-15T15:20:00-03:00', status: 'CLOSED', dataOrigin: 'USER_SIMULATION', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED', ...overrides });

    it('an Unplanned event (e.g. Falha de equipamento) reduces Run Time', () => {
      expect(knownRunTimeMinutes(execution, now, [event({ eventType: 'EQUIPMENT_FAILURE' })])).toBe(50);
    });

    it('a Planned Stop (Setup/Pausa programada/Refeição) does NOT reduce Run Time', () => {
      expect(knownRunTimeMinutes(execution, now, [event({ eventType: 'SETUP' })])).toBe(60);
      expect(knownRunTimeMinutes(execution, now, [event({ eventType: 'SCHEDULED_BREAK' })])).toBe(60);
      expect(knownRunTimeMinutes(execution, now, [event({ eventType: 'MEAL_BREAK' })])).toBe(60);
    });

    it('an Event for a different Requirement is never subtracted from this one', () => {
      expect(knownRunTimeMinutes(execution, now, [event({ lotId: 'lot-other' })])).toBe(60);
    });

    it('omitting `events` entirely preserves the original pause-based behavior (backward compatible for Lot Health)', () => {
      expect(knownRunTimeMinutes(executionByLot['lot-266'], currentTime)).toBe(77);
    });
  });
});

describe('assessPerformanceFoundation', () => {
  it('prepares Performance facts for a running Resource with a known Ideal Cycle Time', () => {
    const foundation = assessPerformanceFoundation(executionByLot['lot-265'], fundicaoDcIdealCycleTimeSecondsFixture[lot('lot-265').materialId], currentTime);
    expect(foundation.status).toBe('PREPARED');
    expect(foundation.idealCycleTimeSeconds).toBe(72);
  });
  it('marks DC05 as NOT_STARTED instead of inventing a Performance result', () => {
    const foundation = assessPerformanceFoundation(executionByLot['lot-271'], fundicaoDcIdealCycleTimeSecondsFixture[lot('lot-271').materialId], currentTime);
    expect(foundation.status).toBe('NOT_STARTED');
  });
});

describe('Capability 09 — reference fixture invariant (Section 6)', () => {
  it('every seeded Quality Confirmation is a non-negative, well-formed increment', () => {
    for (const item of fundicaoDcQualityConfirmationsFixture) {
      expect(item.goodQuantity).toBeGreaterThanOrEqual(0);
      expect(item.rejectQuantity).toBeGreaterThanOrEqual(0);
      if (item.rejectQuantity > 0) expect(item.reasonCode).toBeDefined();
    }
  });
});
