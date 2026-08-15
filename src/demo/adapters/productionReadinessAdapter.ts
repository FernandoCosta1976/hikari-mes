import type { MaterialResourceEligibilityProjection } from '../../domain/material-resource-eligibility/models';
import type { LotReadinessAssessment, ReadinessCondition, ReadinessStatus, ResourceReadinessAssessment } from '../../domain/production-readiness/models';
import type { ProductionSchedulingDefinition } from '../../domain/production-scheduling/models';
import { FOUNDRY_RESOURCE_IDS, type FoundryResourceId } from '../../domain/resource/models';
import type { DemoLotReadinessRecord } from '../fixtures/fundicaoDcProductionReadiness';

const condition = (kind: ReadinessCondition['kind'], status: ReadinessStatus, label: string, evidence: string): ReadinessCondition => ({ kind, status, label, evidence, source: 'DEMONSTRATIVE_READINESS_FIXTURE' });

const conditionsFor = (resourceId: FoundryResourceId, status: ReadinessStatus): readonly ReadinessCondition[] => [
  condition('AVAILABILITY', status === 'BLOCKED' ? 'BLOCKED' : status === 'UNKNOWN' ? 'UNKNOWN' : 'READY', 'Disponibilidade no intervalo', status === 'BLOCKED' ? 'Restrição demonstrativa conhecida no intervalo.' : status === 'UNKNOWN' ? 'Evidência ainda não confirmada.' : 'Sem impedimento conhecido no intervalo demonstrativo.'),
  condition('TOOLING', resourceId === 'DC03' ? 'ATTENTION' : status === 'UNKNOWN' ? 'UNKNOWN' : 'READY', 'Molde / ferramental', resourceId === 'DC03' ? 'Troca de molde demonstrativa requerida.' : status === 'UNKNOWN' ? 'Compatibilidade ainda não confirmada.' : 'Contexto requerido demonstrativamente compatível.'),
  condition('SETUP', resourceId === 'DC03' ? 'ATTENTION' : 'READY', 'Setup / troca', resourceId === 'DC03' ? 'Setup necessário; duração não calculada.' : 'Nenhuma troca identificada no cenário avaliado.'),
  condition('MAINTENANCE', resourceId === 'DC05' && status !== 'READY' ? 'BLOCKED' : 'READY', 'Manutenção / restrição', resourceId === 'DC05' && status !== 'READY' ? 'Restrição demonstrativa conhecida; validar intervalo.' : 'Sem restrição impeditiva conhecida.'),
  condition('MATERIAL', status === 'BLOCKED' ? 'ATTENTION' : 'READY', 'Matéria-prima', status === 'BLOCKED' ? 'Suficiência requer atenção antes do avanço.' : 'Quantidade demonstrativa disponível para o Lot.'),
  condition('STAGING', status === 'ATTENTION' ? 'ATTENTION' : status === 'UNKNOWN' ? 'UNKNOWN' : 'READY', 'Preparação no ponto', status === 'ATTENTION' ? 'Preparação demonstrativa pendente.' : status === 'UNKNOWN' ? 'Informação de preparação indisponível.' : 'Preparação demonstrativa atendida.'),
];

export function productionReadinessAdapter(records: readonly DemoLotReadinessRecord[], scheduling: ProductionSchedulingDefinition, eligibilities: readonly MaterialResourceEligibilityProjection[]): readonly LotReadinessAssessment[] {
  return records.flatMap((record) => {
    const lot = scheduling.lots.find((item) => item.id === record.lotId);
    if (!lot) return [];
    const eligibleIds = eligibilities.find((item) => item.materialId === lot.materialId)?.eligibleResourceIds ?? [];
    const resources: readonly ResourceReadinessAssessment[] = FOUNDRY_RESOURCE_IDS.map((resourceId) => {
      const eligible = eligibleIds.includes(resourceId);
      const candidateStatus: ReadinessStatus = resourceId === 'DC03' ? 'ATTENTION' : resourceId === 'DC05' ? 'UNKNOWN' : resourceId === lot.scheduledResourceId ? record.status : 'READY';
      return { resourceId, eligible, status: eligible ? candidateStatus : 'BLOCKED', conditions: eligible ? conditionsFor(resourceId, candidateStatus) : [], summary: eligible ? candidateStatus === 'READY' ? 'Condições atendidas no cenário demonstrativo.' : candidateStatus === 'ATTENTION' ? 'Condições exigem preparação ou acompanhamento.' : candidateStatus === 'UNKNOWN' ? 'Há evidência ainda não confirmada.' : 'Existe condição impeditiva demonstrativa.' : 'Material não elegível para esta máquina.' };
    });
    return [{ lotId: lot.id, status: record.status, summary: record.status === 'READY' ? 'Existe caminho viável demonstrativo.' : record.status === 'ATTENTION' ? 'Há condições que exigem atenção antes de avançar.' : record.status === 'BLOCKED' ? 'Existe condição impeditiva conhecida.' : 'Existem informações ainda desconhecidas.', resources, assessedAt: '2025-05-15T05:58:00-03:00', demonstrative: true as const }];
  });
}
