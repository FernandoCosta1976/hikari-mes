import type { CurrentResourceStateProjection } from '../../domain/current-resource-state/models';
import type { DemoCurrentResourceStateRecord } from '../fixtures/fundicaoDcCurrentResourceState';

export function currentResourceStateAdapter(
  records: readonly DemoCurrentResourceStateRecord[],
): readonly CurrentResourceStateProjection[] {
  return records.map((record) => ({
    resourceId: record.resourceId,
    activityState: record.activityState,
    ...(record.currentLotReference ? { currentLotReference: record.currentLotReference } : {}),
    ...(record.currentMaterial ? { currentMaterial: record.currentMaterial } : {}),
    source: 'DEMONSTRATIVE_MONITORING_PROJECTION',
    ...(record.observedAt ? { observedAt: record.observedAt } : {}),
    ...(record.receivedAt ? { receivedAt: record.receivedAt } : {}),
    freshness: record.freshness,
  }));
}
