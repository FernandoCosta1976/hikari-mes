export type ProductionExecutionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
export type DemonstrativePauseReason = 'MATERIAL_SHORTAGE' | 'MACHINE_ADJUSTMENT' | 'TOOLING' | 'QUALITY' | 'OTHER';

export interface ExecutionPause {
  pausedAt: string;
  resumedAt?: string;
  reason: DemonstrativePauseReason;
  demonstrative: true;
}

export interface ProductionExecutionRecord {
  lotId: string;
  productionOrderId: string;
  resourceId: string;
  scheduleVersionId: string;
  plannedQuantity: number;
  producedQuantity: number;
  scheduledStart: string;
  status: ProductionExecutionStatus;
  actualStart?: string;
  actualFinish?: string;
  executedBy?: string;
  pauses: readonly ExecutionPause[];
  demonstrative: true;
}

export function startExecution(record: ProductionExecutionRecord, released: boolean, at: string, executedBy = 'Operador da Fundição · demonstrativo') {
  if (!released || record.status !== 'NOT_STARTED') return record;
  return { ...record, status: 'IN_PROGRESS' as const, actualStart: at, executedBy };
}
export function pauseExecution(record: ProductionExecutionRecord, at: string, reason: DemonstrativePauseReason) {
  if (record.status !== 'IN_PROGRESS') return record;
  return { ...record, status: 'PAUSED' as const, pauses: [...record.pauses, { pausedAt: at, reason, demonstrative: true as const }] };
}
export function resumeExecution(record: ProductionExecutionRecord, at: string) {
  if (record.status !== 'PAUSED') return record;
  return { ...record, status: 'IN_PROGRESS' as const, pauses: record.pauses.map((pause, index) => index === record.pauses.length - 1 ? { ...pause, resumedAt: at } : pause) };
}
export function updateProducedQuantity(record: ProductionExecutionRecord, quantity: number) {
  if (record.status !== 'IN_PROGRESS' && record.status !== 'PAUSED') return record;
  return { ...record, producedQuantity: Math.max(0, Math.round(quantity)) };
}
export function completeExecution(record: ProductionExecutionRecord, at: string) {
  if (record.status !== 'IN_PROGRESS') return record;
  return { ...record, status: 'COMPLETED' as const, actualFinish: at };
}

/**
 * A Resource can end up with more than one execution fact once a Lot is
 * reprogrammed onto it (its Operational Resource) after the baseline five
 * — the whole point of the persisted demo is that this decision must be
 * visible everywhere. Whichever Lot is actively running wins (most recently
 * started); otherwise the most recently created fact wins.
 */
export function currentExecutionForResource(executions: readonly ProductionExecutionRecord[], resourceId: string): ProductionExecutionRecord | undefined {
  const candidates = executions.filter((item) => item.resourceId === resourceId);
  if (candidates.length <= 1) return candidates[0];
  const active = candidates.filter((item) => item.status === 'IN_PROGRESS' || item.status === 'PAUSED');
  const pool = active.length ? active : candidates;
  return pool.reduce((latest, item) => Date.parse(item.actualStart ?? '') > Date.parse(latest.actualStart ?? '') ? item : latest);
}
