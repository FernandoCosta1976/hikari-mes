import type { FoundryResourceId } from '../resource/models';

export type MoldLifeStatus = 'NORMAL' | 'ATTENTION' | 'MAINTENANCE_RECOMMENDED';

export interface Mold {
  id: string;
  code: string;
  resourceId: FoundryResourceId;
  materialCompatibility: string;
  lifeUsedRatio: number;
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

/**
 * Demonstrative life-used thresholds only — not a governed Yamaha rule.
 * MAINTENANCE_RECOMMENDED is decision support (a suggestion to evaluate),
 * never an automatic Work Order or a blocker.
 */
export function classifyMoldLife(lifeUsedRatio: number): MoldLifeStatus {
  if (lifeUsedRatio >= 0.9) return 'MAINTENANCE_RECOMMENDED';
  if (lifeUsedRatio >= 0.75) return 'ATTENTION';
  return 'NORMAL';
}

export function moldForResource(molds: readonly Mold[], resourceId: FoundryResourceId): Mold | undefined {
  return molds.find((mold) => mold.resourceId === resourceId);
}

/** The single most critical Mold in the scenario (highest life used), if any needs attention. */
export function mostCriticalMold(molds: readonly Mold[]): Mold | undefined {
  const candidates = molds.filter((mold) => classifyMoldLife(mold.lifeUsedRatio) !== 'NORMAL');
  return candidates.sort((a, b) => b.lifeUsedRatio - a.lifeUsedRatio)[0];
}
