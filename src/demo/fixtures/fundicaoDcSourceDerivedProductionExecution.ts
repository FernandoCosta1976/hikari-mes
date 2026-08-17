import type { ProductionExecutionRecord } from '../../domain/production-execution/models';

/**
 * Um apontamento "atual" por máquina (mesma convenção da fixture original) —
 * o relógio demonstrativo do HIKARI é fixo em 17:23 para toda a aplicação
 * (src/app/clock/applicationClock.ts), horário em que o plano de
 * 2026-07-09 já está concluído em todas as cinco máquinas.
 */
export const fundicaoDcSourceDerivedProductionExecutionFixture: readonly ProductionExecutionRecord[] = [
  { lotId: 'lot-sd-410', productionOrderId: 'po-source-derived-44c-e5421-w0', resourceId: 'DC01', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 100, scheduledStart: '2026-07-09T15:25:00-03:00', actualStart: '2026-07-09T15:27:00-03:00', actualFinish: '2026-07-09T16:35:00-03:00', status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true },
  { lotId: 'lot-sd-412', productionOrderId: 'po-source-derived-1st-e5111-w0', resourceId: 'DC02', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 100, scheduledStart: '2026-07-09T01:50:00-03:00', actualStart: '2026-07-09T01:52:00-03:00', actualFinish: '2026-07-09T03:00:00-03:00', status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true },
  { lotId: 'lot-sd-413', productionOrderId: 'po-source-derived-1s4-e5411-w0', resourceId: 'DC03', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 100, scheduledStart: '2026-07-09T00:30:00-03:00', actualStart: '2026-07-09T00:32:00-03:00', actualFinish: '2026-07-09T01:40:00-03:00', status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true },
  { lotId: 'lot-sd-415', productionOrderId: 'po-source-derived-1st-e5411-w0', resourceId: 'DC04', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 100, scheduledStart: '2026-07-09T01:50:00-03:00', actualStart: '2026-07-09T01:53:00-03:00', actualFinish: '2026-07-09T03:00:00-03:00', status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true },
  { lotId: 'lot-sd-421', productionOrderId: 'po-source-derived-44c-e5111-w0', resourceId: 'DC05', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 100, scheduledStart: '2026-07-09T08:00:00-03:00', actualStart: '2026-07-09T08:02:00-03:00', actualFinish: '2026-07-09T09:10:00-03:00', status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true },
];
