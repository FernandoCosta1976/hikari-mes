import type { ProductionExecutionRecord } from '../../domain/production-execution/models';

/**
 * Execution facts for all 23 real requirements of the canonical 2026-07-10
 * schedule, at Scenario Clock 09:15 (Turno 1). Deliberately diverse — Real
 * must read differently from Planned: Completed Early/OnTime/Late, Running
 * OnTime/Late, one Not Started Late (no appointment), and the rest genuinely
 * Future/Scheduled. Three requirements (lot-sd-506, lot-sd-516, lot-sd-521)
 * carry the consequence of the three demonstrative events in
 * fundicaoDcSourceDerivedProductionEvents.ts — their own delay, and in turn
 * their immediate successor's delayed start (same Resource, same
 * component). Historical Actual is immutable: nothing here is touched by
 * What-If sequencing.
 */
const t = (time: string) => `2026-07-10T${time}:00-03:00`;
const po = (materialId: string) => `po-source-derived-${materialId.replace('component-', '')}`;

/**
 * producedQuantity is kept here as the raw historical fact — Capability 06
 * migrates it into seed Production Confirmations
 * (fundicaoDcSourceDerivedProductionConfirmations.ts), never into the
 * ProductionExecutionRecord itself (Section 19/20: single source of Total
 * Count).
 */
export type RawExecutionFact = Omit<ProductionExecutionRecord, 'transitions' | 'dataOrigin' | 'ruleStatus'> & { producedQuantity: number };

export const rawExecutionFacts: readonly RawExecutionFact[] = [
  // DC01
  { lotId: 'lot-sd-501', productionOrderId: po('component-5lx-e5421-x0'), resourceId: 'DC01', scheduleVersionId: 'v01', plannedQuantity: 50, producedQuantity: 50, scheduledStart: t('00:30'), actualStart: t('00:30'), actualFinish: t('01:01'), status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // 2min early
  { lotId: 'lot-sd-502', productionOrderId: po('component-1b2-e5411-w0'), resourceId: 'DC01', scheduleVersionId: 'v01', plannedQuantity: 50, producedQuantity: 50, scheduledStart: t('01:33'), actualStart: t('01:33'), actualFinish: t('02:16'), status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // on time
  { lotId: 'lot-sd-503', productionOrderId: po('component-5lx-e5421-x0'), resourceId: 'DC01', scheduleVersionId: 'v01', plannedQuantity: 50, producedQuantity: 50, scheduledStart: t('02:46'), actualStart: t('02:48'), actualFinish: t('03:21'), status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // +2min, within tolerance
  { lotId: 'lot-sd-504', productionOrderId: po('component-1b2-e5411-w0'), resourceId: 'DC01', scheduleVersionId: 'v01', plannedQuantity: 50, producedQuantity: 50, scheduledStart: t('03:49'), actualStart: t('03:49'), actualFinish: t('04:32'), status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // on time
  { lotId: 'lot-sd-505', productionOrderId: po('component-1st-e5421-w0'), resourceId: 'DC01', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 100, scheduledStart: t('05:02'), actualStart: t('05:02'), actualFinish: t('06:39'), status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // on time
  { lotId: 'lot-sd-506', productionOrderId: po('component-44c-e5421-w0'), resourceId: 'DC01', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 100, scheduledStart: t('07:09'), actualStart: t('07:09'), actualFinish: t('08:29'), status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [{ pausedAt: t('07:19'), resumedAt: t('07:29'), reason: 'MACHINE_ADJUSTMENT', demonstrative: true }], demonstrative: true }, // Evento A: parada não planejada 10min -> +10min late
  { lotId: 'lot-sd-507', productionOrderId: po('component-44c-e5421-w0'), resourceId: 'DC01', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 65, scheduledStart: t('08:19'), actualStart: t('08:29'), status: 'IN_PROGRESS', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // inherits Evento A's 10min delay -> Running Late
  { lotId: 'lot-sd-508', productionOrderId: po('component-44c-e5421-w0'), resourceId: 'DC01', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 0, scheduledStart: t('09:29'), status: 'NOT_STARTED', pauses: [], demonstrative: true }, // future — projected at risk (upstream delay)
  { lotId: 'lot-sd-509', productionOrderId: po('component-1st-e5421-w0'), resourceId: 'DC01', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 0, scheduledStart: t('11:09'), status: 'NOT_STARTED', pauses: [], demonstrative: true },
  { lotId: 'lot-sd-510', productionOrderId: po('component-1st-e5421-w0'), resourceId: 'DC01', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 0, scheduledStart: t('12:46'), status: 'NOT_STARTED', pauses: [], demonstrative: true },
  // DC02
  { lotId: 'lot-sd-511', productionOrderId: po('component-1st-e5111-w0'), resourceId: 'DC02', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 100, scheduledStart: t('06:00'), actualStart: t('06:00'), actualFinish: t('07:52'), status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // on time
  { lotId: 'lot-sd-512', productionOrderId: po('component-1st-e5111-w0'), resourceId: 'DC02', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 74, scheduledStart: t('07:52'), actualStart: t('07:52'), status: 'IN_PROGRESS', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // Running On Time
  { lotId: 'lot-sd-513', productionOrderId: po('component-1st-e5111-w0'), resourceId: 'DC02', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 0, scheduledStart: t('09:44'), status: 'NOT_STARTED', pauses: [], demonstrative: true },
  // DC03
  { lotId: 'lot-sd-514', productionOrderId: po('component-1s4-e5411-w0'), resourceId: 'DC03', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 0, scheduledStart: t('08:00'), status: 'NOT_STARTED', pauses: [], demonstrative: true }, // scheduled start already passed, no appointment -> Not Started Late
  // DC04
  { lotId: 'lot-sd-515', productionOrderId: po('component-1st-e5411-w0'), resourceId: 'DC04', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 100, scheduledStart: t('05:00'), actualStart: t('05:00'), actualFinish: t('07:00'), status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // 2min early
  { lotId: 'lot-sd-516', productionOrderId: po('component-1st-e5411-w0'), resourceId: 'DC04', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 100, scheduledStart: t('07:02'), actualStart: t('07:02'), actualFinish: t('09:12'), status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [{ pausedAt: t('08:30'), resumedAt: t('08:38'), reason: 'OTHER', demonstrative: true }], demonstrative: true }, // Evento C: microparada 8min -> +8min late
  { lotId: 'lot-sd-517', productionOrderId: po('component-1st-e5411-w0'), resourceId: 'DC04', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 2, scheduledStart: t('09:04'), actualStart: t('09:12'), status: 'IN_PROGRESS', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // inherits Evento C's 8min delay -> Running Late
  // DC05
  { lotId: 'lot-sd-518', productionOrderId: po('component-44c-e5111-w0'), resourceId: 'DC05', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 100, scheduledStart: t('01:00'), actualStart: t('01:00'), actualFinish: t('03:20'), status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // on time
  { lotId: 'lot-sd-519', productionOrderId: po('component-44c-e5111-w0'), resourceId: 'DC05', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 100, scheduledStart: t('03:20'), actualStart: t('03:20'), actualFinish: t('05:40'), status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // on time
  { lotId: 'lot-sd-520', productionOrderId: po('component-44c-e5111-w0'), resourceId: 'DC05', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 100, scheduledStart: t('05:40'), actualStart: t('05:40'), actualFinish: t('08:00'), status: 'COMPLETED', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // on time
  { lotId: 'lot-sd-521', productionOrderId: po('component-1st-e1310-w0'), resourceId: 'DC05', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 18, scheduledStart: t('08:30'), actualStart: t('08:45'), status: 'IN_PROGRESS', executedBy: 'Operador da Fundição · demonstrativo', pauses: [], demonstrative: true }, // Evento B: Setup acima do esperado (+15min) -> Running Late
  { lotId: 'lot-sd-522', productionOrderId: po('component-1st-e1310-w0'), resourceId: 'DC05', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 0, scheduledStart: t('11:08'), status: 'NOT_STARTED', pauses: [], demonstrative: true },
  { lotId: 'lot-sd-523', productionOrderId: po('component-1st-e1310-w0'), resourceId: 'DC05', scheduleVersionId: 'v01', plannedQuantity: 100, producedQuantity: 0, scheduledStart: t('13:46'), status: 'NOT_STARTED', pauses: [], demonstrative: true },
];

/** Source-derived Plan/Execution facts — Capability 05's own interactive actions (transitions[]) start empty here and grow only from user actions in the live session, never in this static baseline. */
export const fundicaoDcSourceDerivedProductionExecutionFixture: readonly ProductionExecutionRecord[] =
  rawExecutionFacts.map(({ producedQuantity: _producedQuantity, ...record }) => ({ ...record, transitions: [], dataOrigin: 'SOURCE_DERIVED_PLAN', ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' }));
