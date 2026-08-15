export type DownstreamAreaStatus = 'PROTECTED' | 'ATTENTION' | 'RISK' | 'UNKNOWN';

/**
 * Downstream visibility only — the Fundição does not operate this area.
 * DEMONSTRATIVE / BUSINESS VALIDATION REQUIRED: coverage hours are a
 * deterministic scenario fact, not a governed supply-chain calculation.
 */
export interface DownstreamAreaHealth {
  area: string;
  status: DownstreamAreaStatus;
  currentCoverageHours: number;
  targetCoverageHours: number;
  projectedCoverageHours: number;
  criticalMaterial: string;
  nextExpectedLotId: string;
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

/** Demonstrative classification from coverage vs. target — not a governed supply-chain rule. */
export function classifyDownstreamStatus(projectedCoverageHours: number, targetCoverageHours: number): DownstreamAreaStatus {
  if (projectedCoverageHours >= targetCoverageHours) return 'PROTECTED';
  if (projectedCoverageHours >= targetCoverageHours * 0.7) return 'ATTENTION';
  return 'RISK';
}
