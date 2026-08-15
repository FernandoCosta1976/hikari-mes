import type { ReadinessStatus } from '../../domain/production-readiness/models';

export interface DemoLotReadinessRecord {
  lotId: string;
  status: ReadinessStatus;
}

const statuses: readonly ReadinessStatus[] = ['READY', 'READY', 'ATTENTION', 'READY', 'UNKNOWN', 'READY', 'ATTENTION', 'READY', 'BLOCKED', 'READY', 'READY', 'ATTENTION', 'READY', 'UNKNOWN', 'READY', 'ATTENTION', 'BLOCKED', 'READY', 'UNKNOWN', 'ATTENTION', 'READY'];

export const fundicaoDcProductionReadinessFixture: readonly DemoLotReadinessRecord[] = statuses.map((status, index) => ({
  lotId: `lot-${251 + index}`,
  status,
}));
