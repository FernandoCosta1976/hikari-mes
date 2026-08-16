import type { ReadinessStatus } from '../production-readiness/models';

export type ProductionReleaseStatus = 'NOT_RELEASED' | 'READY_FOR_RELEASE' | 'RELEASE_ATTENTION' | 'BLOCKED_FOR_RELEASE' | 'RELEASED' | 'RELEASE_REVOKED';
export type ReleaseType = 'AUTOMATIC' | 'MANUAL';
export type RevocationReason = 'PLAN_CHANGE' | 'RESOURCE_UNAVAILABLE' | 'MATERIAL' | 'TOOLING' | 'QUALITY' | 'PCP_DECISION' | 'OTHER';

export const revocationReasonLabel: Record<RevocationReason, string> = {
  PLAN_CHANGE: 'Alteração do plano',
  RESOURCE_UNAVAILABLE: 'Indisponibilidade da máquina',
  MATERIAL: 'Material',
  TOOLING: 'Ferramental/molde',
  QUALITY: 'Qualidade',
  PCP_DECISION: 'Decisão PCP',
  OTHER: 'Outro',
};

export interface ProductionReleaseContext {
  lotId: string;
  productionOrderId: string;
  resourceId: string;
  scheduleVersionId: string;
  scheduledStart: string;
  scheduledFinish: string;
  readiness: ReadinessStatus;
}

export interface ProductionReleaseRecord {
  lotId: string;
  productionOrderId: string;
  resourceId: string;
  scheduleVersionId: string;
  status: ProductionReleaseStatus;
  readiness: ReadinessStatus;
  reason: string;
  releaseType?: ReleaseType;
  releasedAt?: string;
  releasedBy?: string;
  revokedAt?: string;
  revokedBy?: string;
  revocationReason?: RevocationReason;
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

export function assessDemonstrativeRelease(context: ProductionReleaseContext): ProductionReleaseRecord {
  const base = { lotId: context.lotId, productionOrderId: context.productionOrderId, resourceId: context.resourceId, scheduleVersionId: context.scheduleVersionId, readiness: context.readiness, demonstrative: true as const, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' as const };
  const organized = Boolean(context.resourceId && context.scheduledStart && context.scheduledFinish);
  if (context.readiness === 'READY' && organized) return { ...base, status: 'READY_FOR_RELEASE', reason: 'Evidências mínimas conhecidas, horário definido e máquina organizada.' };
  if (context.readiness === 'BLOCKED') return { ...base, status: 'BLOCKED_FOR_RELEASE', reason: 'Existe condição impeditiva na preparação.' };
  if (context.readiness === 'ATTENTION') return { ...base, status: 'RELEASE_ATTENTION', reason: 'A preparação requer revisão antes da liberação demonstrativa.' };
  return { ...base, status: 'NOT_RELEASED', reason: 'Há evidência mínima ainda desconhecida.' };
}

export function releaseDemonstratively(record: ProductionReleaseRecord, releasedAt: string, releasedBy = 'Supervisor da Fundição · demonstrativo'): ProductionReleaseRecord {
  if (record.status !== 'READY_FOR_RELEASE') return record;
  return { ...record, status: 'RELEASED', releaseType: 'MANUAL', releasedAt, releasedBy };
}

/**
 * REGRA DEMONSTRATIVA — VALIDAÇÃO DE NEGÓCIO NECESSÁRIA. Auto-releases a Lot
 * only when the caller has already confirmed a fixed Material→Resource rule
 * applies (see fundicaoDcAutoReleaseRuleFixture) — this function does not
 * invent eligibility on its own.
 */
export function releaseAutomatically(record: ProductionReleaseRecord, releasedAt: string): ProductionReleaseRecord {
  if (record.status !== 'READY_FOR_RELEASE') return record;
  return { ...record, status: 'RELEASED', releaseType: 'AUTOMATIC', releasedAt, releasedBy: 'Regra automática HIKARI' };
}

/** Revocation is only allowed before the Lot has started producing. */
export function revokeRelease(record: ProductionReleaseRecord, revokedAt: string, revokedBy: string, revocationReason: RevocationReason, started: boolean): ProductionReleaseRecord {
  if (record.status !== 'RELEASED' || started) return record;
  return { ...record, status: 'RELEASE_REVOKED', revokedAt, revokedBy, revocationReason };
}
