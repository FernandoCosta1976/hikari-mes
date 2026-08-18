import type { ExecutionPause, ProductionExecutionRecord } from '../production-execution/models';
import { unplannedDowntimeMinutes, type ProductionEvent } from '../production-monitoring/models';

export type QualityLossReason = 'SCRAP' | 'PROCESS_DEFECT' | 'DIMENSIONAL' | 'SURFACE' | 'OTHER';

export interface QualityConfirmation {
  lotId: string;
  resourceId: string;
  producedQuantity: number;
  goodQuantity: number;
  rejectQuantity: number;
  reworkQuantity: number;
  confirmedAt: string;
  confirmedBy: string;
  lossReason?: QualityLossReason;
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

export function isValidQualityConfirmation(confirmation: QualityConfirmation): boolean {
  return confirmation.goodQuantity >= 0
    && confirmation.rejectQuantity >= 0
    && confirmation.reworkQuantity >= 0
    && confirmation.goodQuantity + confirmation.rejectQuantity + confirmation.reworkQuantity <= confirmation.producedQuantity;
}

export function qualityRate(confirmation: Pick<QualityConfirmation, 'producedQuantity' | 'goodQuantity'>): number | null {
  if (confirmation.producedQuantity <= 0) return null;
  return confirmation.goodQuantity / confirmation.producedQuantity;
}

export function qualitySummary(confirmations: readonly QualityConfirmation[]) {
  return confirmations.reduce((totals, confirmation) => ({
    produced: totals.produced + confirmation.producedQuantity,
    good: totals.good + confirmation.goodQuantity,
    reject: totals.reject + confirmation.rejectQuantity,
    rework: totals.rework + confirmation.reworkQuantity,
  }), { produced: 0, good: 0, reject: 0, rework: 0 });
}

export function mainLosses(confirmations: readonly QualityConfirmation[]): readonly QualityConfirmation[] {
  return confirmations
    .filter((confirmation) => confirmation.rejectQuantity + confirmation.reworkQuantity > 0)
    .sort((a, b) => (b.rejectQuantity + b.reworkQuantity) - (a.rejectQuantity + a.reworkQuantity));
}

function pauseMinutes(pauses: readonly ExecutionPause[], referenceEnd: string): number {
  return pauses.reduce((total, pause) => total + Math.max(0, (Date.parse(pause.resumedAt ?? referenceEnd) - Date.parse(pause.pausedAt)) / 60_000), 0);
}

/**
 * Run Time = elapsed window minus downtime. When `events` is supplied
 * (Capability 08), downtime is the governed Unplanned Downtime derived
 * exclusively from Production Events classified UNPLANNED_DOWNTIME for this
 * Requirement (Section 9/17) — never every execution pause blindly, since a
 * Planned Stop must not count against Availability. Omitting `events`
 * preserves the original pause-based behavior for callers outside OEE
 * (e.g. Lot Health), which this round does not redesign.
 */
export function knownRunTimeMinutes(execution: ProductionExecutionRecord, currentTime: string, events?: readonly ProductionEvent[]): number | null {
  if (!execution.actualStart) return null;
  const referenceEnd = execution.actualFinish ?? currentTime;
  const elapsed = (Date.parse(referenceEnd) - Date.parse(execution.actualStart)) / 60_000;
  const downtimeMinutes = events ? unplannedDowntimeMinutes(events, execution.lotId, referenceEnd) : pauseMinutes(execution.pauses, referenceEnd);
  return Math.max(0, Math.round(elapsed - downtimeMinutes));
}

export type PerformanceFoundationStatus = 'NOT_STARTED' | 'PREPARED' | 'BLOCKED';

export interface PerformanceFoundation {
  idealCycleTimeSeconds: number | null;
  runTimeMinutes: number | null;
  status: PerformanceFoundationStatus;
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

export function assessPerformanceFoundation(execution: ProductionExecutionRecord, idealCycleTimeSeconds: number | undefined, currentTime: string): PerformanceFoundation {
  const runTimeMinutes = knownRunTimeMinutes(execution, currentTime);
  const status: PerformanceFoundationStatus = execution.status === 'NOT_STARTED'
    ? 'NOT_STARTED'
    : runTimeMinutes !== null && runTimeMinutes > 0 && idealCycleTimeSeconds != null
      ? 'PREPARED'
      : 'BLOCKED';
  return { idealCycleTimeSeconds: idealCycleTimeSeconds ?? null, runTimeMinutes, status, demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' };
}
