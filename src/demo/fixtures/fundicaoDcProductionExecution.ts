import type { ProductionExecutionRecord } from '../../domain/production-execution/models';

/** producedQuantity is kept here as the raw historical fact, migrated into seed Production Confirmations (fundicaoDcProductionConfirmations.ts) — never into ProductionExecutionRecord itself. */
export type RawExecutionFact = Omit<ProductionExecutionRecord, 'transitions' | 'dataOrigin' | 'ruleStatus'> & { producedQuantity: number };

export const rawExecutionFacts: readonly RawExecutionFact[] = [
  { lotId: 'lot-265', productionOrderId: 'po-demo-a', resourceId: 'DC01', scheduleVersionId: 'v08', plannedQuantity: 100, producedQuantity: 83, scheduledStart: '2025-05-15T15:30:00-03:00', actualStart: '2025-05-15T15:34:00-03:00', status: 'IN_PROGRESS', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true },
  { lotId: 'lot-264', productionOrderId: 'po-demo-d', resourceId: 'DC02', scheduleVersionId: 'v08', plannedQuantity: 50, producedQuantity: 50, scheduledStart: '2025-05-15T09:45:00-03:00', actualStart: '2025-05-15T09:48:00-03:00', actualFinish: '2025-05-15T11:12:00-03:00', status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true },
  { lotId: 'lot-266', productionOrderId: 'po-demo-b', resourceId: 'DC03', scheduleVersionId: 'v08', plannedQuantity: 100, producedQuantity: 41, scheduledStart: '2025-05-15T15:30:00-03:00', actualStart: '2025-05-15T15:48:00-03:00', status: 'PAUSED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [{ pausedAt: '2025-05-15T17:05:00-03:00', reason: 'TOOLING', demonstrative: true }], demonstrative: true },
  { lotId: 'lot-268', productionOrderId: 'po-demo-c', resourceId: 'DC04', scheduleVersionId: 'v08', plannedQuantity: 70, producedQuantity: 35, scheduledStart: '2025-05-15T18:30:00-03:00', actualStart: '2025-05-15T16:10:00-03:00', status: 'IN_PROGRESS', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true },
  { lotId: 'lot-271', productionOrderId: 'po-demo-b', resourceId: 'DC05', scheduleVersionId: 'v08', plannedQuantity: 70, producedQuantity: 0, scheduledStart: '2025-05-15T16:30:00-03:00', status: 'NOT_STARTED', pauses: [], demonstrative: true },
];

export const fundicaoDcProductionExecutionFixture: readonly ProductionExecutionRecord[] =
  rawExecutionFacts.map(({ producedQuantity: _producedQuantity, ...record }) => ({ ...record, transitions: [], dataOrigin: 'SOURCE_DERIVED_PLAN', ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' }));
