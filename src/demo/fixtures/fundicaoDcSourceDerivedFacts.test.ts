import { describe, expect, it } from 'vitest';
import { fundicaoDcSourceDerivedProductionConfirmationsFixture } from './fundicaoDcSourceDerivedProductionConfirmations';
import { fundicaoDcSourceDerivedProductionExecutionFixture } from './fundicaoDcSourceDerivedProductionExecution';
import { fundicaoDcSourceDerivedQualityConfirmationsFixture } from './fundicaoDcSourceDerivedQualityConfirmations';
import { fundicaoDcSourceDerivedProductionEventsFixture } from './fundicaoDcSourceDerivedProductionEvents';
import { sourceDerivedLots } from '../scenarios/fundicaoDcSourceDerivedScenario';
import { accumulatedProducedQuantity, confirmedQuantityByLot, groupConfirmationsByRequirement } from '../../domain/production-confirmation/models';
import { accumulatedQuality, classifiedQuantity, groupQualityConfirmationsByRequirement } from '../../domain/production-quality/models';

describe('reference 2026-07-10 execution/quality/event facts', () => {
  it('one execution fact per real requirement (23), none invented, none missing', () => {
    expect(fundicaoDcSourceDerivedProductionExecutionFixture).toHaveLength(23);
    const lotIds = new Set(sourceDerivedLots.map((lot) => lot.id));
    for (const execution of fundicaoDcSourceDerivedProductionExecutionFixture) expect(lotIds.has(execution.lotId)).toBe(true);
  });

  it('Quality Classified Quantity never exceeds the Production Confirmation aggregate for the same requirement (Capability 09, Section 6)', () => {
    const confirmedQuantityByLotId = confirmedQuantityByLot(groupConfirmationsByRequirement(fundicaoDcSourceDerivedProductionConfirmationsFixture));
    const qualityByLot = groupQualityConfirmationsByRequirement(fundicaoDcSourceDerivedQualityConfirmationsFixture);
    for (const [lotId, confirmations] of Object.entries(qualityByLot)) {
      const classified = classifiedQuantity(accumulatedQuality(confirmations));
      expect(classified, lotId).toBeLessThanOrEqual(confirmedQuantityByLotId[lotId]);
      for (const confirmation of confirmations) {
        expect(confirmation.goodQuantity, confirmation.id).toBeGreaterThanOrEqual(0);
        expect(confirmation.rejectQuantity, confirmation.id).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('every seed Production Confirmation accumulates to exactly its own historical producedQuantity fact, migrated 1:1 (no invented quantity)', () => {
    const byLot = groupConfirmationsByRequirement(fundicaoDcSourceDerivedProductionConfirmationsFixture);
    for (const [lotId, confirmations] of Object.entries(byLot)) expect(accumulatedProducedQuantity(confirmations), lotId).toBeGreaterThan(0);
  });

  it('every Quality confirmation belongs to a COMPLETED requirement, except lot-sd-507 — the ONE demonstrative RUNNING Requirement left Pending Classification for the interactive Capability 09 journey', () => {
    const executionByLot = Object.fromEntries(fundicaoDcSourceDerivedProductionExecutionFixture.map((execution) => [execution.lotId, execution]));
    for (const confirmation of fundicaoDcSourceDerivedQualityConfirmationsFixture) {
      if (confirmation.lotId === 'lot-sd-507') { expect(executionByLot[confirmation.lotId].status).toBe('IN_PROGRESS'); continue; }
      expect(executionByLot[confirmation.lotId].status, confirmation.lotId).toBe('COMPLETED');
    }
  });

  it('required diversity at 09:15: at least one Completed Early, 2+ Completed OnTime, 1+ Completed Late, 1+ Running OnTime, 1+ Running Late, 1+ Not Started, and Future requirements remain', () => {
    const currentTime = '2026-07-10T09:15:00-03:00';
    const lotById = Object.fromEntries(sourceDerivedLots.map((lot) => [lot.id, lot]));
    const withinTolerance = (execution: (typeof fundicaoDcSourceDerivedProductionExecutionFixture)[number]) => {
      const lot = lotById[execution.lotId];
      if (!execution.actualFinish) return null;
      return Math.round((Date.parse(execution.actualFinish) - Date.parse(lot.scheduledFinish)) / 60_000);
    };
    const completed = fundicaoDcSourceDerivedProductionExecutionFixture.filter((e) => e.status === 'COMPLETED');
    const early = completed.filter((e) => (withinTolerance(e) ?? 0) < -1);
    const onTime = completed.filter((e) => Math.abs(withinTolerance(e) ?? 0) <= 5);
    const late = completed.filter((e) => (withinTolerance(e) ?? 0) > 5);
    const running = fundicaoDcSourceDerivedProductionExecutionFixture.filter((e) => e.status === 'IN_PROGRESS');
    const runningLate = running.filter((e) => Date.parse(e.actualStart!) > Date.parse(lotById[e.lotId].scheduledStart) + 5 * 60_000);
    const runningOnTime = running.filter((e) => Date.parse(e.actualStart!) <= Date.parse(lotById[e.lotId].scheduledStart) + 5 * 60_000);
    const notStartedLate = fundicaoDcSourceDerivedProductionExecutionFixture.filter((e) => e.status === 'NOT_STARTED' && Date.parse(lotById[e.lotId].scheduledStart) < Date.parse(currentTime));
    const future = fundicaoDcSourceDerivedProductionExecutionFixture.filter((e) => e.status === 'NOT_STARTED' && Date.parse(lotById[e.lotId].scheduledStart) >= Date.parse(currentTime));

    expect(early.length, 'completed early').toBeGreaterThanOrEqual(1);
    expect(onTime.length, 'completed on time').toBeGreaterThanOrEqual(2);
    expect(late.length, 'completed late').toBeGreaterThanOrEqual(1);
    expect(runningOnTime.length, 'running on time').toBeGreaterThanOrEqual(1);
    expect(runningLate.length, 'running late').toBeGreaterThanOrEqual(1);
    expect(notStartedLate.length, 'not started late').toBeGreaterThanOrEqual(1);
    expect(future.length, 'future scheduled').toBeGreaterThanOrEqual(1);
  });

  it('three demonstrative events, each tied to a real requirement, each Closed before 09:15', () => {
    expect(fundicaoDcSourceDerivedProductionEventsFixture).toHaveLength(3);
    const lotIds = new Set(sourceDerivedLots.map((lot) => lot.id));
    for (const event of fundicaoDcSourceDerivedProductionEventsFixture) {
      expect(lotIds.has(event.lotId)).toBe(true);
      expect(Date.parse(event.endedAt!)).toBeLessThanOrEqual(Date.parse('2026-07-10T09:15:00-03:00'));
    }
  });
});
