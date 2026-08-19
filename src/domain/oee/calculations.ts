import type { Lot, Shift } from '../production-scheduling/models';
import type { ProductionExecutionRecord } from '../production-execution/models';

/**
 * Planned Production Time (demonstrative rule, BUSINESS VALIDATION REQUIRED):
 * elapsed minutes from Scheduled Start (or Actual Start, if it happened
 * earlier than scheduled) to Actual Finish or Current Time — the same window
 * Run Time is measured over, bounded by the covering Shift so it never spans
 * past the Resource's operating window. Any gap between Scheduled and Actual
 * Start counts against Availability, matching the traditional OEE reading.
 * Planned shift breaks are not yet subtracted here: Run Time (reused as-is
 * from CAP-08) does not model break time as downtime, and subtracting it only
 * on one side of the ratio would understate Planned Time below Run Time.
 * N/A while the Lot has not started — there is no elapsed window yet.
 */
function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function timeOfDay(timestamp: string): string {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' }).format(new Date(timestamp));
}

function shiftForTimeOfDay(shifts: readonly Shift[], timestamp: string): Shift | undefined {
  const time = timeOfDay(timestamp);
  return shifts.find((shift) => time >= shift.startTime && time < shift.endTime) ?? shifts.find((shift) => time <= shift.endTime);
}

/** Which Shift a timestamp falls into — exported so per-Shift OEE can allocate a Lot without re-deriving this. */
export function resolveShift(shifts: readonly Shift[], timestamp: string): Shift | undefined {
  return shiftForTimeOfDay(shifts, timestamp);
}

export type ShiftStatus = 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';

export function classifyShiftStatus(shift: Shift, currentTime: string): ShiftStatus {
  const time = timeOfDay(currentTime);
  if (time >= shift.startTime && time < shift.endTime) return 'IN_PROGRESS';
  return time >= shift.endTime ? 'COMPLETED' : 'UPCOMING';
}

export function plannedProductionTimeMinutes(lot: Lot, execution: ProductionExecutionRecord, shifts: readonly Shift[], currentTime: string): number | null {
  if (execution.status === 'NOT_STARTED') return null;
  const windowStart = execution.actualStart && Date.parse(execution.actualStart) < Date.parse(lot.scheduledStart) ? execution.actualStart : lot.scheduledStart;
  const windowFinishRaw = execution.actualFinish ?? currentTime;
  // Actual Finish is a concrete historical fact — never clamp it to the Shift that covered
  // the window's START, or a Lot that legitimately ran across a Shift boundary (e.g. started
  // in Turno 3, finished in Turno 1) gets an under-counted Planned Time vs. its own Run Time
  // (CAP-08's knownRunTimeMinutes is never Shift-clamped). The Shift bound only makes sense
  // for an still-open window (no Actual Finish yet), to stop Planned Time drifting past the
  // Resource's current operating window while currentTime keeps advancing.
  let windowFinish = windowFinishRaw;
  if (!execution.actualFinish) {
    const shift = shiftForTimeOfDay(shifts, windowStart);
    const shiftFinish = shift ? `${windowStart.slice(0, 10)}T${shift.endTime}:00${windowStart.slice(19) || '+00:00'}` : windowFinishRaw;
    windowFinish = Date.parse(windowFinishRaw) < Date.parse(shiftFinish) ? windowFinishRaw : shiftFinish;
  }
  const elapsed = (Date.parse(windowFinish) - Date.parse(windowStart)) / 60_000;
  if (elapsed <= 0) return null;
  return Math.round(elapsed);
}

export function assessAvailability(runTimeMinutes: number | null, plannedTimeMinutes: number | null): number | null {
  if (runTimeMinutes === null || plannedTimeMinutes === null || plannedTimeMinutes <= 0) return null;
  return clamp01(runTimeMinutes / plannedTimeMinutes);
}

export function assessPerformance(idealCycleTimeSeconds: number | null, producedQuantity: number, runTimeMinutes: number | null): number | null {
  if (idealCycleTimeSeconds === null || runTimeMinutes === null || runTimeMinutes <= 0) return null;
  return clamp01((idealCycleTimeSeconds * producedQuantity) / (runTimeMinutes * 60));
}

export function assessOee(availability: number | null, performance: number | null, quality: number | null): number | null {
  if (availability === null || performance === null || quality === null) return null;
  return clamp01(availability * performance * quality);
}

export interface ResourceOeeInput {
  resourceId: string;
  runTimeMinutes: number | null;
  plannedTimeMinutes: number | null;
  idealCycleTimeSeconds: number | null;
  producedQuantity: number;
  /** Capability 09 — Good/Reject/Rework already classified for this Requirement; may be < producedQuantity while a Pending balance remains. */
  classifiedQuantity: number;
  goodQuantity: number | null;
}

/** Area-level aggregation from totals, not an average of per-Resource ratios. */
export function aggregateAvailability(rows: readonly Pick<ResourceOeeInput, 'runTimeMinutes' | 'plannedTimeMinutes'>[]): number | null {
  const eligible = rows.filter((row): row is { runTimeMinutes: number; plannedTimeMinutes: number } => row.runTimeMinutes !== null && row.plannedTimeMinutes !== null && row.plannedTimeMinutes > 0);
  if (!eligible.length) return null;
  const runTime = eligible.reduce((sum, row) => sum + row.runTimeMinutes, 0);
  const planned = eligible.reduce((sum, row) => sum + row.plannedTimeMinutes, 0);
  return planned > 0 ? clamp01(runTime / planned) : null;
}

export function aggregatePerformance(rows: readonly Pick<ResourceOeeInput, 'idealCycleTimeSeconds' | 'producedQuantity' | 'runTimeMinutes'>[]): number | null {
  const eligible = rows.filter((row): row is { idealCycleTimeSeconds: number; producedQuantity: number; runTimeMinutes: number } => row.idealCycleTimeSeconds !== null && row.runTimeMinutes !== null && row.runTimeMinutes > 0);
  if (!eligible.length) return null;
  const idealTotal = eligible.reduce((sum, row) => sum + row.idealCycleTimeSeconds * row.producedQuantity, 0);
  const runTimeSeconds = eligible.reduce((sum, row) => sum + row.runTimeMinutes * 60, 0);
  return runTimeSeconds > 0 ? clamp01(idealTotal / runTimeSeconds) : null;
}

/**
 * Capability 09 (Section 20/26) — Good/Classified, never Good/Produced: a
 * Requirement still carrying a Pending Classification balance must not have
 * its unclassified pieces silently treated as loss.
 */
export function aggregateQuality(rows: readonly Pick<ResourceOeeInput, 'classifiedQuantity' | 'goodQuantity'>[]): number | null {
  const eligible = rows.filter((row): row is { classifiedQuantity: number; goodQuantity: number } => row.classifiedQuantity > 0 && row.goodQuantity !== null);
  if (!eligible.length) return null;
  const classified = eligible.reduce((sum, row) => sum + row.classifiedQuantity, 0);
  const good = eligible.reduce((sum, row) => sum + row.goodQuantity, 0);
  return classified > 0 ? clamp01(good / classified) : null;
}

export type OeeDimension = 'AVAILABILITY' | 'PERFORMANCE' | 'QUALITY';

export interface OeeImpact {
  dimension: OeeDimension;
  resourceId: string;
  lossFraction: number;
}

export interface ResourceOeeRow extends ResourceOeeInput {
  availability: number | null;
  performance: number | null;
  quality: number | null;
  oee: number | null;
}

export function topOeeImpacts(rows: readonly ResourceOeeRow[], limit = 3): readonly OeeImpact[] {
  const candidates: OeeImpact[] = [];
  for (const row of rows) {
    if (row.availability !== null) candidates.push({ dimension: 'AVAILABILITY', resourceId: row.resourceId, lossFraction: 1 - row.availability });
    if (row.performance !== null) candidates.push({ dimension: 'PERFORMANCE', resourceId: row.resourceId, lossFraction: 1 - row.performance });
    if (row.quality !== null) candidates.push({ dimension: 'QUALITY', resourceId: row.resourceId, lossFraction: 1 - row.quality });
  }
  return candidates.filter((candidate) => candidate.lossFraction > 0.0001).sort((a, b) => b.lossFraction - a.lossFraction).slice(0, limit);
}
