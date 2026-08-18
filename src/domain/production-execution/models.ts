export type ProductionExecutionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
export type DemonstrativePauseReason = 'MATERIAL_SHORTAGE' | 'MACHINE_ADJUSTMENT' | 'TOOLING' | 'QUALITY' | 'OTHER';

/**
 * Capability 05 granularity is the Production Requirement, the same
 * subject already used across Plano/Preparação/Liberação/Acompanhamento — not
 * an SFC and not a governed Execution Control Unit. EXECUTION GRANULARITY:
 * DEMONSTRATIVE · BUSINESS_VALIDATION_REQUIRED.
 */
export type ExecutionTransitionKind = 'RELEASED' | 'STARTED' | 'PAUSED' | 'RESUMED' | 'COMPLETED';
export type ExecutionDataOrigin = 'SOURCE_DERIVED_PLAN' | 'DEMONSTRATIVE_EXECUTION' | 'USER_SIMULATION' | 'DERIVED_METRIC';

export interface ExecutionTransition {
  kind: ExecutionTransitionKind;
  at: string;
  actor: string;
  dataOrigin: ExecutionDataOrigin;
}

export interface ExecutionPause {
  pausedAt: string;
  resumedAt?: string;
  reason: DemonstrativePauseReason;
  demonstrative: true;
}

export interface ProductionExecutionRecord {
  lotId: string;
  productionOrderId: string;
  /** Operational Resource actually running the Requirement — Section 12: fixed at Start, distinct from plannedResourceId, never changed by Execution actions. */
  resourceId: string;
  /** Resource programada no momento do Start — preserved separately so Execution never silently rewrites the Plan (Section 5/12). */
  plannedResourceId?: string;
  scheduleVersionId: string;
  plannedQuantity: number;
  /** Produced quantity lives in Production Confirmation (Capability 06) — SUM(confirmations), never a field here. */
  scheduledStart: string;
  status: ProductionExecutionStatus;
  actualStart?: string;
  actualFinish?: string;
  executedBy?: string;
  operatorId?: string;
  pauses: readonly ExecutionPause[];
  transitions: readonly ExecutionTransition[];
  demonstrative: true;
  dataOrigin: ExecutionDataOrigin;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

const transition = (kind: ExecutionTransitionKind, at: string, actor: string): ExecutionTransition => ({ kind, at, actor, dataOrigin: 'DEMONSTRATIVE_EXECUTION' });

export function startExecution(record: ProductionExecutionRecord, released: boolean, at: string, actor: string, operatorId?: string, plannedResourceId?: string) {
  if (!released || record.status !== 'NOT_STARTED') return record;
  return { ...record, status: 'IN_PROGRESS' as const, actualStart: at, executedBy: actor, operatorId: operatorId ?? record.operatorId, plannedResourceId: plannedResourceId ?? record.plannedResourceId ?? record.resourceId, transitions: [...record.transitions, transition('STARTED', at, actor)] };
}
export function pauseExecution(record: ProductionExecutionRecord, at: string, reason: DemonstrativePauseReason, actor: string) {
  if (record.status !== 'IN_PROGRESS') return record;
  return { ...record, status: 'PAUSED' as const, pauses: [...record.pauses, { pausedAt: at, reason, demonstrative: true as const }], transitions: [...record.transitions, transition('PAUSED', at, actor)] };
}
export function resumeExecution(record: ProductionExecutionRecord, at: string, actor: string) {
  if (record.status !== 'PAUSED') return record;
  return { ...record, status: 'IN_PROGRESS' as const, pauses: record.pauses.map((pause, index) => index === record.pauses.length - 1 ? { ...pause, resumedAt: at } : pause), transitions: [...record.transitions, transition('RESUMED', at, actor)] };
}
/**
 * Completion now requires the Requirement's own confirmed produced quantity
 * (Capability 06 — Production Confirmation, SUM(confirmations), never
 * execution's own field) to have reached Planned Quantity — replacing the
 * earlier time-based convention entirely (Section 18). A historical
 * Requirement (already COMPLETED) is never eligible again.
 */
export function canCompleteExecution(record: ProductionExecutionRecord, confirmedProducedQuantity: number): boolean {
  return record.status === 'IN_PROGRESS' && confirmedProducedQuantity >= record.plannedQuantity;
}

export function completeExecution(record: ProductionExecutionRecord, confirmedProducedQuantity: number, at: string, actor: string) {
  if (!canCompleteExecution(record, confirmedProducedQuantity)) return record;
  return { ...record, status: 'COMPLETED' as const, actualFinish: at, transitions: [...record.transitions, transition('COMPLETED', at, actor)] };
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
