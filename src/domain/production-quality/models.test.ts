import { describe, expect, it } from 'vitest';
import { fundicaoDcIdealCycleTimeSecondsFixture } from '../../demo/fixtures/fundicaoDcIdealCycleTime';
import { fundicaoDcProductionExecutionFixture } from '../../demo/fixtures/fundicaoDcProductionExecution';
import { fundicaoDcQualityConfirmationsFixture } from '../../demo/fixtures/fundicaoDcQualityConfirmations';
import { fundicaoDcScenario } from '../../demo/scenarios/fundicaoDcScenario';
import { assessPerformanceFoundation, isValidQualityConfirmation, knownRunTimeMinutes, mainLosses, qualityRate, qualitySummary } from './models';
import type { ProductionEvent } from '../production-monitoring/models';

const currentTime = fundicaoDcScenario.currentScenarioTime;
const executionByLot = Object.fromEntries(fundicaoDcProductionExecutionFixture.map((execution) => [execution.lotId, execution]));
const lots = fundicaoDcScenario.productionScheduling.lots;
const lot = (id: string) => lots.find((item) => item.id === id)!;

describe('isValidQualityConfirmation', () => {
  it('holds Good + Reject + Rework <= Produced for every demonstrative confirmation', () => {
    for (const confirmation of fundicaoDcQualityConfirmationsFixture) expect(isValidQualityConfirmation(confirmation)).toBe(true);
  });
  it('rejects a confirmation that exceeds Produced', () => {
    expect(isValidQualityConfirmation({ ...fundicaoDcQualityConfirmationsFixture[0], goodQuantity: 1000 })).toBe(false);
  });
});

describe('qualityRate', () => {
  it('computes Good / Produced', () => {
    expect(qualityRate({ producedQuantity: 72, goodQuantity: 68 })).toBeCloseTo(68 / 72);
  });
  it('returns null when nothing was produced yet (DC05)', () => {
    expect(qualityRate({ producedQuantity: 0, goodQuantity: 0 })).toBeNull();
  });
});

describe('qualitySummary', () => {
  it('aggregates Produced/Good/Reject/Rework across the four confirmed Lots', () => {
    expect(qualitySummary(fundicaoDcQualityConfirmationsFixture)).toEqual({ produced: 209, good: 191, reject: 12, rework: 6 });
  });
});

describe('mainLosses', () => {
  it('ranks DC04 (7 rejects) above DC03 (6 rework) and DC01 (4 rejects)', () => {
    const ranked = mainLosses(fundicaoDcQualityConfirmationsFixture).map((confirmation) => confirmation.resourceId);
    expect(ranked).toEqual(['DC04', 'DC03', 'DC01', 'DC02']);
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
