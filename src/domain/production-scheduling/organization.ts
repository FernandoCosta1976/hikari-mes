import type { FoundryResourceId } from '../resource/models';

/**
 * Operational reorganization of a Lot to a Resource other than the one it was
 * Planned/Scheduled on. Programmed Resource is never overwritten — it stays
 * on the Lot as the received-plan baseline; Operational Resource is the
 * adopted, demonstrative override that downstream Release/Execution use.
 */
export interface LotOrganization {
  lotId: string;
  programmedResourceId: FoundryResourceId;
  operationalResourceId: FoundryResourceId;
  organizedAt: string;
  organizedBy: string;
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

export interface ResourceReassignment {
  lotId: string;
  originalResourceId: FoundryResourceId;
  simulatedResourceId: FoundryResourceId;
}

export function adoptOrganization(impact: ResourceReassignment, organizedAt: string, organizedBy: string): LotOrganization {
  return { lotId: impact.lotId, programmedResourceId: impact.originalResourceId, operationalResourceId: impact.simulatedResourceId, organizedAt, organizedBy, demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' };
}
