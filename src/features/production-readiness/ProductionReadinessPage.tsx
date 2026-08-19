import { useEffect, useState } from 'react';
import { useLiveScenarioTime } from '../../app/clock/applicationClock';
import { withBase } from '../../app/routing/basePath';
import { useScenarioPath } from '../../app/routing/useScenarioPath';
import { useWorkspaceSidebar } from '../../app/providers/WorkspaceSidebarContext';
import { OperationalWorkspace } from '../../app/workspace/OperationalWorkspace';
import { fundicaoDcMoldsFixture } from '../../demo/fixtures/fundicaoDcMolds';
import { selectAllProductionEvents, selectProductionExecutions, selectProductionReadiness, selectProductionReleases, selectProductionScheduling, selectScenarioDefinition, selectSessionClock, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { computeOperationalTimeline, operationalTimelineByRequirementId } from '../../demo/adapters/operationalTimelineAdapter';
import { classifyMoldLife, moldForResource } from '../../domain/mold/models';
import type { ReadinessCondition, ReadinessStatus, ResourceReadinessAssessment } from '../../domain/production-readiness/models';
import { dominantReadinessCondition, groupResourceReadiness } from '../../domain/production-readiness/presentation';
import { deriveScheduledSetups } from '../../domain/production-scheduling/setups';
import { shiftForLot, shiftWindow } from '../../domain/production-scheduling/shifts';
import { Badge } from '../../shared/ui/Badge/Badge';
import { Button } from '../../shared/ui/Button/Button';
import { ResourceConditionGroups } from '../../shared/operational/ResourceConditionGroups';
import { destinationLabels, formatDate, formatTime } from '../../shared/presentation/productionFormatting';
import { HourByHourSchedule } from '../production-scheduling/components/HourByHourSchedule';
import { KnownPlanImpact } from './components/KnownPlanImpact';
import styles from './ProductionReadinessPage.module.css';

const statusLabels: Record<ReadinessStatus, string> = { READY: 'Condições atendidas', ATTENTION: 'Atenção', BLOCKED: 'Condição impeditiva', UNKNOWN: 'Informação insuficiente' };
const statusTones: Record<ReadinessStatus, 'positive' | 'attention' | 'unavailable' | 'neutral'> = { READY: 'positive', ATTENTION: 'attention', BLOCKED: 'unavailable', UNKNOWN: 'neutral' };
const moldStatusLabel = { NORMAL: 'Normal', ATTENTION: 'Atenção', MAINTENANCE_RECOMMENDED: 'Manutenção recomendada' } as const;
const moldStatusTone = { NORMAL: 'positive', ATTENTION: 'attention', MAINTENANCE_RECOMMENDED: 'attention' } as const;
const statusIcons: Record<ReadinessStatus, string> = { READY: '✓', ATTENTION: '!', BLOCKED: '×', UNKNOWN: '?' };
const filters: readonly (ReadinessStatus | 'ALL')[] = ['ALL', 'ATTENTION', 'BLOCKED', 'UNKNOWN', 'READY'];

function ConditionRow({ condition }: { condition: ReadinessCondition }) {
  return <li><span aria-hidden="true">{statusIcons[condition.status]}</span><div><strong>{condition.label}</strong><small>{condition.evidence}</small></div><Badge tone={statusTones[condition.status]}>{statusLabels[condition.status]}</Badge></li>;
}

function ResourceCard({ resource, scheduled, onOpen }: { resource: ResourceReadinessAssessment; scheduled: boolean; onOpen: () => void }) {
  return <article className={styles.resourceCard} data-status={resource.status} data-eligible={resource.eligible}>
    <header><div><h3>{resource.resourceId}</h3>{scheduled ? <small>Máquina programada · demonstrativa</small> : <small>Máquina candidata</small>}</div><Badge tone={resource.eligible ? statusTones[resource.status] : 'neutral'}>{resource.eligible ? statusLabels[resource.status] : 'Não elegível'}</Badge></header>
    <p>{resource.summary}</p>
    {resource.eligible ? <ul className={styles.conditionPreview}>{resource.conditions.filter((item) => item.status !== 'READY').slice(0, 2).map((item) => <li key={item.kind}><strong>{item.label}:</strong> {item.evidence}</li>)}</ul> : <p className={styles.muted}>Sem avaliação operacional adicional após a eliminação estrutural.</p>}
    <Button data-readiness-resource={resource.resourceId} onClick={onOpen}>Ver condições de {resource.resourceId}</Button>
  </article>;
}

function ReadinessQueue({ filter, onFilter }: { filter: ReadinessStatus | 'ALL'; onFilter: (value: ReadinessStatus | 'ALL') => void }) {
  return <section className={styles.queue}><h2>Filtro da fila</h2><div className={styles.filters}>{filters.map((item) => <Button key={item} aria-pressed={filter === item} onClick={() => onFilter(item)}>{item === 'ALL' ? 'Todas as condições' : statusLabels[item]}</Button>)}</div><p>Uma única fila operacional é apresentada na área principal.</p></section>;
}

export function ProductionReadinessPage() {
  const scenarioPath = useScenarioPath();
  const scheduling = useScenarioStore(selectProductionScheduling);
  const scenarioDefinition = useScenarioStore(selectScenarioDefinition);
  const assessments = useScenarioStore(selectProductionReadiness);
  const productionReleases = useScenarioStore(selectProductionReleases);
  const sessionClock = useScenarioStore(selectSessionClock);
  const currentTime = useLiveScenarioTime(sessionClock ?? scenarioDefinition?.currentScenarioTime);
  const executionsByLot = useScenarioStore(selectProductionExecutions);
  const events = useScenarioStore(selectAllProductionEvents);
  const { expanded, setExpanded } = useWorkspaceSidebar();
  const requestedLotId = new URLSearchParams(window.location.search).get('lotId');
  const initialLotId = assessments.some((item) => item.lotId === requestedLotId) ? requestedLotId! : null;
  const [selectedLotId, setSelectedLotId] = useState(initialLotId);
  const [filter, setFilter] = useState<ReadinessStatus | 'ALL'>('ALL');
  const [detailResourceId, setDetailResourceId] = useState<string | null>(null);
  useEffect(() => {
    if (!assessments.length) return;
    const requested = new URLSearchParams(window.location.search).get('lotId');
    if (selectedLotId === null) {
      if (assessments.some((item) => item.lotId === requested)) setSelectedLotId(requested!);
      return;
    }
    if (assessments.some((item) => item.lotId === selectedLotId)) return;
    setSelectedLotId(assessments.some((item) => item.lotId === requested) ? requested! : null);
  }, [assessments, selectedLotId]);
  const assessment = assessments.find((item) => item.lotId === selectedLotId);
  const lot = scheduling?.lots.find((item) => item.id === selectedLotId);
  const material = scheduling?.materials.find((item) => item.id === lot?.materialId);
  const order = scheduling?.productionOrders.find((item) => item.id === lot?.productionOrderId);
  const schedule = scheduling?.schedules.find((item) => item.lotIds.includes(lot?.id ?? ''));
  const version = scheduling?.scheduleVersions.find((item) => item.id === schedule?.versionId);
  const selectedResource = assessment?.resources.find((item) => item.resourceId === detailResourceId);
  const selectedShift = lot ? shiftForLot(lot, scheduling?.shifts ?? [], schedule?.businessDate ?? '') : undefined;
  const closeDetail = () => {
    const resourceId = detailResourceId;
    setDetailResourceId(null);
    if (resourceId) requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-readiness-resource="${resourceId}"]`)?.focus());
  };
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && detailResourceId) closeDetail(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  });
  if (!scheduling || !assessments.length) return <p>Preparando avaliação demonstrativa…</p>;
  const aggregateCounts = assessments.reduce<Record<ReadinessStatus, number>>((result, item) => ({ ...result, [item.status]: result[item.status] + 1 }), { READY: 0, ATTENTION: 0, BLOCKED: 0, UNKNOWN: 0 });
  const sidebarContent = <ReadinessQueue filter={filter} onFilter={(value) => { setFilter(value); setSelectedLotId(null); setDetailResourceId(null); window.history.replaceState(null, '', withBase(scenarioPath('/production-readiness'))); }} />;
  if (!selectedLotId || !assessment || !lot || !material || !order || !schedule || !version) {
    const priorityLots = [...assessments].filter((item) => filter === 'ALL' || item.status === filter).sort((a, b) => ['BLOCKED', 'ATTENTION', 'UNKNOWN', 'READY'].indexOf(a.status) - ['BLOCKED', 'ATTENTION', 'UNKNOWN', 'READY'].indexOf(b.status));
    const exceptionLots = priorityLots.filter((item) => item.status !== 'READY');
    const readyLots = priorityLots.filter((item) => item.status === 'READY');
    const itemButton = (item: (typeof assessments)[number]) => { const candidate = scheduling.lots.find((entry) => entry.id === item.lotId)!; const candidateMaterial = scheduling.materials.find((entry) => entry.id === candidate.materialId)!; const reason = dominantReadinessCondition(item, candidate.scheduledResourceId); const released = productionReleases[item.lotId]?.status === 'RELEASED'; return <button key={item.lotId} onClick={() => { setSelectedLotId(item.lotId); window.history.replaceState(null, '', `?lotId=${item.lotId}`); }}><span>{statusIcons[item.status]}</span><strong>Lote {candidate.lotNumber}{released ? <em className={styles.releaseSignal}>Liberado</em> : null}</strong><span>{candidateMaterial.name} · {candidate.quantity} peças</span><span className={styles.exceptionReason}>{reason?.label ?? item.summary}<small>{reason?.evidence}</small></span><Badge tone={statusTones[item.status]}>{statusLabels[item.status]}</Badge></button>; };
    return <OperationalWorkspace perspective="READINESS" sidebarContent={sidebarContent}><div className={styles.workspace}><nav className={styles.breadcrumb} aria-label="Origem"><a href={withBase(scenarioPath('/production-scheduling'))}>Plano Hora-Hora</a><span>/</span><strong>Preparação</strong></nav><header className={styles.hero}><div><h1>Temos condições de produzir?</h1><p>Preparação do plano · cenário demonstrativo · prioriza exceções · <strong>{formatDate(scheduling.schedules[0].businessDate)}</strong></p></div><Badge tone="attention">{aggregateCounts.BLOCKED + aggregateCounts.ATTENTION + aggregateCounts.UNKNOWN} Lotes requerem análise</Badge></header><section className={styles.aggregateSummary} aria-label="Preparação do plano"><div><small>Preparação do plano</small><h2>{assessments.length} Lotes no período</h2><p>Nenhum Lote foi selecionado silenciosamente. Contagem informativa; não representa uma decisão de liberação.</p></div><dl><div><dt>Impedimento</dt><dd>{aggregateCounts.BLOCKED}</dd></div><div><dt>Atenção</dt><dd>{aggregateCounts.ATTENTION}</dd></div><div><dt>Desconhecida</dt><dd>{aggregateCounts.UNKNOWN}</dd></div><div><dt>Atendidos</dt><dd>{aggregateCounts.READY}</dd></div></dl></section><section className={styles.priorityList} aria-labelledby="priority-title"><header><h2 id="priority-title">Fila operacional de exceções</h2><p>Impedimento → atenção → informação insuficiente. A ordem visual não representa prioridade operacional.</p></header>{exceptionLots.map(itemButton)}{readyLots.length ? <details className={styles.readyGroup}><summary>Prontos ({readyLots.length})</summary>{readyLots.map(itemButton)}</details> : null}{!priorityLots.length ? <p>Nenhum Lote corresponde ao filtro.</p> : null}</section></div></OperationalWorkspace>;
  }
  const counts = assessment.resources.filter((item) => item.eligible).reduce<Record<ReadinessStatus, number>>((result, item) => ({ ...result, [item.status]: result[item.status] + 1 }), { READY: 0, ATTENTION: 0, BLOCKED: 0, UNKNOWN: 0 });
  const dominantCondition = dominantReadinessCondition(assessment, lot.scheduledResourceId);
  const resourceGroups = groupResourceReadiness(assessment.resources);
  const contextualResources = [...resourceGroups.ready, ...resourceGroups.attention];
  const programmedResource = assessment.resources.find((resource) => resource.resourceId === lot.scheduledResourceId);
  if (programmedResource && !contextualResources.some((resource) => resource.resourceId === programmedResource.resourceId)) contextualResources.push(programmedResource);
  const contextualResourceIds = contextualResources.map((resource) => resource.resourceId);
  const scheduledLots = schedule.lotIds.flatMap((lotId) => {
    const scheduledLot = scheduling.lots.find((candidate) => candidate.id === lotId);
    return scheduledLot ? [scheduledLot] : [];
  });
  const allSetups = deriveScheduledSetups(scheduledLots, 30);
  const contextualWindow = selectedShift ? shiftWindow(schedule.businessDate, selectedShift) : { start: lot.scheduledStart, finish: lot.scheduledFinish };
  const overlapsWindow = (start: string, finish: string) => Date.parse(start) < Date.parse(contextualWindow.finish) && Date.parse(contextualWindow.start) < Date.parse(finish);
  const contextualLots = scheduledLots.filter((candidate) => contextualResourceIds.includes(candidate.scheduledResourceId) && overlapsWindow(candidate.scheduledStart, candidate.scheduledFinish));
  const contextualSetups = allSetups.filter((setup) => contextualResourceIds.includes(setup.resourceId) && overlapsWindow(setup.scheduledStart, setup.scheduledFinish));
  const workCenter = scheduling.workCenters.find((candidate) => candidate.id === schedule.workCenterId)!;
  const readinessByLotId = Object.fromEntries(assessments.map((item) => [item.lotId, item.status]));
  /** Plano Atualizado (Section 23) — Preparação analyzes where a Requirement is NOW expected, from the SAME Unified Operational Timeline Plano/Acompanhamento/Aderência read. */
  const timelineByLotId = operationalTimelineByRequirementId(computeOperationalTimeline(scheduling, executionsByLot, currentTime, events));

  return <OperationalWorkspace perspective="READINESS" lotId={lot.id} sidebarContent={sidebarContent}>
    <div className={styles.workspace}>
      <nav className={styles.breadcrumb} aria-label="Origem"><button onClick={() => { setExpanded(useScenarioStore.getState().journeyContext?.sidebarExpanded ?? expanded); window.history.pushState(null, '', withBase(scenarioPath(`/production-scheduling?lotId=${lot.id}`))); window.dispatchEvent(new PopStateEvent('popstate')); }}>Plano Hora-Hora</button><span>/</span><span>Lote {lot.lotNumber}</span><span>/</span><strong>Preparação</strong></nav>
      <header className={styles.hero}><div><h1>Temos condições de produzir?</h1><p>Cenário demonstrativo · avaliação por exceção · {formatDate(schedule.businessDate)}</p></div><a href={withBase(scenarioPath(`/orders/${lot.id}`))}>Abrir Ordem →</a><Badge tone={statusTones[assessment.status]}>{statusLabels[assessment.status]}</Badge></header>
      <section className={styles.lotContext} aria-label={`Contexto do Lote ${lot.lotNumber}`}><strong>LOTE {lot.lotNumber}</strong><span>{material.name}</span><span>{lot.quantity} peças</span><span>{destinationLabels[lot.destination]}</span><span>{formatTime(lot.scheduledStart)} → {formatTime(lot.scheduledFinish)}</span><span>Máquina programada: <b>{lot.scheduledResourceId}</b> · demonstrativa</span><span>Balancing · {version.label}</span><span>PyMAC · OP {order.orderNumber}</span></section>
      <section className={styles.summary} aria-labelledby="readiness-summary"><div><small>Preparação do Lote</small><h2 id="readiness-summary">{assessment.summary}</h2><p>Este lote ainda precisa de validação antes da liberação.</p></div><dl><div><dt>Atendidos</dt><dd>{counts.READY}</dd></div><div><dt>Atenção</dt><dd>{counts.ATTENTION}</dd></div><div><dt>Impedimento</dt><dd>{counts.BLOCKED}</dd></div><div><dt>Desconhecida</dt><dd>{counts.UNKNOWN}</dd></div></dl></section>
      <section className={styles.primaryCause} aria-label="Motivo ou bloqueio principal"><small>Motivo/Bloqueio principal</small><strong>{dominantCondition?.label ?? assessment.summary}</strong><span>{dominantCondition?.evidence ?? 'Nenhuma restrição dominante conhecida.'}</span><em>Resultado demonstrativo; não representa liberação.</em></section>
      <ResourceConditionGroups resources={assessment.resources} programmedResourceId={lot.scheduledResourceId} />
      <HourByHourSchedule mode="READINESS_CONTEXT" contextLabel={`Lote ${lot.lotNumber} · ${selectedShift?.name ?? 'intervalo programado'}`} resourceIds={contextualResourceIds} lots={contextualLots} setups={contextualSetups} materials={scheduling.materials} workCenter={workCenter} shifts={scheduling.shifts} businessDate={schedule.businessDate} rangeStart={contextualWindow.start} rangeFinish={contextualWindow.finish} currentScenarioTime={scenarioDefinition ? currentTime : null} selectedLotId={lot.id} readinessByLotId={readinessByLotId} timelineByLotId={timelineByLotId} onSelectLot={(candidate) => { setSelectedLotId(candidate.id); setDetailResourceId(null); window.history.replaceState(null, '', `?lotId=${candidate.id}`); }} />
      <KnownPlanImpact resources={contextualResources} lots={contextualLots} setups={contextualSetups} materials={scheduling.materials} programmedResourceId={lot.scheduledResourceId} />
      <details className={styles.readinessDetails}><summary>Detalhes de preparação por máquina</summary><section className={styles.resources} aria-labelledby="resources-title"><header><div><h2 id="resources-title">Condições conhecidas por máquina</h2><p>Compara evidências; não seleciona, recomenda ou atribui máquina.</p></div><small>Avaliado para {formatTime(lot.scheduledStart)} → {formatTime(lot.scheduledFinish)}</small></header><div className={styles.resourceGrid}>{assessment.resources.filter((resource) => resource.eligible).map((resource) => <ResourceCard key={resource.resourceId} resource={resource} scheduled={resource.resourceId === lot.scheduledResourceId} onOpen={() => setDetailResourceId(resource.resourceId)} />)}</div>{assessment.resources.some((resource) => !resource.eligible) ? <div className={styles.nonEligibleResources}><strong>Outras máquinas</strong>{assessment.resources.filter((resource) => !resource.eligible).map((resource) => <span key={resource.resourceId}><b>{resource.resourceId}</b> — Não elegível</span>)}</div> : null}</section></details>
      <section className={styles.handoff}><button onClick={() => { setExpanded(useScenarioStore.getState().journeyContext?.sidebarExpanded ?? expanded); window.history.pushState(null, '', withBase(scenarioPath(`/production-scheduling?lotId=${lot.id}`))); window.dispatchEvent(new PopStateEvent('popstate')); }}>← Voltar ao Plano Hora-Hora</button><div><strong>{assessment.summary}</strong><small>Próxima etapa: organização nas máquinas. Nenhuma máquina será atribuída ainda.</small></div><Button disabled>Organizar nas máquinas</Button></section>
    </div>
    {selectedResource ? <aside className={styles.drawer} role="dialog" aria-modal="false" aria-labelledby="condition-detail-title"><header><div><small>Detalhe contextual</small><h2 id="condition-detail-title">{selectedResource.resourceId} · Lote {lot.lotNumber}</h2></div><Button autoFocus onClick={closeDetail}>Fechar</Button></header><p><Badge tone={selectedResource.eligible ? statusTones[selectedResource.status] : 'neutral'}>{selectedResource.eligible ? statusLabels[selectedResource.status] : 'Não elegível'}</Badge></p>{(() => { const mold = moldForResource(fundicaoDcMoldsFixture, selectedResource.resourceId); if (!mold) return null; const moldStatus = classifyMoldLife(mold.lifeUsedRatio); const compatible = mold.materialCompatibility === material?.id; return <p className={styles.moldSummary}><strong>Molde {mold.code}</strong><span>{compatible ? 'Compatível' : 'Compatibilidade não confirmada'}</span><Badge tone={moldStatusTone[moldStatus]}>{Math.round(mold.lifeUsedRatio * 100)}% vida útil{moldStatus !== 'NORMAL' ? ` · ${moldStatusLabel[moldStatus]}` : ''}</Badge></p>; })()}{selectedResource.eligible ? <ul>{selectedResource.conditions.map((item) => <ConditionRow key={item.kind} condition={item} />)}</ul> : <p>Material {material.name} não é elegível para {selectedResource.resourceId}. Nenhuma inferência de disponibilidade ou prontidão foi feita.</p>}<small>Fonte: dados demonstrativos · Avaliado às 05:58 · sem frequência automática declarada.</small></aside> : null}
  </OperationalWorkspace>;
}
