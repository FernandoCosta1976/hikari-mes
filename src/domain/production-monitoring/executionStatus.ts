import type { ProductionExecutionRecord } from '../production-execution/models';
import type { Lot, Shift } from '../production-scheduling/models';
import { buildOperationalTimeline } from '../operational-timeline/models';

/**
 * Acompanhamento-specific display status, derived from the existing
 * Execution Fact (ProductionExecutionRecord.status) plus Scheduled time and
 * the Scenario Clock — never a replacement for either. Scheduled State,
 * Execution State and this derived Requirement State stay three different
 * things (see Section 3 of the round brief): a Lot can be `SCHEDULED` in the
 * Plan and simultaneously reported here as `NOT_STARTED` once its scheduled
 * start has passed with no appointment, or `DELAYED` once it is running past
 * its scheduled finish.
 */
export type RequirementStatus = 'COMPLETED' | 'RUNNING' | 'DELAYED' | 'NOT_STARTED' | 'SCHEDULED';
export type ProjectionSignal = 'ON_TIME' | 'AT_RISK';

/** Re-exported from the Unified Operational Timeline (domain/operational-timeline) — this used to be a local duplicate. */
export { timelineRequirementStatus as requirementStatus } from '../operational-timeline/models';

/**
 * Projection is a dimension on top of the status, never a fourth state that
 * replaces it — `status = SCHEDULED, projection = AT_RISK` is a valid pair
 * when an upstream delay on the same Resource has been propagated forward.
 */
/** Variances at or below this tolerance read as healthy pace, not risk — matches the +/-2min actual-vs-scheduled noise already present across completed requirements. */
const AT_RISK_TOLERANCE_MINUTES = 10;

export function projectionSignal(status: RequirementStatus, projectedFinish: string | undefined, lot: Lot): ProjectionSignal {
  if (status === 'DELAYED' || status === 'NOT_STARTED') return 'AT_RISK';
  if (!projectedFinish) return 'ON_TIME';
  const varianceMinutes = (Date.parse(projectedFinish) - Date.parse(lot.scheduledFinish)) / 60_000;
  return varianceMinutes > AT_RISK_TOLERANCE_MINUTES ? 'AT_RISK' : 'ON_TIME';
}

export interface RequirementSnapshot {
  lot: Lot;
  execution: ProductionExecutionRecord;
  /** Confirmed produced quantity — SUM(Production Confirmations) for this Requirement, the single Total Count source (Capability 06). */
  producedQuantity: number;
  status: RequirementStatus;
  projectedFinish?: string;
  projection: ProjectionSignal;
  varianceMinutes?: number;
}

/**
 * A thin adapter over the Unified Operational Timeline
 * (domain/operational-timeline/buildOperationalTimeline) — Acompanhamento's
 * own historical shape (RequirementSnapshot), never a second cascade
 * computation. `projectedFinish` keeps its original contract: set for
 * RUNNING/DELAYED (known pace) and for a SCHEDULED Requirement only once it
 * has genuinely been replanned — never a No-op restatement of its own
 * Original Finish.
 */
export function buildRequirementSnapshots(
  lots: readonly Lot[],
  executionsByLotId: Readonly<Record<string, ProductionExecutionRecord>>,
  confirmedQuantityByLotId: Readonly<Record<string, number>>,
  currentTime: string,
  downtimeMinutesByLotId: Readonly<Record<string, number>> = {},
  shifts: readonly Shift[] = [],
): readonly RequirementSnapshot[] {
  const timeline = buildOperationalTimeline(lots, executionsByLotId, currentTime, shifts, downtimeMinutesByLotId);
  const lotsById = new Map(lots.map((lot) => [lot.id, lot]));
  return timeline.map((entry) => {
    const lot = lotsById.get(entry.requirementId)!;
    const execution = executionsByLotId[entry.requirementId];
    const producedQuantity = confirmedQuantityByLotId[entry.requirementId] ?? 0;
    const projectedFinish = entry.status === 'RUNNING' || entry.status === 'DELAYED' ? entry.projectedFinish
      : entry.status === 'SCHEDULED' && entry.replanned ? entry.currentFinish
      : undefined;
    const projection = projectionSignal(entry.status, projectedFinish, lot);
    const varianceMinutes = execution.actualFinish
      ? Math.round((Date.parse(execution.actualFinish) - Date.parse(lot.scheduledFinish)) / 60_000)
      : projectedFinish ? Math.round((Date.parse(projectedFinish) - Date.parse(lot.scheduledFinish)) / 60_000) : undefined;
    return { lot, execution, producedQuantity, status: entry.status, projectedFinish, projection, varianceMinutes };
  });
}

export interface DaySnapshotTotals {
  plannedQuantity: number;
  actualQuantity: number;
  runningQuantity: number;
  delayedOrNotStartedCount: number;
  scheduledCount: number;
  remainingQuantity: number;
  projectedFinalQuantity: number;
  atRiskLotIds: readonly string[];
}

export function summarizeDay(snapshots: readonly RequirementSnapshot[]): DaySnapshotTotals {
  let plannedQuantity = 0;
  let actualQuantity = 0;
  let runningQuantity = 0;
  let delayedOrNotStartedCount = 0;
  let scheduledCount = 0;
  const atRiskLotIds: string[] = [];
  for (const snapshot of snapshots) {
    plannedQuantity += snapshot.lot.quantity;
    if (snapshot.status === 'COMPLETED') actualQuantity += snapshot.producedQuantity;
    if (snapshot.status === 'RUNNING' || snapshot.status === 'DELAYED') runningQuantity += snapshot.producedQuantity;
    if (snapshot.status === 'DELAYED' || snapshot.status === 'NOT_STARTED') delayedOrNotStartedCount += 1;
    if (snapshot.status === 'SCHEDULED') scheduledCount += 1;
    if (snapshot.projection === 'AT_RISK') atRiskLotIds.push(snapshot.lot.id);
  }
  const remainingQuantity = plannedQuantity - actualQuantity - runningQuantity;
  return { plannedQuantity, actualQuantity, runningQuantity, delayedOrNotStartedCount, scheduledCount, remainingQuantity, projectedFinalQuantity: plannedQuantity, atRiskLotIds };
}
