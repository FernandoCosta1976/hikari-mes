import type { ProductionExecutionRecord } from '../production-execution/models';
import type { Lot } from '../production-scheduling/models';

export type DeviationClassification = 'ON_PLAN' | 'EARLY' | 'LATE' | 'STOPPED' | 'AT_RISK';

export interface DeviationAssessment {
  classification: DeviationClassification;
  startDeviationMinutes: number | null;
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

const START_TOLERANCE_MINUTES = 10;

function startDeviationMinutes(execution: ProductionExecutionRecord, lot: Lot): number | null {
  if (!execution.actualStart) return null;
  return Math.round((Date.parse(execution.actualStart) - Date.parse(lot.scheduledStart)) / 60_000);
}

export function assessDeviation(execution: ProductionExecutionRecord, lot: Lot, currentTime: string): DeviationAssessment {
  const base = { demonstrative: true as const, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' as const };
  if (execution.status === 'PAUSED') return { ...base, classification: 'STOPPED', startDeviationMinutes: startDeviationMinutes(execution, lot) };
  if (execution.status === 'NOT_STARTED') {
    const classification = Date.parse(currentTime) > Date.parse(lot.scheduledStart) ? 'LATE' : 'ON_PLAN';
    return { ...base, classification, startDeviationMinutes: null };
  }
  const deviation = startDeviationMinutes(execution, lot);
  if (deviation === null) return { ...base, classification: 'ON_PLAN', startDeviationMinutes: null };
  if (deviation <= -START_TOLERANCE_MINUTES) return { ...base, classification: 'EARLY', startDeviationMinutes: deviation };
  if (deviation >= START_TOLERANCE_MINUTES) return { ...base, classification: 'LATE', startDeviationMinutes: deviation };
  return { ...base, classification: 'ON_PLAN', startDeviationMinutes: deviation };
}

export function adherenceSummary(assessments: readonly DeviationClassification[]) {
  const onPlan = assessments.filter((classification) => classification === 'ON_PLAN').length;
  return { onPlan, total: assessments.length, ratio: assessments.length ? onPlan / assessments.length : 0 };
}

const RELEVANCE_ORDER: Record<DeviationClassification, number> = { STOPPED: 0, LATE: 1, AT_RISK: 2, EARLY: 3, ON_PLAN: 4 };
export function byOperationalRelevance(a: DeviationClassification, b: DeviationClassification): number {
  return RELEVANCE_ORDER[a] - RELEVANCE_ORDER[b];
}

export function nextLotOnResource(lots: readonly Lot[], resourceId: string, afterStart: string): Lot | undefined {
  return lots
    .filter((lot) => lot.scheduledResourceId === resourceId && Date.parse(lot.scheduledStart) > Date.parse(afterStart))
    .sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart))[0];
}

export interface SequenceImpact {
  impactedLot: Lot;
  classification: 'AT_RISK';
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

const BLOCKING_CLASSIFICATIONS: readonly DeviationClassification[] = ['STOPPED', 'LATE'];

export function assessSequenceImpact(lots: readonly Lot[], lot: Lot, classification: DeviationClassification): SequenceImpact | null {
  if (!BLOCKING_CLASSIFICATIONS.includes(classification)) return null;
  const impactedLot = nextLotOnResource(lots, lot.scheduledResourceId, lot.scheduledStart);
  return impactedLot ? { impactedLot, classification: 'AT_RISK', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' } : null;
}
