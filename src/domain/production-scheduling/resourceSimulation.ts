import type { Lot } from './models';
import type { FoundryResourceId } from '../resource/models';
import { deriveScheduledSetups } from './setups';

const setupCount = (lots: readonly Lot[], resourceId: FoundryResourceId) => {
  const ordered = lots.filter((lot) => lot.scheduledResourceId === resourceId).sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart));
  return ordered.slice(1).filter((lot, index) => lot.materialId !== ordered[index].materialId).length;
};

export interface ResourceSimulationImpact {
  lotId: string;
  originalResourceId: FoundryResourceId;
  simulatedResourceId: FoundryResourceId;
  originSetupDeltaMinutes: number;
  destinationSetupDeltaMinutes: number;
  netSetupDeltaMinutes: number;
  conflictLotIds: readonly string[];
  conflictSetupIds: readonly string[];
  bufferImpact: 'NEUTRAL' | 'RISK';
}

export function simulateResourceMove(lots: readonly Lot[], lotId: string, simulatedResourceId: FoundryResourceId, setupDurationMinutes = 30, bufferCriticalLotIds: readonly string[] = []): ResourceSimulationImpact {
  const moved = lots.find((lot) => lot.id === lotId);
  if (!moved) throw new Error(`Unknown Lot ${lotId}`);
  const baselineOrigin = setupCount(lots, moved.scheduledResourceId);
  const baselineDestination = setupCount(lots, simulatedResourceId);
  const simulatedLots = lots.map((lot) => lot.id === lotId ? { ...lot, scheduledResourceId: simulatedResourceId } : lot);
  const simulatedOrigin = setupCount(simulatedLots, moved.scheduledResourceId);
  const simulatedDestination = setupCount(simulatedLots, simulatedResourceId);
  const conflicts = lots.filter((lot) => lot.id !== moved.id && lot.scheduledResourceId === simulatedResourceId && Date.parse(moved.scheduledStart) < Date.parse(lot.scheduledFinish) && Date.parse(lot.scheduledStart) < Date.parse(moved.scheduledFinish)).map((lot) => lot.id);
  const setupConflicts = deriveScheduledSetups(lots, setupDurationMinutes).filter((setup) => setup.resourceId === simulatedResourceId && Date.parse(moved.scheduledStart) < Date.parse(setup.scheduledFinish) && Date.parse(setup.scheduledStart) < Date.parse(moved.scheduledFinish)).map((setup) => setup.id);
  return {
    lotId,
    originalResourceId: moved.scheduledResourceId,
    simulatedResourceId,
    originSetupDeltaMinutes: (simulatedOrigin - baselineOrigin) * setupDurationMinutes,
    destinationSetupDeltaMinutes: (simulatedDestination - baselineDestination) * setupDurationMinutes,
    netSetupDeltaMinutes: ((simulatedOrigin + simulatedDestination) - (baselineOrigin + baselineDestination)) * setupDurationMinutes,
    conflictLotIds: conflicts,
    conflictSetupIds: setupConflicts,
    bufferImpact: (conflicts.length || setupConflicts.length) && bufferCriticalLotIds.includes(lotId) ? 'RISK' : 'NEUTRAL',
  };
}
