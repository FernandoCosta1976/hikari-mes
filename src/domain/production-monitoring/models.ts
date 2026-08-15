import type { DemonstrativePauseReason, ProductionExecutionRecord } from '../production-execution/models';

export type ProductionEventStatus = 'ACTIVE' | 'CLOSED';
export type ProductionEventType = 'MATERIAL' | 'MACHINE_ADJUSTMENT' | 'TOOLING' | 'QUALITY' | 'OTHER';

export interface ProductionEvent {
  eventId: string;
  resourceId: string;
  lotId: string;
  eventType: ProductionEventType;
  startedAt: string;
  endedAt?: string;
  status: ProductionEventStatus;
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

export function eventDurationMinutes(event: ProductionEvent, currentTime: string) {
  const finish = event.status === 'CLOSED' && event.endedAt ? event.endedAt : currentTime;
  return Math.max(0, Math.round((Date.parse(finish) - Date.parse(event.startedAt)) / 60_000));
}

export function pauseReasonToEventType(reason: DemonstrativePauseReason): ProductionEventType {
  return reason === 'MATERIAL_SHORTAGE' ? 'MATERIAL' : reason;
}

export function monitoringCounts(records: readonly ProductionExecutionRecord[]) {
  return records.reduce((counts, record) => {
    if (record.status === 'NOT_STARTED') counts.waiting += 1;
    if (record.status === 'IN_PROGRESS') counts.running += 1;
    if (record.status === 'PAUSED') counts.paused += 1;
    if (record.status === 'COMPLETED') counts.completed += 1;
    return counts;
  }, { waiting: 0, running: 0, paused: 0, completed: 0 });
}

export function eventsNewestFirst(events: readonly ProductionEvent[]) {
  return [...events].sort((left, right) => Date.parse(right.startedAt) - Date.parse(left.startedAt));
}
