import type { OperationalFactOrigin } from '../automation/models';

/**
 * A single production-count apontamento — either received automatically from
 * the demonstrative Automation/Digitalização layer or entered manually by an
 * operator. DEMONSTRATIVE / FUTURE INTEGRATION: no real machine signal.
 */
export interface ProductionReportEntry {
  lotId: string;
  quantity: number;
  reportedAt: string;
  origin: OperationalFactOrigin;
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

export function reportsForLot(entries: readonly ProductionReportEntry[], lotId: string): readonly ProductionReportEntry[] {
  return entries.filter((entry) => entry.lotId === lotId).sort((a, b) => Date.parse(b.reportedAt) - Date.parse(a.reportedAt));
}

export function latestReport(entries: readonly ProductionReportEntry[], lotId: string): ProductionReportEntry | undefined {
  return reportsForLot(entries, lotId)[0];
}
