import type { ProductionEvent } from '../../domain/production-monitoring/models';

const t = (time: string) => `2026-07-10T${time}:00-03:00`;

/**
 * Three demonstrative operational facts before Scenario Clock 09:15, each
 * with a real, traceable consequence on Actual/Projection/Adherence
 * (see fundicaoDcSourceDerivedProductionExecution.ts for the Lots they
 * delay):
 *  A. DC01 — unplanned stop (10min) during lot-sd-506 -> it finishes Late,
 *     and lot-sd-507 (same component, no Setup) inherits the delayed start.
 *  B. DC05 — Setup overrun (30min planned -> 45min actual, +15min) between
 *     lot-sd-520 and lot-sd-521 -> lot-sd-521 starts 15min late.
 *  C. DC04 — short interruption (8min) during lot-sd-516 -> it finishes
 *     Late, and lot-sd-517 inherits the delayed start.
 */
export const fundicaoDcSourceDerivedProductionEventsFixture: readonly ProductionEvent[] = [
  { eventId: 'event-sd-dc01-stop', resourceId: 'DC01', lotId: 'lot-sd-506', eventType: 'MACHINE_ADJUSTMENT', startedAt: t('07:19'), endedAt: t('07:29'), status: 'CLOSED', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { eventId: 'event-sd-dc05-setup-overrun', resourceId: 'DC05', lotId: 'lot-sd-521', eventType: 'TOOLING', startedAt: t('08:30'), endedAt: t('08:45'), status: 'CLOSED', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { eventId: 'event-sd-dc04-microstop', resourceId: 'DC04', lotId: 'lot-sd-516', eventType: 'OTHER', startedAt: t('08:30'), endedAt: t('08:38'), status: 'CLOSED', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
];
