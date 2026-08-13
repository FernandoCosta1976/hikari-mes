import { expect, test } from 'vitest';
import { compareScheduleLots, projectedAvailableQuantity, reconcileProductionOrder } from './calculations';
import { fundicaoDcScenario } from '../../demo/scenarios/fundicaoDcScenario';

const data = fundicaoDcScenario.productionScheduling;

test('reconciles one Production Order with multiple Lots without conflating identities', () => {
  const result = reconcileProductionOrder(data.productionOrders[0], data.lots);
  expect(result).toEqual({ status: 'MATCHED', orderQuantity: 300, correlatedLotsQuantity: 300, difference: 0 });
  expect(data.productionOrders[0].correlatedLotIds).toEqual(['lot-251', 'lot-252', 'lot-253']);
});

test('reports divergence without auto-correction', () => {
  const result = reconcileProductionOrder({ ...data.productionOrders[0], quantity: 340 }, data.lots);
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
