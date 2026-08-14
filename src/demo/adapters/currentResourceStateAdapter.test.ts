import { describe, expect, test } from 'vitest';
import { currentResourceStateAdapter } from './currentResourceStateAdapter';

describe('currentResourceStateAdapter', () => {
  test('maps explicit demo observations without deriving missing fields or freshness', () => {
    const [projection] = currentResourceStateAdapter([{
      resourceId: 'DC04',
      activityState: 'INFORMATION_PARTIAL',
      currentLotReference: '249',
      observedAt: '2025-05-15T15:39:00-03:00',
      receivedAt: '2025-05-15T15:40:00-03:00',
      freshness: 'PARTIAL',
    }]);

    expect(projection).toEqual({
      resourceId: 'DC04',
      activityState: 'INFORMATION_PARTIAL',
      currentLotReference: '249',
      source: 'DEMONSTRATIVE_MONITORING_PROJECTION',
      observedAt: '2025-05-15T15:39:00-03:00',
      receivedAt: '2025-05-15T15:40:00-03:00',
      freshness: 'PARTIAL',
    });
    expect(projection?.currentMaterial).toBeUndefined();
  });

  test('preserves stale and unavailable states supplied by the fixture', () => {
    const projection = currentResourceStateAdapter([
      { resourceId: 'DC05', activityState: 'INFORMATION_STALE', observedAt: '2025-05-15T14:55:00-03:00', receivedAt: '2025-05-15T14:56:00-03:00', freshness: 'STALE' },
      { resourceId: 'DC03', activityState: 'INFORMATION_UNAVAILABLE', freshness: 'UNAVAILABLE' },
    ]);

    expect(projection.map(({ activityState, freshness }) => ({ activityState, freshness }))).toEqual([
      { activityState: 'INFORMATION_STALE', freshness: 'STALE' },
      { activityState: 'INFORMATION_UNAVAILABLE', freshness: 'UNAVAILABLE' },
    ]);
  });
});
