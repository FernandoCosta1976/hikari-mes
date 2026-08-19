import type { ProductionExecutionRecord, ProductionExecutionStatus, ExecutionTransitionKind } from '../production-execution/models';
import type { ProductionReleaseStatus } from '../production-release/models';
import type { ReadinessStatus } from '../production-readiness/models';
import type { Lot } from '../production-scheduling/models';

/**
 * Capability 07 — Atualizar Status da Produção. Operational Status is never
 * an editable field: it is the single deterministic CONSEQUENCE of existing
 * operational facts (Plano Vigente, Release, Execution, Production
 * Confirmation, Events, Scenario Clock). This module is the ONLY place the
 * precedence rule is written — every screen must consume its output, never
 * recompute its own version. RULE STATUS: DEMONSTRATIVE ·
 * BUSINESS_VALIDATION_REQUIRED.
 *
 * Three separate dimensions are preserved on purpose (never flattened into
 * one mega-status): Flow (which capability currently owns the Requirement),
 * Execution (the raw execution state) and Operational Status (the derived,
 * user-facing situation). Adherence is a QUALIFIER layered on top of
 * Operational Status, never a substitute value for it.
 */
export type FlowStatus = 'PREPARATION' | 'RELEASE' | 'EXECUTION';

export type ExecutionStatusDimension = 'NOT_STARTED' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export type OperationalStatus =
  | 'PLANNED'
  | 'WAITING_PREPARATION'
  | 'BLOCKED'
  | 'READY_FOR_RELEASE'
  | 'WAITING_START'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED';

export type AdherenceQualifier = 'AHEAD' | 'ON_TIME' | 'LATE' | 'AT_RISK';

export type ResourceOperationalStatus = 'PRODUCING' | 'PAUSED' | 'WAITING_START' | 'NO_ACTIVE_REQUIREMENT' | 'ATTENTION';

export const operationalStatusLabel: Record<OperationalStatus, string> = {
  PLANNED: 'Planejado',
  WAITING_PREPARATION: 'Aguardando preparação',
  BLOCKED: 'Bloqueado',
  READY_FOR_RELEASE: 'Pronto para liberar',
  WAITING_START: 'Aguardando início',
  RUNNING: 'Em execução',
  PAUSED: 'Pausado',
  COMPLETED: 'Concluído',
};

export const adherenceQualifierLabel: Record<AdherenceQualifier, string> = {
  AHEAD: 'Adiantado',
  ON_TIME: 'No prazo',
  LATE: 'Atrasado',
  AT_RISK: 'Em risco',
};

export const resourceOperationalStatusLabel: Record<ResourceOperationalStatus, string> = {
  PRODUCING: 'Produzindo',
  PAUSED: 'Em pausa',
  WAITING_START: 'Aguardando início',
  NO_ACTIVE_REQUIREMENT: 'Sem necessidade ativa',
  ATTENTION: 'Atenção',
};

export function toExecutionStatusDimension(status: ProductionExecutionStatus): ExecutionStatusDimension {
  return status === 'IN_PROGRESS' ? 'RUNNING' : status;
}

/**
 * The single centralized precedence rule (Section 5 of the round brief) —
 * must never be re-implemented as scattered if/else logic on individual
 * screens. Execution facts dominate; Release and Readiness only matter
 * before Execution has started.
 */
export function deriveOperationalStatus(params: {
  executionStatus: ProductionExecutionStatus;
  releaseStatus: ProductionReleaseStatus | undefined;
  readinessStatus: ReadinessStatus | undefined;
}): OperationalStatus {
  const { executionStatus, releaseStatus, readinessStatus } = params;
  if (executionStatus === 'COMPLETED') return 'COMPLETED';
  if (executionStatus === 'PAUSED') return 'PAUSED';
  if (executionStatus === 'IN_PROGRESS') return 'RUNNING';
  // NOT_STARTED from here — Release and Readiness decide the pre-execution bucket.
  if (releaseStatus === 'RELEASED') return 'WAITING_START';
  if (releaseStatus === 'READY_FOR_RELEASE') return 'READY_FOR_RELEASE';
  if (releaseStatus === 'BLOCKED_FOR_RELEASE' || readinessStatus === 'BLOCKED') return 'BLOCKED';
  if (releaseStatus === 'RELEASE_ATTENTION' || readinessStatus === 'ATTENTION' || readinessStatus === 'UNKNOWN') return 'WAITING_PREPARATION';
  return 'PLANNED';
}

/** Which capability currently owns the Requirement — derived from Operational Status, never stored independently. */
export function deriveFlowStatus(status: OperationalStatus): FlowStatus {
  if (status === 'RUNNING' || status === 'PAUSED' || status === 'COMPLETED') return 'EXECUTION';
  if (status === 'READY_FOR_RELEASE' || status === 'WAITING_START') return 'RELEASE';
  return 'PREPARATION';
}

const AHEAD_TOLERANCE_MINUTES = 2;
const AT_RISK_TOLERANCE_MINUTES = 10;

/**
 * Delay/lateness is a QUALIFIER layered on Operational Status, never a
 * substitute value (Section 6) — render as "EM EXECUÇÃO · ATRASADO +12 min",
 * never `status = DELAYED`.
 */
export function deriveAdherenceQualifier(params: {
  executionStatus: ExecutionStatusDimension;
  scheduledStart: string;
  scheduledFinish: string;
  actualFinish?: string;
  projectedFinish?: string;
  currentTime: string;
}): AdherenceQualifier {
  const { executionStatus, scheduledStart, scheduledFinish, actualFinish, projectedFinish, currentTime } = params;
  if (executionStatus === 'COMPLETED') {
    const varianceMinutes = actualFinish ? (Date.parse(actualFinish) - Date.parse(scheduledFinish)) / 60_000 : 0;
    if (varianceMinutes < -AHEAD_TOLERANCE_MINUTES) return 'AHEAD';
    if (varianceMinutes > AT_RISK_TOLERANCE_MINUTES) return 'LATE';
    return 'ON_TIME';
  }
  if (executionStatus === 'RUNNING' || executionStatus === 'PAUSED') {
    if (Date.parse(currentTime) > Date.parse(scheduledFinish)) return 'LATE';
    if (projectedFinish && (Date.parse(projectedFinish) - Date.parse(scheduledFinish)) / 60_000 > AT_RISK_TOLERANCE_MINUTES) return 'AT_RISK';
    return 'ON_TIME';
  }
  // NOT_STARTED
  return Date.parse(currentTime) > Date.parse(scheduledStart) ? 'LATE' : 'ON_TIME';
}

export function varianceMinutesFor(params: {
  executionStatus: ExecutionStatusDimension;
  scheduledFinish: string;
  actualFinish?: string;
  projectedFinish?: string;
}): number | null {
  const { executionStatus, scheduledFinish, actualFinish, projectedFinish } = params;
  if (executionStatus === 'COMPLETED' && actualFinish) return Math.round((Date.parse(actualFinish) - Date.parse(scheduledFinish)) / 60_000);
  if (projectedFinish) return Math.round((Date.parse(projectedFinish) - Date.parse(scheduledFinish)) / 60_000);
  return null;
}

/** The consequence, never CONSUMED input: only Complete (execution COMPLETED) marks the requirement done, even at 100/100 while RUNNING (Section 19). */
export function isPendingFinalization(status: OperationalStatus, producedQuantity: number, plannedQuantity: number): boolean {
  return status === 'RUNNING' && producedQuantity >= plannedQuantity;
}

export interface ProductionOperationalStatus {
  lotId: string;
  flow: FlowStatus;
  executionStatus: ExecutionStatusDimension;
  status: OperationalStatus;
  adherence: AdherenceQualifier;
  varianceMinutes: number | null;
  pendingFinalization: boolean;
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

export function buildOperationalStatus(params: {
  lot: Lot;
  execution: ProductionExecutionRecord;
  releaseStatus: ProductionReleaseStatus | undefined;
  readinessStatus: ReadinessStatus | undefined;
  producedQuantity: number;
  projectedFinish?: string;
  currentTime: string;
}): ProductionOperationalStatus {
  const { lot, execution, releaseStatus, readinessStatus, producedQuantity, projectedFinish, currentTime } = params;
  const executionStatus = toExecutionStatusDimension(execution.status);
  const status = deriveOperationalStatus({ executionStatus: execution.status, releaseStatus, readinessStatus });
  const adherence = deriveAdherenceQualifier({
    executionStatus,
    scheduledStart: lot.scheduledStart,
    scheduledFinish: lot.scheduledFinish,
    actualFinish: execution.actualFinish,
    projectedFinish,
    currentTime,
  });
  const varianceMinutes = varianceMinutesFor({ executionStatus, scheduledFinish: lot.scheduledFinish, actualFinish: execution.actualFinish, projectedFinish });
  return {
    lotId: lot.id,
    flow: deriveFlowStatus(status),
    executionStatus,
    status,
    adherence,
    varianceMinutes,
    pendingFinalization: isPendingFinalization(status, producedQuantity, lot.quantity),
    demonstrative: true,
    ruleStatus: 'BUSINESS_VALIDATION_REQUIRED',
  };
}

export interface OperationalStatusSource {
  lot: Lot;
  execution: ProductionExecutionRecord;
  releaseStatus: ProductionReleaseStatus | undefined;
  readinessStatus: ReadinessStatus | undefined;
  producedQuantity: number;
  projectedFinish?: string;
}

/** Builds the ONE shared per-Requirement status map every screen must consume — never recomputed independently (Section 32/38). */
export function buildOperationalStatusMap(sources: readonly OperationalStatusSource[], currentTime: string): Readonly<Record<string, ProductionOperationalStatus>> {
  const map: Record<string, ProductionOperationalStatus> = {};
  for (const source of sources) map[source.lot.id] = buildOperationalStatus({ ...source, currentTime });
  return map;
}

export interface ResourceStatusEntry {
  resourceId: string;
  current: ProductionOperationalStatus | null;
  next: { lotId: string; scheduledStart: string } | null;
  resourceStatus: ResourceOperationalStatus;
}

/**
 * Current + Next Requirement per Resource, derived strictly from Plano
 * Vigente order — never an independently built queue (Section 15/16). The
 * current Requirement is whichever is RUNNING/PAUSED; absent that, the
 * earliest not-yet-completed one in Scheduled order.
 */
export function deriveResourceStatusEntries(
  resourceIds: readonly string[],
  lotsOrderedByResource: Readonly<Record<string, readonly Lot[]>>,
  statusByLotId: Readonly<Record<string, ProductionOperationalStatus>>,
): readonly ResourceStatusEntry[] {
  return resourceIds.map((resourceId) => {
    const orderedLots = lotsOrderedByResource[resourceId] ?? [];
    const statuses = orderedLots.map((lot) => statusByLotId[lot.id]).filter((entry): entry is ProductionOperationalStatus => entry !== undefined);
    let currentIndex = statuses.findIndex((entry) => entry.status === 'RUNNING' || entry.status === 'PAUSED');
    if (currentIndex === -1) currentIndex = statuses.findIndex((entry) => entry.status !== 'COMPLETED');
    const current = currentIndex >= 0 ? statuses[currentIndex] : null;
    const nextLot = currentIndex >= 0 ? orderedLots[currentIndex + 1] : orderedLots.find((lot) => statusByLotId[lot.id]?.status !== 'COMPLETED');
    return {
      resourceId,
      current,
      next: nextLot ? { lotId: nextLot.id, scheduledStart: nextLot.scheduledStart } : null,
      resourceStatus: deriveResourceOperationalStatus(current?.status ?? null),
    };
  });
}

/**
 * A Resource's perceived situation is always derived from its CURRENT
 * Requirement's Operational Status (Section 9) — never a registry/cadastral
 * field, never labeled DOWN/UP without real governed telemetry.
 *
 * SEM NECESSIDADE ATIVA is reserved for the one case where there is
 * genuinely no pending Requirement for this Resource (`currentStatus ===
 * null`, or the current one is already COMPLETED with nothing queued next).
 * Any other pre-execution bucket (PLANNED, WAITING_PREPARATION,
 * READY_FOR_RELEASE, WAITING_START) still has a real, pending Requirement —
 * it has simply not started producing yet — and must report AGUARDANDO
 * INÍCIO. A prior version of this function mapped every non-RUNNING/PAUSED/
 * BLOCKED status straight to NO_ACTIVE_REQUIREMENT, which could report a
 * late, not-yet-released Requirement as "no active need" — fixed here
 * (Final Presentation Blocker Correction round, Blocker 1).
 */
export function deriveResourceOperationalStatus(currentStatus: OperationalStatus | null): ResourceOperationalStatus {
  if (currentStatus === null || currentStatus === 'COMPLETED') return 'NO_ACTIVE_REQUIREMENT';
  if (currentStatus === 'RUNNING') return 'PRODUCING';
  if (currentStatus === 'PAUSED') return 'PAUSED';
  if (currentStatus === 'BLOCKED') return 'ATTENTION';
  return 'WAITING_START'; // PLANNED, WAITING_PREPARATION, READY_FOR_RELEASE, WAITING_START
}

/**
 * WIP SEMANTICS: DEMONSTRATIVE / BUSINESS VALIDATION REQUIRED. This round's
 * definition only: a Requirement already entered into Execution
 * (Released → Started) and not yet Completed — RUNNING or PAUSED. WIP is
 * never Finished Goods, never Buffer, never Available Inventory, and is
 * never used to auto-calculate Buffer (Section 12).
 */
export function isWorkInProcess(status: OperationalStatus): boolean {
  return status === 'RUNNING' || status === 'PAUSED';
}

export interface OperationalSnapshotSummary {
  totalCount: number;
  running: number;
  paused: number;
  waitingStart: number;
  completed: number;
  late: number;
  atRisk: number;
  wipRequirementCount: number;
  wipQuantity: number;
  demonstrative: true;
}

/** Derived strictly from the already-computed per-Requirement statuses of the reference snapshot — never hardcoded (Section 44). */
export function summarizeOperationalSnapshot(entries: readonly { status: OperationalStatus; adherence: AdherenceQualifier; producedQuantity: number }[]): OperationalSnapshotSummary {
  let running = 0;
  let paused = 0;
  let waitingStart = 0;
  let completed = 0;
  let late = 0;
  let atRisk = 0;
  let wipRequirementCount = 0;
  let wipQuantity = 0;
  for (const entry of entries) {
    if (entry.status === 'RUNNING') running += 1;
    if (entry.status === 'PAUSED') paused += 1;
    if (entry.status === 'WAITING_START') waitingStart += 1;
    if (entry.status === 'COMPLETED') completed += 1;
    if (entry.adherence === 'LATE') late += 1;
    if (entry.adherence === 'AT_RISK') atRisk += 1;
    if (isWorkInProcess(entry.status)) {
      wipRequirementCount += 1;
      wipQuantity += entry.producedQuantity;
    }
  }
  return { totalCount: entries.length, running, paused, waitingStart, completed, late, atRisk, wipRequirementCount, wipQuantity, demonstrative: true };
}

export interface StatusHistoryEntry {
  kind: ExecutionTransitionKind;
  at: string;
  label: string;
}

const transitionLabel: Record<ExecutionTransitionKind, string> = {
  RELEASED: 'Liberado',
  STARTED: 'Iniciado',
  PAUSED: 'Pausado',
  RESUMED: 'Retomado',
  COMPLETED: 'Concluído',
};

/** Reuses the existing `transitions` fact — explicitly not full event sourcing (Section 28). */
export function buildStatusHistory(execution: ProductionExecutionRecord): readonly StatusHistoryEntry[] {
  return execution.transitions.map((transition) => ({ kind: transition.kind, at: transition.at, label: transitionLabel[transition.kind] }));
}

export function lastStatusChange(execution: ProductionExecutionRecord): StatusHistoryEntry | undefined {
  const history = buildStatusHistory(execution);
  return history[history.length - 1];
}
