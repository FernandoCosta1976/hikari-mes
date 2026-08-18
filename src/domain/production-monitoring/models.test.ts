import { describe, expect, it } from 'vitest';
import { eventDurationMinutes, eventsNewestFirst, monitoringCounts, type ProductionEvent } from './models';

const events: ProductionEvent[] = [
  { eventId: 'old', resourceId: 'DC01', lotId: 'lot-1', eventType: 'MATERIAL', startedAt: '2025-05-15T16:02:00-03:00', endedAt: '2025-05-15T16:14:00-03:00', status: 'CLOSED', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { eventId: 'active', resourceId: 'DC03', lotId: 'lot-3', eventType: 'TOOLING', startedAt: '2025-05-15T17:05:00-03:00', status: 'ACTIVE', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
];

describe('production monitoring facts', () => {
  it('derives active and closed durations from timestamps', () => {
    expect(eventDurationMinutes(events[0], '2025-05-15T17:23:00-03:00')).toBe(12);
    expect(eventDurationMinutes(events[1], '2025-05-15T17:23:00-03:00')).toBe(18);
  });
  it('orders events newest first and derives WIP state counts', () => {
    expect(eventsNewestFirst(events).map((event) => event.eventId)).toEqual(['active', 'old']);
    expect(monitoringCounts([
      { lotId: '1', productionOrderId: '1', resourceId: 'DC01', scheduleVersionId: 'v08', plannedQuantity: 1, scheduledStart: '', status: 'NOT_STARTED', pauses: [], transitions: [], demonstrative: true, dataOrigin: 'SOURCE_DERIVED_PLAN', ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
      { lotId: '2', productionOrderId: '2', resourceId: 'DC02', scheduleVersionId: 'v08', plannedQuantity: 1, scheduledStart: '', status: 'COMPLETED', pauses: [], transitions: [], demonstrative: true, dataOrigin: 'SOURCE_DERIVED_PLAN', ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
    ])).toEqual({ waiting: 1, running: 0, paused: 0, completed: 1 });
  });
});
