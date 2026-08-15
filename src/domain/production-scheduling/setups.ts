import type { Lot, ScheduledSetup } from './models';
import { FOUNDRY_RESOURCE_IDS } from '../resource/models';

export function requiresSetup(previousLot: Lot, nextLot: Lot): boolean {
  return previousLot.scheduledResourceId === nextLot.scheduledResourceId && previousLot.materialId !== nextLot.materialId;
}

export function deriveScheduledSetups(lots: readonly Lot[], durationMinutes: number): readonly ScheduledSetup[] {
  return FOUNDRY_RESOURCE_IDS.flatMap((resourceId) => {
    const resourceLots = lots.filter((lot) => lot.scheduledResourceId === resourceId).sort((left, right) => Date.parse(left.scheduledStart) - Date.parse(right.scheduledStart));
    return resourceLots.slice(1).flatMap((nextLot, index) => {
      const previousLot = resourceLots[index];
      if (!requiresSetup(previousLot, nextLot)) return [];
      const scheduledStart = previousLot.scheduledFinish;
      const scheduledFinish = new Date(Date.parse(scheduledStart) + durationMinutes * 60_000).toISOString();
      if (Date.parse(scheduledFinish) > Date.parse(nextLot.scheduledStart)) throw new Error(`Demonstrative setup overlaps Lot ${nextLot.lotNumber} on ${resourceId}`);
      return [{ id: `setup-${previousLot.id}-${nextLot.id}`, resourceId, previousMaterialId: previousLot.materialId, nextMaterialId: nextLot.materialId, scheduledStart, scheduledFinish, durationMinutes, demonstrative: true as const }];
    });
  });
}
