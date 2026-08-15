import type { BufferPosition, Lot, ProductionOrder } from './models';
import type { MaterialResourceEligibilityProjection } from '../material-resource-eligibility/models';
import { FOUNDRY_RESOURCE_IDS } from '../resource/models';

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

export type ScheduledResourcePlanViolation =
  | { type: 'UNKNOWN_RESOURCE'; lotId: Lot['id'] }
  | { type: 'INELIGIBLE_RESOURCE'; lotId: Lot['id'] }
  | { type: 'SAME_RESOURCE_OVERLAP'; lotIds: readonly [Lot['id'], Lot['id']] };

export function validateScheduledResourcePlan(
  lots: readonly Lot[],
  eligibilities: readonly MaterialResourceEligibilityProjection[],
): readonly ScheduledResourcePlanViolation[] {
  const violations: ScheduledResourcePlanViolation[] = [];
  for (const lot of lots) {
    if (!FOUNDRY_RESOURCE_IDS.includes(lot.scheduledResourceId)) {
      violations.push({ type: 'UNKNOWN_RESOURCE', lotId: lot.id });
      continue;
    }
    const eligibility = eligibilities.find((item) => item.materialId === lot.materialId);
    if (!eligibility?.eligibleResourceIds.includes(lot.scheduledResourceId)) {
      violations.push({ type: 'INELIGIBLE_RESOURCE', lotId: lot.id });
    }
  }
  for (let index = 0; index < lots.length; index += 1) {
    for (let candidate = index + 1; candidate < lots.length; candidate += 1) {
      const current = lots[index];
      const next = lots[candidate];
      if (current.scheduledResourceId !== next.scheduledResourceId) continue;
      if (current.scheduledStart < next.scheduledFinish && next.scheduledStart < current.scheduledFinish) {
        violations.push({ type: 'SAME_RESOURCE_OVERLAP', lotIds: [current.id, next.id] });
      }
    }
  }
  return violations;
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
