import type { DemoCurrentResourceStateRecord } from './fundicaoDcCurrentResourceState';

/** Estado atual das máquinas para o cenário derivado da fonte real — nenhum apontamento em andamento capturado ainda neste recorte. */
export const fundicaoDcSourceDerivedCurrentResourceStateFixture: readonly DemoCurrentResourceStateRecord[] = [
  { resourceId: 'DC01', activityState: 'NO_CURRENT_PRODUCTION_KNOWN', observedAt: '2026-07-10T09:10:00-03:00', receivedAt: '2026-07-10T09:11:00-03:00', freshness: 'CURRENT' },
  { resourceId: 'DC02', activityState: 'NO_CURRENT_PRODUCTION_KNOWN', observedAt: '2026-07-10T09:10:00-03:00', receivedAt: '2026-07-10T09:11:00-03:00', freshness: 'CURRENT' },
  { resourceId: 'DC03', activityState: 'NO_CURRENT_PRODUCTION_KNOWN', observedAt: '2026-07-10T09:10:00-03:00', receivedAt: '2026-07-10T09:11:00-03:00', freshness: 'CURRENT' },
  { resourceId: 'DC04', activityState: 'NO_CURRENT_PRODUCTION_KNOWN', observedAt: '2026-07-10T09:10:00-03:00', receivedAt: '2026-07-10T09:11:00-03:00', freshness: 'CURRENT' },
  { resourceId: 'DC05', activityState: 'NO_CURRENT_PRODUCTION_KNOWN', observedAt: '2026-07-10T09:10:00-03:00', receivedAt: '2026-07-10T09:11:00-03:00', freshness: 'CURRENT' },
];
