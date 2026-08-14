import type { FoundryResourceId } from '../../domain/resource/models';

export interface DemoCurrentResourceStateRecord {
  resourceId: FoundryResourceId;
  activityState: 'CURRENT_PRODUCTION_KNOWN' | 'NO_CURRENT_PRODUCTION_KNOWN' | 'INFORMATION_UNAVAILABLE' | 'INFORMATION_STALE' | 'INFORMATION_PARTIAL';
  currentLotReference?: string;
  currentMaterial?: string;
  observedAt?: string;
  receivedAt?: string;
  freshness: 'CURRENT' | 'STALE' | 'UNAVAILABLE' | 'PARTIAL';
}

export const fundicaoDcCurrentResourceStateFixture: readonly DemoCurrentResourceStateRecord[] = [
  { resourceId: 'DC01', activityState: 'CURRENT_PRODUCTION_KNOWN', currentLotReference: '247', currentMaterial: 'Material A', observedAt: '2025-05-15T15:42:00-03:00', receivedAt: '2025-05-15T15:43:00-03:00', freshness: 'CURRENT' },
  { resourceId: 'DC02', activityState: 'CURRENT_PRODUCTION_KNOWN', currentLotReference: '248', currentMaterial: 'Material B', observedAt: '2025-05-15T15:41:00-03:00', receivedAt: '2025-05-15T15:42:00-03:00', freshness: 'CURRENT' },
  { resourceId: 'DC03', activityState: 'NO_CURRENT_PRODUCTION_KNOWN', observedAt: '2025-05-15T15:40:00-03:00', receivedAt: '2025-05-15T15:41:00-03:00', freshness: 'CURRENT' },
  { resourceId: 'DC04', activityState: 'INFORMATION_PARTIAL', currentLotReference: '249', observedAt: '2025-05-15T15:39:00-03:00', receivedAt: '2025-05-15T15:40:00-03:00', freshness: 'PARTIAL' },
  { resourceId: 'DC05', activityState: 'INFORMATION_STALE', observedAt: '2025-05-15T14:55:00-03:00', receivedAt: '2025-05-15T14:56:00-03:00', freshness: 'STALE' },
];
