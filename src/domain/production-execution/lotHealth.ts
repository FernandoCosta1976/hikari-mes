import { knownRunTimeMinutes } from '../production-quality/models';
import type { ProductionExecutionRecord } from './models';

export type LotHealthStatus = 'NOT_DUE' | 'AT_RISK' | 'ON_TRACK' | 'LATE_NOT_STARTED' | 'STARTED_LATE' | 'BEHIND_PLAN' | 'AHEAD_OF_PLAN' | 'COMPLETED' | 'UNKNOWN' | 'NOT_MONITORED';

export const lotHealthIcon: Record<LotHealthStatus, string> = { NOT_DUE: '○', AT_RISK: '△', ON_TRACK: '✓', LATE_NOT_STARTED: '◷', STARTED_LATE: '◷', BEHIND_PLAN: '⚠', AHEAD_OF_PLAN: '↗', COMPLETED: '✓', UNKNOWN: '?', NOT_MONITORED: '○' };
export const lotHealthLabel: Record<LotHealthStatus, string> = { NOT_DUE: 'Ainda não devido', AT_RISK: 'Risco de atraso', ON_TRACK: 'No plano', LATE_NOT_STARTED: 'Atrasado para iniciar', STARTED_LATE: 'Início atrasado', BEHIND_PLAN: 'Abaixo do plano', AHEAD_OF_PLAN: 'Adiantado', COMPLETED: 'Concluído', UNKNOWN: 'Sem dados', NOT_MONITORED: 'Sem acompanhamento' };
export const lotHealthTone: Record<LotHealthStatus, 'neutral' | 'attention' | 'attentionStrong' | 'positive' | 'informational'> = { NOT_DUE: 'neutral', AT_RISK: 'attention', ON_TRACK: 'positive', LATE_NOT_STARTED: 'attentionStrong', STARTED_LATE: 'attention', BEHIND_PLAN: 'attentionStrong', AHEAD_OF_PLAN: 'informational', COMPLETED: 'positive', UNKNOWN: 'neutral', NOT_MONITORED: 'neutral' };

const START_LATE_TOLERANCE_MINUTES = 10;

export interface LotHealthProjection {
  status: LotHealthStatus;
  startedLate: boolean;
  startDeviationMinutes: number | null;
  cycleTimeSecondsPerPiece: number | null;
  productionDurationSeconds: number | null;
  runTimeMinutes: number | null;
  expectedQuantityNow: number | null;
  gapQuantity: number | null;
  projectedFinish: string | null;
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

/** Engineering Work Content: the canonical time base for a Lot — reused everywhere a Lot's duration or width is derived. */
export function productionDurationSeconds(quantity: number, cycleTimeSecondsPerPiece: number): number {
  return quantity * cycleTimeSecondsPerPiece;
}

function quantityTolerance(expected: number): number {
  return Math.max(2, Math.round(expected * 0.1));
}

/**
 * Single canonical Lot health projection — every screen must render this
 * result via LotHealthIndicator, never recompute the classification itself.
 * DEMONSTRATIVE / BUSINESS VALIDATION REQUIRED.
 */
export function assessLotExecutionHealth(execution: ProductionExecutionRecord | null, producedQuantity: number, scheduledStart: string, scheduledFinish: string, cycleTimeSecondsPerPiece: number | undefined, currentTime: string): LotHealthProjection {
  const base = { demonstrative: true as const, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' as const };

  if (execution === null) {
    // No simulated execution fact exists for this Lot (it is not one of the monitored DCs' current Lots).
    // A Scheduled Start in the past does NOT mean it is late — it means it was never simulated.
    const status: LotHealthStatus = Date.parse(currentTime) > Date.parse(scheduledStart) ? 'NOT_MONITORED' : 'NOT_DUE';
    return { ...base, status, startedLate: false, startDeviationMinutes: null, cycleTimeSecondsPerPiece: cycleTimeSecondsPerPiece ?? null, productionDurationSeconds: null, runTimeMinutes: null, expectedQuantityNow: null, gapQuantity: null, projectedFinish: null };
  }

  const cycleTime = cycleTimeSecondsPerPiece ?? null;
  const durationSeconds = cycleTime !== null ? productionDurationSeconds(execution.plannedQuantity, cycleTime) : null;
  const startDeviationMinutes = execution.actualStart ? Math.round((Date.parse(execution.actualStart) - Date.parse(scheduledStart)) / 60_000) : null;
  const startedLate = startDeviationMinutes !== null && startDeviationMinutes > START_LATE_TOLERANCE_MINUTES;

  if (execution.status === 'COMPLETED') return { ...base, status: 'COMPLETED', startedLate, startDeviationMinutes, cycleTimeSecondsPerPiece: cycleTime, productionDurationSeconds: durationSeconds, runTimeMinutes: null, expectedQuantityNow: null, gapQuantity: null, projectedFinish: null };

  if (execution.status === 'NOT_STARTED') {
    const status: LotHealthStatus = Date.parse(currentTime) > Date.parse(scheduledStart) ? 'LATE_NOT_STARTED' : 'NOT_DUE';
    return { ...base, status, startedLate: false, startDeviationMinutes: null, cycleTimeSecondsPerPiece: cycleTime, productionDurationSeconds: durationSeconds, runTimeMinutes: null, expectedQuantityNow: null, gapQuantity: null, projectedFinish: null };
  }

  const runTimeMinutes = knownRunTimeMinutes(execution, currentTime);
  if (cycleTime === null || runTimeMinutes === null) return { ...base, status: 'UNKNOWN', startedLate, startDeviationMinutes, cycleTimeSecondsPerPiece: cycleTime, productionDurationSeconds: durationSeconds, runTimeMinutes, expectedQuantityNow: null, gapQuantity: null, projectedFinish: null };

  const expectedQuantityNow = Math.min(execution.plannedQuantity, Math.floor((runTimeMinutes * 60) / cycleTime));
  const gapQuantity = producedQuantity - expectedQuantityNow;
  const tolerance = quantityTolerance(expectedQuantityNow);

  let projectedFinish: string | null = null;
  if (runTimeMinutes > 0 && producedQuantity > 0) {
    const rate = producedQuantity / runTimeMinutes;
    const remaining = execution.plannedQuantity - producedQuantity;
    projectedFinish = rate > 0 ? new Date(Date.parse(currentTime) + (remaining / rate) * 60_000).toISOString() : null;
  }

  let status: LotHealthStatus;
  if (gapQuantity < -tolerance) status = 'BEHIND_PLAN';
  else if (gapQuantity > tolerance) status = 'AHEAD_OF_PLAN';
  else if (projectedFinish !== null && Date.parse(projectedFinish) > Date.parse(scheduledFinish)) status = 'AT_RISK';
  else status = 'ON_TRACK';

  return { ...base, status, startedLate, startDeviationMinutes, cycleTimeSecondsPerPiece: cycleTime, productionDurationSeconds: durationSeconds, runTimeMinutes, expectedQuantityNow, gapQuantity, projectedFinish };
}

const ATTENTION_ORDER: readonly LotHealthStatus[] = ['LATE_NOT_STARTED', 'BEHIND_PLAN', 'AT_RISK', 'STARTED_LATE', 'ON_TRACK', 'AHEAD_OF_PLAN', 'NOT_DUE', 'NOT_MONITORED', 'COMPLETED', 'UNKNOWN'];
export function byLotHealthAttention(a: LotHealthStatus, b: LotHealthStatus): number {
  return ATTENTION_ORDER.indexOf(a) - ATTENTION_ORDER.indexOf(b);
}
