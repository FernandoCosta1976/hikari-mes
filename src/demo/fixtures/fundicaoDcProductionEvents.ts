import type { ProductionEvent } from '../../domain/production-monitoring/models';

export const fundicaoDcProductionEventsFixture: readonly ProductionEvent[] = [
  { eventId: 'event-dc03-tooling-active', resourceId: 'DC03', lotId: 'lot-266', eventType: 'TOOLING', startedAt: '2025-05-15T17:05:00-03:00', status: 'ACTIVE', dataOrigin: 'DEMONSTRATIVE_EVENT', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { eventId: 'event-dc01-material', resourceId: 'DC01', lotId: 'lot-265', eventType: 'MATERIAL', startedAt: '2025-05-15T16:02:00-03:00', endedAt: '2025-05-15T16:14:00-03:00', status: 'CLOSED', dataOrigin: 'DEMONSTRATIVE_EVENT', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { eventId: 'event-dc04-adjustment', resourceId: 'DC04', lotId: 'lot-268', eventType: 'MACHINE_ADJUSTMENT', startedAt: '2025-05-15T17:14:00-03:00', endedAt: '2025-05-15T17:18:00-03:00', status: 'CLOSED', dataOrigin: 'DEMONSTRATIVE_EVENT', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { eventId: 'event-dc02-quality', resourceId: 'DC02', lotId: 'lot-264', eventType: 'QUALITY', startedAt: '2025-05-15T10:35:00-03:00', endedAt: '2025-05-15T10:42:00-03:00', status: 'CLOSED', dataOrigin: 'DEMONSTRATIVE_EVENT', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
];
