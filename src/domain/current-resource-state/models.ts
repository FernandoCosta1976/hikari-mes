export type CurrentResourceProjectionState =
  | 'CURRENT_PRODUCTION_KNOWN'
  | 'NO_CURRENT_PRODUCTION_KNOWN'
  | 'INFORMATION_UNAVAILABLE'
  | 'INFORMATION_STALE'
  | 'INFORMATION_PARTIAL';

export type CurrentResourceFreshness = 'CURRENT' | 'STALE' | 'UNAVAILABLE' | 'PARTIAL';

export interface CurrentResourceStateProjection {
  resourceId: FoundryResourceId;
  activityState: CurrentResourceProjectionState;
  currentLotReference?: string;
  currentMaterial?: string;
  source: 'DEMONSTRATIVE_MONITORING_PROJECTION';
  observedAt?: string;
  receivedAt?: string;
  freshness: CurrentResourceFreshness;
}
import type { FoundryResourceId } from '../resource/models';
