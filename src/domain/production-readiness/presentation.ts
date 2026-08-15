import type { LotReadinessAssessment, ReadinessCondition, ResourceReadinessAssessment } from './models';
import type { FoundryResourceId } from '../resource/models';

export function dominantReadinessCondition(assessment: LotReadinessAssessment, programmedResourceId: FoundryResourceId): ReadinessCondition | undefined {
  const programmed = assessment.resources.find((resource) => resource.resourceId === programmedResourceId);
  if (!programmed?.eligible) return undefined;
  return programmed.conditions.find((condition) => condition.status === assessment.status)
    ?? programmed.conditions.find((condition) => condition.status !== 'READY');
}

export interface ResourceReadinessGroups {
  ready: readonly ResourceReadinessAssessment[];
  attention: readonly ResourceReadinessAssessment[];
  unavailable: readonly ResourceReadinessAssessment[];
}

export function groupResourceReadiness(resources: readonly ResourceReadinessAssessment[]): ResourceReadinessGroups {
  return {
    ready: resources.filter((resource) => resource.eligible && resource.status === 'READY'),
    attention: resources.filter((resource) => resource.eligible && (resource.status === 'ATTENTION' || resource.status === 'UNKNOWN')),
    unavailable: resources.filter((resource) => !resource.eligible || resource.status === 'BLOCKED'),
  };
}
