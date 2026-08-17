import type { ProductionExecutionRecord } from '../production-execution/models';
import type { Lot } from '../production-scheduling/models';

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

export function requirementStatus(execution: ProductionExecutionRecord, lot: Lot, currentTime: string): RequirementStatus {
  if (execution.status === 'COMPLETED') return 'COMPLETED';
  if (execution.status === 'IN_PROGRESS' || execution.status === 'PAUSED') {
    return Date.parse(currentTime) > Date.parse(lot.scheduledFinish) ? 'DELAYED' : 'RUNNING';
  }
  return Date.parse(currentTime) > Date.parse(lot.scheduledStart) ? 'NOT_STARTED' : 'SCHEDULED';
}

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
  status: RequirementStatus;
  projectedFinish?: string;
  projection: ProjectionSignal;
  varianceMinutes?: number;
}

/**
 * Projection Engine v1 (Section 12) — deterministic, per Resource:
 * 1. the current (RUNNING/DELAYED) requirement's Projected Finish is its
 *    known actual pace (actualStart + nominal duration) plus any known
 *    downtime on that Resource during its run;
 * 2. the delta versus its own Scheduled Finish propagates forward to the
 *    remaining SCHEDULED requirements on the *same* Resource only, in
 *    Scheduled order — Setup and breaks already baked into the schedule are
 *    preserved as-is, nothing is reordered or reassigned to another DC.
 * NOT_STARTED requirements do not get a computed Projected Finish (no known
 * pace to project from) — they are simply flagged AT_RISK.
 */
export function buildRequirementSnapshots(
  lots: readonly Lot[],
  executionsByLotId: Readonly<Record<string, ProductionExecutionRecord>>,
  currentTime: string,
  downtimeMinutesByLotId: Readonly<Record<string, number>> = {},
): readonly RequirementSnapshot[] {
  const byResource = new Map<string, Lot[]>();
  for (const lot of lots) {
    const list = byResource.get(lot.scheduledResourceId) ?? [];
    list.push(lot);
    byResource.set(lot.scheduledResourceId, list);
  }
  const snapshots = new Map<string, RequirementSnapshot>();
  for (const resourceLots of byResource.values()) {
    const ordered = [...resourceLots].sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart));
    let carryDeltaMinutes = 0;
    for (const lot of ordered) {
      const execution = executionsByLotId[lot.id];
      if (!execution) continue;
      const status = requirementStatus(execution, lot, currentTime);
      let projectedFinish: string | undefined;
      if (status === 'RUNNING' || status === 'DELAYED') {
        const nominalDurationMs = Date.parse(lot.scheduledFinish) - Date.parse(lot.scheduledStart);
        const downtimeMs = (downtimeMinutesByLotId[lot.id] ?? 0) * 60_000;
        const actualStartMs = Date.parse(execution.actualStart ?? lot.scheduledStart);
        const projectedFinishMs = actualStartMs + nominalDurationMs + downtimeMs;
        projectedFinish = new Date(projectedFinishMs).toISOString();
        carryDeltaMinutes = Math.round((projectedFinishMs - Date.parse(lot.scheduledFinish)) / 60_000);
      } else if (status === 'SCHEDULED' && carryDeltaMinutes > 0) {
        projectedFinish = new Date(Date.parse(lot.scheduledFinish) + carryDeltaMinutes * 60_000).toISOString();
      }
      const projection = projectionSignal(status, projectedFinish, lot);
      const varianceMinutes = execution.actualFinish
        ? Math.round((Date.parse(execution.actualFinish) - Date.parse(lot.scheduledFinish)) / 60_000)
        : projectedFinish ? Math.round((Date.parse(projectedFinish) - Date.parse(lot.scheduledFinish)) / 60_000) : undefined;
      snapshots.set(lot.id, { lot, execution, status, projectedFinish, projection, varianceMinutes });
    }
  }
  return lots.map((lot) => snapshots.get(lot.id)).filter((snapshot): snapshot is RequirementSnapshot => snapshot !== undefined);
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
    if (snapshot.status === 'COMPLETED') actualQuantity += snapshot.execution.producedQuantity;
    if (snapshot.status === 'RUNNING' || snapshot.status === 'DELAYED') runningQuantity += snapshot.execution.producedQuantity;
    if (snapshot.status === 'DELAYED' || snapshot.status === 'NOT_STARTED') delayedOrNotStartedCount += 1;
    if (snapshot.status === 'SCHEDULED') scheduledCount += 1;
    if (snapshot.projection === 'AT_RISK') atRiskLotIds.push(snapshot.lot.id);
  }
  const remainingQuantity = plannedQuantity - actualQuantity - runningQuantity;
  return { plannedQuantity, actualQuantity, runningQuantity, delayedOrNotStartedCount, scheduledCount, remainingQuantity, projectedFinalQuantity: plannedQuantity, atRiskLotIds };
}
