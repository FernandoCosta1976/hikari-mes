import type { BufferPosition, Lot, ProductionOrder } from './models';

export interface ReconciliationResult {
  status: 'MATCHED' | 'DIVERGENT';
  orderQuantity: number;
  correlatedLotsQuantity: number;
  difference: number;
}

export function reconcileProductionOrder(order: ProductionOrder, lots: readonly Lot[]): ReconciliationResult {
  const correlatedLotsQuantity = lots
    .filter((lot) => order.correlatedLotIds.includes(lot.id))
    .reduce((total, lot) => total + lot.quantity, 0);
  const difference = order.quantity - correlatedLotsQuantity;
  return {
    status: difference === 0 ? 'MATCHED' : 'DIVERGENT',
    orderQuantity: order.quantity,
    correlatedLotsQuantity,
    difference,
  };
}

export function projectedAvailableQuantity(position: BufferPosition): number {
  return position.availableQuantity + position.scheduledProductionQuantity - position.futurePlannedConsumptionQuantity;
}

export type ScheduleChange = 'ADDED' | 'REMOVED' | 'MOVED' | 'TIME_CHANGED' | 'QUANTITY_CHANGED';

export function compareScheduleLots(previous: readonly Lot[], active: readonly Lot[]) {
  const previousById = new Map(previous.map((lot, index) => [lot.id, { lot, index }]));
  const activeById = new Map(active.map((lot, index) => [lot.id, { lot, index }]));
  const changes: { lotId: string; changes: ScheduleChange[] }[] = [];

  for (const [lotId, current] of activeById) {
    const before = previousById.get(lotId);
    if (!before) {
      changes.push({ lotId, changes: ['ADDED'] });
      continue;
    }
    const lotChanges: ScheduleChange[] = [];
    if (before.index !== current.index) lotChanges.push('MOVED');
    if (before.lot.scheduledStart !== current.lot.scheduledStart || before.lot.scheduledFinish !== current.lot.scheduledFinish) lotChanges.push('TIME_CHANGED');
    if (before.lot.quantity !== current.lot.quantity) lotChanges.push('QUANTITY_CHANGED');
    if (lotChanges.length) changes.push({ lotId, changes: lotChanges });
  }
  for (const lotId of previousById.keys()) {
    if (!activeById.has(lotId)) changes.push({ lotId, changes: ['REMOVED'] });
  }
  return changes;
}
