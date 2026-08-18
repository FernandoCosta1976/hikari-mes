import { describe, expect, it } from 'vitest';
import { activeEventForLot, closeEvent, eventCategoryFor, eventDurationMinutes, eventsNewestFirst, monitoringCounts, oeeClassificationFor, openEvent, pauseReasonToEventType, unplannedDowntimeMinutes, type ProductionEvent } from './models';

const events: ProductionEvent[] = [
  { eventId: 'old', resourceId: 'DC01', lotId: 'lot-1', eventType: 'MATERIAL', startedAt: '2025-05-15T16:02:00-03:00', endedAt: '2025-05-15T16:14:00-03:00', status: 'CLOSED', dataOrigin: 'DEMONSTRATIVE_EVENT', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { eventId: 'active', resourceId: 'DC03', lotId: 'lot-3', eventType: 'TOOLING', startedAt: '2025-05-15T17:05:00-03:00', status: 'ACTIVE', dataOrigin: 'DEMONSTRATIVE_EVENT', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
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

describe('Capability 08 — Event taxonomy: planned != unplanned (Section 3/4)', () => {
  it('the five unplanned reasons and Microstop classify as UNPLANNED_STOP/MICROSTOP', () => {
    expect(eventCategoryFor('EQUIPMENT_FAILURE')).toBe('UNPLANNED_STOP');
    expect(eventCategoryFor('MATERIAL')).toBe('UNPLANNED_STOP');
    expect(eventCategoryFor('TOOLING')).toBe('UNPLANNED_STOP');
    expect(eventCategoryFor('MACHINE_ADJUSTMENT')).toBe('UNPLANNED_STOP');
    expect(eventCategoryFor('OTHER')).toBe('UNPLANNED_STOP');
    expect(eventCategoryFor('QUALITY')).toBe('UNPLANNED_STOP');
    expect(eventCategoryFor('MICROSTOP')).toBe('MICROSTOP');
  });

  it('Setup, Pausa programada and Refeição classify as PLANNED_STOP', () => {
    expect(eventCategoryFor('SETUP')).toBe('PLANNED_STOP');
    expect(eventCategoryFor('SCHEDULED_BREAK')).toBe('PLANNED_STOP');
    expect(eventCategoryFor('MEAL_BREAK')).toBe('PLANNED_STOP');
  });

  it('only PLANNED_STOP maps to PLANNED_TIME_EXCLUSION — everything else (including Microstop, this round'+"'"+'s policy) is UNPLANNED_DOWNTIME', () => {
    expect(oeeClassificationFor('SETUP')).toBe('PLANNED_TIME_EXCLUSION');
    expect(oeeClassificationFor('SCHEDULED_BREAK')).toBe('PLANNED_TIME_EXCLUSION');
    expect(oeeClassificationFor('MEAL_BREAK')).toBe('PLANNED_TIME_EXCLUSION');
    expect(oeeClassificationFor('EQUIPMENT_FAILURE')).toBe('UNPLANNED_DOWNTIME');
    expect(oeeClassificationFor('MICROSTOP')).toBe('UNPLANNED_DOWNTIME');
  });

  it('pauseReasonToEventType passes EQUIPMENT_FAILURE through unchanged', () => {
    expect(pauseReasonToEventType('EQUIPMENT_FAILURE')).toBe('EQUIPMENT_FAILURE');
    expect(pauseReasonToEventType('MATERIAL_SHORTAGE')).toBe('MATERIAL');
  });
});

describe('Capability 08 — open/close Event lifecycle (Section 6/7/27)', () => {
  it('opens an ACTIVE event from the Session Clock instant, never Date.now()', () => {
    const event = openEvent({ eventId: 'e1', resourceId: 'DC03', lotId: 'lot-514', eventType: 'EQUIPMENT_FAILURE', startedAt: '2026-07-10T09:15:00-03:00', operator: 'Operador 03', dataOrigin: 'USER_SIMULATION' });
    expect(event.status).toBe('ACTIVE');
    expect(event.startedAt).toBe('2026-07-10T09:15:00-03:00');
    expect(event.endedAt).toBeUndefined();
    expect(event.demonstrative).toBe(true);
  });

  it('closes an ACTIVE event with endedAt at the Session Clock instant and a computable duration', () => {
    const opened = openEvent({ eventId: 'e1', resourceId: 'DC03', lotId: 'lot-514', eventType: 'EQUIPMENT_FAILURE', startedAt: '2026-07-10T09:15:00-03:00', dataOrigin: 'USER_SIMULATION' });
    const closed = closeEvent(opened, '2026-07-10T09:30:00-03:00');
    expect(closed.status).toBe('CLOSED');
    expect(closed.endedAt).toBe('2026-07-10T09:30:00-03:00');
    expect(eventDurationMinutes(closed, '2026-07-10T10:00:00-03:00')).toBe(15);
  });

  it('closing an already-CLOSED event is a no-op — never overwrites the recorded end', () => {
    const closed: ProductionEvent = { eventId: 'e1', resourceId: 'DC03', lotId: 'lot-514', eventType: 'EQUIPMENT_FAILURE', startedAt: '2026-07-10T09:15:00-03:00', endedAt: '2026-07-10T09:20:00-03:00', status: 'CLOSED', dataOrigin: 'USER_SIMULATION', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' };
    expect(closeEvent(closed, '2026-07-10T09:45:00-03:00')).toBe(closed);
  });

  it('activeEventForLot finds the open Event for a Requirement, ignoring other Lots and closed Events', () => {
    const all: ProductionEvent[] = [
      { eventId: 'e1', resourceId: 'DC01', lotId: 'lot-a', eventType: 'OTHER', startedAt: '2026-07-10T08:00:00-03:00', endedAt: '2026-07-10T08:10:00-03:00', status: 'CLOSED', dataOrigin: 'DEMONSTRATIVE_EVENT', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
      { eventId: 'e2', resourceId: 'DC02', lotId: 'lot-b', eventType: 'EQUIPMENT_FAILURE', startedAt: '2026-07-10T09:00:00-03:00', status: 'ACTIVE', dataOrigin: 'USER_SIMULATION', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
    ];
    expect(activeEventForLot(all, 'lot-b')?.eventId).toBe('e2');
    expect(activeEventForLot(all, 'lot-a')).toBeUndefined();
  });
});

describe('Capability 08 — Unplanned Downtime excludes Planned Stops (Section 9/17/18)', () => {
  const currentTime = '2026-07-10T10:00:00-03:00';

  it('sums only UNPLANNED_DOWNTIME-classified Events for the given Requirement', () => {
    const mixed: ProductionEvent[] = [
      { eventId: 'e1', resourceId: 'DC01', lotId: 'lot-a', eventType: 'EQUIPMENT_FAILURE', startedAt: '2026-07-10T08:00:00-03:00', endedAt: '2026-07-10T08:12:00-03:00', status: 'CLOSED', dataOrigin: 'USER_SIMULATION', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
      { eventId: 'e2', resourceId: 'DC01', lotId: 'lot-a', eventType: 'SETUP', startedAt: '2026-07-10T08:20:00-03:00', endedAt: '2026-07-10T08:50:00-03:00', status: 'CLOSED', dataOrigin: 'PLANNED_CALENDAR_EVENT', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
      { eventId: 'e3', resourceId: 'DC01', lotId: 'lot-other', eventType: 'EQUIPMENT_FAILURE', startedAt: '2026-07-10T09:00:00-03:00', endedAt: '2026-07-10T09:20:00-03:00', status: 'CLOSED', dataOrigin: 'USER_SIMULATION', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
    ];
    // 12 min unplanned (e1) — the 30 min Setup (e2) is a Planned Stop, excluded; e3 belongs to a different Requirement.
    expect(unplannedDowntimeMinutes(mixed, 'lot-a', currentTime)).toBe(12);
  });

  it('an open (ACTIVE) Unplanned event counts up to currentTime', () => {
    const open: ProductionEvent[] = [
      { eventId: 'e1', resourceId: 'DC01', lotId: 'lot-a', eventType: 'EQUIPMENT_FAILURE', startedAt: '2026-07-10T09:45:00-03:00', status: 'ACTIVE', dataOrigin: 'USER_SIMULATION', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
    ];
    expect(unplannedDowntimeMinutes(open, 'lot-a', currentTime)).toBe(15);
  });

  it('a Requirement with no Events at all has zero Unplanned Downtime', () => {
    expect(unplannedDowntimeMinutes([], 'lot-a', currentTime)).toBe(0);
  });
});
