import type { FoundryResourceId } from '../resource/models';

export type ReadinessStatus = 'READY' | 'ATTENTION' | 'BLOCKED' | 'UNKNOWN';
export type ReadinessConditionKind = 'AVAILABILITY' | 'TOOLING' | 'SETUP' | 'MAINTENANCE' | 'MATERIAL' | 'STAGING';

export interface ReadinessCondition {
  kind: ReadinessConditionKind;
  status: ReadinessStatus;
  label: string;
  evidence: string;
  source: 'DEMONSTRATIVE_READINESS_FIXTURE';
}

export interface ResourceReadinessAssessment {
  resourceId: FoundryResourceId;
  eligible: boolean;
  status: ReadinessStatus;
  conditions: readonly ReadinessCondition[];
  summary: string;
}

export interface LotReadinessAssessment {
  lotId: string;
  status: ReadinessStatus;
  summary: string;
  resources: readonly ResourceReadinessAssessment[];
  assessedAt: string;
  demonstrative: true;
}
