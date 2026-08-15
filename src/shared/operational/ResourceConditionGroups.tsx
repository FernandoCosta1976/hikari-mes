import type { ResourceReadinessAssessment } from '../../domain/production-readiness/models';
import { groupResourceReadiness } from '../../domain/production-readiness/presentation';
import type { FoundryResourceId } from '../../domain/resource/models';
import { Badge } from '../ui/Badge/Badge';
import styles from './ResourceConditionGroups.module.css';

const labels = { READY: 'Com condição', ATTENTION: 'Requer atenção', BLOCKED: 'Sem condição', UNKNOWN: 'Informação insuficiente' } as const;
const tones = { READY: 'positive', ATTENTION: 'attention', BLOCKED: 'unavailable', UNKNOWN: 'neutral' } as const;
const reasonFor = (resource: ResourceReadinessAssessment) => resource.conditions.find((condition) => condition.status === resource.status)?.label ?? resource.conditions.find((condition) => condition.status !== 'READY')?.label ?? resource.summary;

function ResourceItem({ resource, programmedResourceId, compact = false }: { resource: ResourceReadinessAssessment; programmedResourceId: FoundryResourceId; compact?: boolean }) {
  return <article className={styles.item} data-compact={compact} data-resource-id={resource.resourceId}><div><strong>{resource.resourceId}</strong>{resource.resourceId === programmedResourceId ? <small>Programada</small> : null}</div><Badge tone={resource.eligible ? tones[resource.status] : 'neutral'}>{resource.eligible ? labels[resource.status] : 'Não elegível'}</Badge>{!compact ? <p>{reasonFor(resource)}</p> : null}</article>;
}

export function ResourceConditionGroups({ resources, programmedResourceId }: { resources: readonly ResourceReadinessAssessment[]; programmedResourceId: FoundryResourceId }) {
  const groups = groupResourceReadiness(resources);
  return <section className={styles.groups} aria-label="Máquinas agrupadas por condição">
    <div data-resource-group="READY"><h3>Com condição <span>{groups.ready.length}</span></h3><div>{groups.ready.length ? groups.ready.map((resource) => <ResourceItem key={resource.resourceId} resource={resource} programmedResourceId={programmedResourceId} />) : <p>Nenhuma máquina neste grupo.</p>}</div></div>
    <div data-resource-group="ATTENTION"><h3>Requer atenção <span>{groups.attention.length}</span></h3><div>{groups.attention.length ? groups.attention.map((resource) => <ResourceItem key={resource.resourceId} resource={resource} programmedResourceId={programmedResourceId} />) : <p>Nenhuma máquina neste grupo.</p>}</div></div>
    <div data-resource-group="UNAVAILABLE"><h3>Sem condição <span>{groups.unavailable.length}</span></h3><div>{groups.unavailable.map((resource) => <ResourceItem key={resource.resourceId} resource={resource} programmedResourceId={programmedResourceId} compact />)}</div></div>
    <p className={styles.boundary}>Condição técnica e contexto operacional apoiam a análise; não representam escolha ou atribuição de máquina.</p>
  </section>;
}
