import { describe, expect, it } from 'vitest';
import { accumulatedProducedQuantity, buildProductionConfirmation, confirmedQuantityByLot, validateConfirmationIncrement } from './models';

const build = (increment: number, id = 'c1') => buildProductionConfirmation({ id, requirementId: 'lot-sd-507', resourceId: 'DC01', operatorId: 'operator-01', componentId: '44C-E5421-W0', sourceLineCLot: '251', confirmedAt: '2026-07-10T09:15:00-03:00', increment, dataOrigin: 'USER_SIMULATION' });

describe('Capability 06 — Production Confirmation (Section 4/5/6/7/8/9)', () => {
  it('multiple confirmations accumulate — SUM, never overwrite', () => {
    const confirmations = [build(30, 'c1'), build(25, 'c2'), build(20, 'c3')];
    expect(accumulatedProducedQuantity(confirmations)).toBe(75);
  });

  it('increment must be greater than zero', () => {
    expect(validateConfirmationIncrement({ executionStatus: 'IN_PROGRESS', increment: 0, plannedQuantity: 100, accumulated: 30 })).toEqual({ kind: 'MUST_BE_POSITIVE' });
    expect(validateConfirmationIncrement({ executionStatus: 'IN_PROGRESS', increment: -5, plannedQuantity: 100, accumulated: 30 })).toEqual({ kind: 'MUST_BE_POSITIVE' });
  });

  it('increment must be an integer — no fractions this round', () => {
    expect(validateConfirmationIncrement({ executionStatus: 'IN_PROGRESS', increment: 10.5, plannedQuantity: 100, accumulated: 30 })).toEqual({ kind: 'MUST_BE_INTEGER' });
  });

  it('cannot exceed the planned balance — reports the exact remaining amount', () => {
    expect(validateConfirmationIncrement({ executionStatus: 'IN_PROGRESS', increment: 30, plannedQuantity: 100, accumulated: 80 })).toEqual({ kind: 'EXCEEDS_PLANNED', remaining: 20 });
  });

  it('an increment landing exactly on the planned balance is valid', () => {
    expect(validateConfirmationIncrement({ executionStatus: 'IN_PROGRESS', increment: 20, plannedQuantity: 100, accumulated: 80 })).toBeNull();
  });

  it('confirmation requires the Requirement to be RUNNING — NOT_STARTED and PAUSED and COMPLETED are all rejected', () => {
    expect(validateConfirmationIncrement({ executionStatus: 'NOT_STARTED', increment: 10, plannedQuantity: 100, accumulated: 0 })).toEqual({ kind: 'REQUIRES_RUNNING' });
    expect(validateConfirmationIncrement({ executionStatus: 'PAUSED', increment: 10, plannedQuantity: 100, accumulated: 0 })).toEqual({ kind: 'REQUIRES_RUNNING' });
    expect(validateConfirmationIncrement({ executionStatus: 'COMPLETED', increment: 10, plannedQuantity: 100, accumulated: 100 })).toEqual({ kind: 'REQUIRES_RUNNING' });
  });

  it('confirmation captures the actual Resource, not Primary/Reserve', () => {
    const confirmation = build(20);
    expect(confirmation.resourceId).toBe('DC01');
  });

  it('confirmation captures the operator inherited from the active Execution', () => {
    const confirmation = build(20);
    expect(confirmation.operatorId).toBe('operator-01');
  });

  it('confirmation captures the Session Operational Clock instant, never Date.now()', () => {
    const confirmation = build(20);
    expect(confirmation.confirmedAt).toBe('2026-07-10T09:15:00-03:00');
  });

  it('confirmation carries traceability to Component and Source Line C Lot (Section 15)', () => {
    const confirmation = build(20);
    expect(confirmation.componentId).toBe('44C-E5421-W0');
    expect(confirmation.sourceLineCLot).toBe('251');
  });

  it('total count derives from confirmations, grouped by Requirement — confirmedQuantityByLot', () => {
    const byLot = confirmedQuantityByLot({ 'lot-sd-507': [build(30, 'c1'), build(20, 'c2')], 'lot-sd-509': [build(15, 'c3')] });
    expect(byLot).toEqual({ 'lot-sd-507': 50, 'lot-sd-509': 15 });
  });

  it('a Requirement with no confirmations yet accumulates to zero — UNKNOWN (no confirmation array entry) stays distinct from a confirmed zero, which is never producible this round', () => {
    expect(accumulatedProducedQuantity([])).toBe(0);
  });
});
