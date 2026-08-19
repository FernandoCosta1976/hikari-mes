import type { ExecutionPause, ProductionExecutionRecord } from '../production-execution/models';
import { unplannedDowntimeMinutes, type ProductionEvent } from '../production-monitoring/models';

/**
 * Capability 09 — Qualidade e Perdas. Production Confirmation (Capability
 * 06) informs QUANTO produzimos; Quality Confirmation informs COMO
 * classificamos o que foi produzido — two distinct facts, never collapsed.
 * Each Quality Confirmation carries its OWN increment (good/reject/rework),
 * never a snapshot of Produced — the Requirement's Produced Quantity always
 * comes from SUM(Production Confirmations), Classified always from
 * SUM(Quality Confirmations), never re-asked here.
 */
export type QualityReasonCode = 'DIMENSIONAL' | 'VISUAL' | 'PROCESS_DEFECT' | 'OTHER_DEMONSTRATIVE';

/** DEMONSTRATIVE QUALITY TAXONOMY · BUSINESS_VALIDATION_REQUIRED (Section 10) — deliberately minimal. */
export const qualityReasonLabel: Record<QualityReasonCode, string> = {
  DIMENSIONAL: 'Defeito dimensional',
  VISUAL: 'Defeito visual',
  PROCESS_DEFECT: 'Falha de processo',
  OTHER_DEMONSTRATIVE: 'Outro motivo demonstrativo',
};

export type QualityDataOrigin = 'DEMONSTRATIVE_QUALITY' | 'USER_SIMULATION';

export interface ProductionQualityConfirmation {
  id: string;
  /** The Production Requirement (Lot) this classification belongs to. */
  lotId: string;
  resourceId: string;
  operator?: string;
  /** This confirmation's OWN increment — never a cumulative snapshot. */
  goodQuantity: number;
  rejectQuantity: number;
  reworkQuantity?: number;
  /** Required when rejectQuantity > 0 (Section 11), never required otherwise. */
  reasonCode?: QualityReasonCode;
  /** Session Operational Clock instant — never Date.now() (Section 33). */
  confirmedAt: string;
  dataOrigin: QualityDataOrigin;
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

export interface QualityTotals {
  good: number;
  reject: number;
  rework: number;
}

export function accumulatedQuality(confirmations: readonly ProductionQualityConfirmation[]): QualityTotals {
  return confirmations.reduce((totals, confirmation) => ({
    good: totals.good + confirmation.goodQuantity,
    reject: totals.reject + confirmation.rejectQuantity,
    rework: totals.rework + (confirmation.reworkQuantity ?? 0),
  }), { good: 0, reject: 0, rework: 0 });
}

export function classifiedQuantity(totals: QualityTotals): number {
  return totals.good + totals.reject + totals.rework;
}

/** Produced - Classified, never negative (Section 5). */
export function pendingClassification(producedQuantity: number, classified: number): number {
  return Math.max(0, producedQuantity - classified);
}

/**
 * Good / Classified (Section 18) — deliberately over Classified, never over
 * Produced: a Requirement still Pending Classification is neither assumed
 * good nor bad. When fully classified, Classified == Produced and the rate
 * reads the same either way.
 */
export function qualityRate(goodQuantity: number, classified: number): number | null {
  if (classified <= 0) return null;
  return goodQuantity / classified;
}

export function groupQualityConfirmationsByRequirement(confirmations: readonly ProductionQualityConfirmation[]): Readonly<Record<string, readonly ProductionQualityConfirmation[]>> {
  const byLot = new Map<string, ProductionQualityConfirmation[]>();
  for (const confirmation of confirmations) byLot.set(confirmation.lotId, [...(byLot.get(confirmation.lotId) ?? []), confirmation]);
  return Object.fromEntries(byLot);
}

export type QualityRejection =
  | { kind: 'REQUIRES_POSITIVE_TOTAL' }
  | { kind: 'MUST_BE_INTEGER' }
  | { kind: 'NEGATIVE_QUANTITY' }
  | { kind: 'EXCEEDS_PENDING'; pending: number }
  | { kind: 'REQUIRES_REASON' };

/**
 * Validation gate (Section 9/11): good/reject must be non-negative
 * integers, their sum must be positive, the sum can never exceed the
 * Pending Classification balance, and a Reason is required exactly when
 * Reject > 0 — never otherwise.
 */
export function validateQualityIncrement(params: { goodIncrement: number; rejectIncrement: number; pendingQuantity: number; reasonCode?: QualityReasonCode }): QualityRejection | null {
  const { goodIncrement, rejectIncrement, pendingQuantity, reasonCode } = params;
  if (!Number.isInteger(goodIncrement) || !Number.isInteger(rejectIncrement)) return { kind: 'MUST_BE_INTEGER' };
  if (goodIncrement < 0 || rejectIncrement < 0) return { kind: 'NEGATIVE_QUANTITY' };
  if (goodIncrement + rejectIncrement <= 0) return { kind: 'REQUIRES_POSITIVE_TOTAL' };
  if (goodIncrement + rejectIncrement > pendingQuantity) return { kind: 'EXCEEDS_PENDING', pending: pendingQuantity };
  if (rejectIncrement > 0 && !reasonCode) return { kind: 'REQUIRES_REASON' };
  return null;
}

export function buildQualityConfirmation(params: { id: string; lotId: string; resourceId: string; operator?: string; goodQuantity: number; rejectQuantity: number; reasonCode?: QualityReasonCode; confirmedAt: string; dataOrigin: QualityDataOrigin }): ProductionQualityConfirmation {
  return {
    id: params.id,
    lotId: params.lotId,
    resourceId: params.resourceId,
    operator: params.operator,
    goodQuantity: params.goodQuantity,
    rejectQuantity: params.rejectQuantity,
    reasonCode: params.reasonCode,
    confirmedAt: params.confirmedAt,
    dataOrigin: params.dataOrigin,
    demonstrative: true,
    ruleStatus: 'BUSINESS_VALIDATION_REQUIRED',
  };
}

/** Ranks any per-Requirement/Resource aggregate with known Reject/Rework, worst first — never assumes a specific row shape. */
export function sortByQualityLossDescending<T extends { reject: number; rework: number }>(rows: readonly T[]): readonly T[] {
  return [...rows].filter((row) => row.reject + row.rework > 0).sort((a, b) => (b.reject + b.rework) - (a.reject + a.rework));
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
  const actualStart = execution.actualStart;
  const referenceEnd = execution.actualFinish ?? currentTime;
  const elapsed = (Date.parse(referenceEnd) - Date.parse(actualStart)) / 60_000;
  // An Event that precedes the Requirement's own Actual Start already delayed the start
  // itself, which actualStart already reflects — subtracting it again from the elapsed
  // window (measured from actualStart onward) would double it. Same guard already governs
  // the Operational Timeline's downtime accounting (operationalTimelineAdapter.ts).
  const eventsAfterStart = events?.filter((event) => Date.parse(event.startedAt) >= Date.parse(actualStart));
  const downtimeMinutes = events ? unplannedDowntimeMinutes(eventsAfterStart!, execution.lotId, referenceEnd) : pauseMinutes(execution.pauses, referenceEnd);
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
