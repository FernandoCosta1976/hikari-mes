import type { ReadinessStatus } from '../production-readiness/models';

export type ProductionReleaseStatus = 'NOT_RELEASED' | 'READY_FOR_RELEASE' | 'RELEASE_ATTENTION' | 'BLOCKED_FOR_RELEASE' | 'RELEASED';

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
  releasedAt?: string;
  releasedBy?: string;
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
  return { ...record, status: 'RELEASED', releasedAt, releasedBy };
}
