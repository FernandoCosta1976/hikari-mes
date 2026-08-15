import { expect, test } from 'vitest';
import { compareScheduleLots, projectedAvailableQuantity, reconcileProductionOrder, validateScheduledResourcePlan } from './calculations';
import { fundicaoDcScenario } from '../../demo/scenarios/fundicaoDcScenario';
import { materialResourceEligibilityAdapter } from '../../demo/adapters/materialResourceEligibilityAdapter';
import { fundicaoDcMaterialResourceEligibilityFixture } from '../../demo/fixtures/fundicaoDcMaterialResourceEligibility';

const data = fundicaoDcScenario.productionScheduling;

test('reconciles one Production Order with multiple Lots without conflating identities', () => {
  const result = reconcileProductionOrder(data.productionOrders[0], data.lots);
  expect(result).toEqual({ status: 'MATCHED', orderQuantity: 760, correlatedLotsQuantity: 760, difference: 0 });
  expect(data.productionOrders[0].correlatedLotIds).toHaveLength(10);
});

test('reports divergence without auto-correction', () => {
  const result = reconcileProductionOrder({ ...data.productionOrders[0], quantity: 800 }, data.lots);
  expect(result.status).toBe('DIVERGENT');
  expect(result.difference).toBe(40);
});

test('calculates demonstrative projected available quantity from governed inputs', () => {
  expect(projectedAvailableQuantity(data.bufferPositions[0])).toBe(310);
});

test('detects schedule-version movement, time and quantity changes', () => {
  const previous = [data.lots[0], data.lots[1]];
  const active = [{ ...data.lots[1], quantity: 120, scheduledStart: '2025-05-15T18:00:00-03:00' }, data.lots[0]];
  expect(compareScheduleLots(previous, active)).toEqual([
    { lotId: 'lot-252', changes: ['MOVED', 'TIME_CHANGED', 'QUANTITY_CHANGED'] },
    { lotId: 'lot-251', changes: ['MOVED'] },
  ]);
});

test('keeps every demonstrative Lot eligible, assigned to a Foundry DC Resource and free of same-Resource overlap', () => {
  const currentLots = data.lots.filter((lot) => !lot.id.includes('-d'));
  const eligibilities = materialResourceEligibilityAdapter(fundicaoDcMaterialResourceEligibilityFixture);
  expect(validateScheduledResourcePlan(currentLots, eligibilities)).toEqual([]);
  expect(new Set(currentLots.map((lot) => lot.scheduledResourceId))).toEqual(new Set(['DC01', 'DC02', 'DC03', 'DC04', 'DC05']));
  expect(currentLots.every((lot) => !('dispatchedResourceId' in lot) && !('actualResourceId' in lot))).toBe(true);
});

test('detects an ineligible scheduled Resource and same-Resource overlap while allowing parallel Lots on different Resources', () => {
  const eligibilities = materialResourceEligibilityAdapter(fundicaoDcMaterialResourceEligibilityFixture);
  const first = data.lots[0];
  const invalidEligibility = { ...data.lots[1], scheduledResourceId: 'DC02' as const };
  const overlappingSameResource = { ...data.lots[4], scheduledResourceId: first.scheduledResourceId, scheduledStart: first.scheduledStart, scheduledFinish: first.scheduledFinish };
  expect(validateScheduledResourcePlan([first, invalidEligibility, overlappingSameResource], eligibilities)).toEqual([
    { type: 'INELIGIBLE_RESOURCE', lotId: invalidEligibility.id },
    { type: 'SAME_RESOURCE_OVERLAP', lotIds: [first.id, overlappingSameResource.id] },
  ]);
  expect(validateScheduledResourcePlan([first, { ...data.lots[3], scheduledStart: first.scheduledStart, scheduledFinish: first.scheduledFinish }], eligibilities)).toEqual([]);
});
