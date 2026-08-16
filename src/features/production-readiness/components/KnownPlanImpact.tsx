import type { ResourceReadinessAssessment } from '../../../domain/production-readiness/models';
import type { Lot, Material, ScheduledSetup } from '../../../domain/production-scheduling/models';
import type { FoundryResourceId } from '../../../domain/resource/models';
import styles from '../ProductionReadinessPage.module.css';

export function KnownPlanImpact({ resources, lots, setups, materials, programmedResourceId }: { resources: readonly ResourceReadinessAssessment[]; lots: readonly Lot[]; setups: readonly ScheduledSetup[]; materials: readonly Material[]; programmedResourceId: FoundryResourceId }) {
  return <section className={styles.knownImpact} aria-labelledby="known-impact-title"><header><h2 id="known-impact-title">Impacto conhecido</h2><p>Somente fatos demonstrativos do plano atual; sem recomendação ou cálculo de melhor slot.</p></header><div>{resources.map((resource) => {
    const resourceLots = lots.filter((lot) => lot.scheduledResourceId === resource.resourceId).sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart));
    const materialSequence = resourceLots.map((lot) => materials.find((material) => material.id === lot.materialId)?.name).filter((name, index, values) => name && (index === 0 || values[index - 1] !== name));
    const resourceSetups = setups.filter((setup) => setup.resourceId === resource.resourceId);
    const attention = resource.conditions.find((condition) => condition.status !== 'READY');
    return <article key={resource.resourceId}><h3>{resource.resourceId}{resource.resourceId === programmedResourceId ? <small>Programada</small> : null}</h3><ul><li>{resourceLots.length} Lotes já programados no período</li><li>Sequência: {materialSequence.join(' → ') || 'sem Material programado'}</li><li>{resourceSetups.length ? `${resourceSetups.length} Setup existente no plano` : 'Nenhum Setup existente no período'}</li><li>{attention ? `${attention.label}: ${attention.evidence}` : 'Sem restrição conhecida no cenário'}</li></ul></article>;
  })}</div></section>;
}
