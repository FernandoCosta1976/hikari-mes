import { useEffect, useMemo, useState } from 'react';
import { useLiveScenarioTime } from '../../app/clock/applicationClock';
import { withBase } from '../../app/routing/basePath';
import { useWorkspaceSidebar } from '../../app/providers/WorkspaceSidebarContext';
import { OperationalWorkspace } from '../../app/workspace/OperationalWorkspace';
import { computeFundicaoDcQualitySummary } from '../../demo/adapters/qualitySummaryAdapter';
import { selectMaterialResourceEligibilities, selectOrganizationsByLotId, selectProductionExecutions, selectProductionReadiness, selectProductionScheduling, selectScenarioDefinition, useScenarioStore, type ScheduleView, type Wf001ScenarioId } from '../../demo/scenario-engine/scenarioStore';
import type { DemandDestination, Lot } from '../../domain/production-scheduling/models';
import { simulateResourceMove, type ResourceSimulationImpact } from '../../domain/production-scheduling/resourceSimulation';
import { FOUNDRY_RESOURCE_IDS, type FoundryResourceId } from '../../domain/resource/models';
import { shiftForLot } from '../../domain/production-scheduling/shifts';
import { assessDemonstrativeRelease } from '../../domain/production-release/models';
import { Button } from '../../shared/ui/Button/Button';
import { BufferCoverageSummary } from './components/BufferCoverageSummary';
import { BufferDecisionSupport, BUFFER_CRITICAL_LOT_ID } from './components/BufferDecisionSupport';
import { DataFreshness } from './components/DataFreshness';
import { HourByHourSchedule, type TimelineResourceConditionContext } from './components/HourByHourSchedule';
import { LotDetail, type ModalSection } from './components/LotDetail';
import { OperationalAttentionSummary } from './components/OperationalAttentionSummary';
import { ProductionOrderCorrelation } from './components/ProductionOrderCorrelation';
import { ScheduleSummary } from './components/ScheduleSummary';
import { ScheduleRevisionSummary } from './components/ScheduleRevisionSummary';
import { QuickAttentionSummary } from './components/QuickAttentionSummary';
import { SimulationWorkspace } from './components/SimulationWorkspace';
import { ReleaseDecisionSummary, type ReleaseDecisionCounts } from './components/ReleaseDecisionSummary';
import { buildProductionSchedulingViewModel, destinationLabels, eligibilityForMaterial, formatDate, scenarioLabels } from './productionSchedulingViewModel';
import styles from './ProductionSchedulingPage.module.css';

export function ProductionSchedulingPage() {
  const definition = useScenarioStore(selectProductionScheduling);
  const scenarioDefinition = useScenarioStore(selectScenarioDefinition);
  const liveScenarioTime = useLiveScenarioTime(scenarioDefinition?.currentScenarioTime);
  const materialResourceEligibilities = useScenarioStore(selectMaterialResourceEligibilities);
  const readinessAssessments = useScenarioStore(selectProductionReadiness);
  const executionsByLot = useScenarioStore(selectProductionExecutions);
  const journeyContext = useScenarioStore((state) => state.journeyContext);
  const preserveJourneyContext = useScenarioStore((state) => state.preserveJourneyContext);
  const selectedDateOffset = useScenarioStore((state) => state.selectedDateOffset);
  const selectedDestination = useScenarioStore((state) => state.selectedDestination);
  const selectedScheduleView = useScenarioStore((state) => state.selectedScheduleView);
  const activeScheduleVersionId = useScenarioStore((state) => state.activeScheduleVersionId);
  const comparisonScheduleVersionId = useScenarioStore((state) => state.comparisonScheduleVersionId);
  const activeWf001ScenarioId = useScenarioStore((state) => state.activeWf001ScenarioId);
  const resetRevision = useScenarioStore((state) => state.resetRevision);
  const productionReleases = useScenarioStore((state) => state.productionReleases);
  const productionExecutions = useScenarioStore((state) => state.productionExecutions);
  const organizationsByLotId = useScenarioStore(selectOrganizationsByLotId);
  const adoptOrganization = useScenarioStore((state) => state.adoptOrganization);
  const releaseLot = useScenarioStore((state) => state.releaseLot);
  const startLotExecution = useScenarioStore((state) => state.startLotExecution);
  const selectDateOffset = useScenarioStore((state) => state.selectDateOffset);
  const filterByDestination = useScenarioStore((state) => state.filterByDestination);
  const selectScheduleView = useScenarioStore((state) => state.selectScheduleView);
  const compareWithPreviousVersion = useScenarioStore((state) => state.compareWithPreviousVersion);
  const closeVersionComparison = useScenarioStore((state) => state.closeVersionComparison);
  const activateScenario = useScenarioStore((state) => state.activateWf001Scenario);
  const resetScenario = useScenarioStore((state) => state.resetScenario);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [lotModalOpen, setLotModalOpen] = useState(false);
  const [lotDetailSection, setLotDetailSection] = useState<ModalSection>('OVERVIEW');
  const initialLotSection: ModalSection = new URLSearchParams(window.location.search).get('lotId') === 'lot-251' ? 'RELEASE' : 'OVERVIEW';
  const [resourceConditionMode, setResourceConditionMode] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationImpact, setSimulationImpact] = useState<ResourceSimulationImpact | null>(null);
  const [simulationComparing, setSimulationComparing] = useState(false);
  const [openSidebarGroups, setOpenSidebarGroups] = useState({ period: true, view: true, filters: true });
  const { expanded: sidebarExpanded, setExpanded: setSidebarExpanded, toggleButtonRef } = useWorkspaceSidebar();

  useEffect(() => { setSelectedLot(null); setLotModalOpen(false); }, [resetRevision]);
  useEffect(() => {
    const requestedLotId = new URLSearchParams(window.location.search).get('lotId');
    if (definition && requestedLotId) { setSelectedLot(definition.lots.find((lot) => lot.id === requestedLotId) ?? null); setLotModalOpen(!journeyContext); }
  }, [definition, journeyContext]);
  useEffect(() => {
    if (activeWf001ScenarioId === 'SCN-WF001-08' && definition) { setSelectedLot(definition.lots.find((lot) => lot.id === 'lot-252') ?? null); setLotModalOpen(true); }
  }, [activeWf001ScenarioId, definition]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !sidebarExpanded) return;
      setSidebarExpanded(false);
      requestAnimationFrame(() => toggleButtonRef.current?.focus());
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [sidebarExpanded, setSidebarExpanded, toggleButtonRef]);
  useEffect(() => {
    if (!selectedLot || !journeyContext || journeyContext.selectedLotId !== selectedLot.id) return;
    const frame = requestAnimationFrame(() => { window.scrollTo(0, journeyContext.pageScrollY); document.querySelector<HTMLButtonElement>(`[data-lot-id="${selectedLot.id}"]`)?.focus(); });
    return () => cancelAnimationFrame(frame);
  }, [journeyContext, selectedLot]);

  const view = useMemo(() => definition ? buildProductionSchedulingViewModel(definition, selectedDateOffset, selectedDestination, activeWf001ScenarioId, selectedScheduleView) : null, [definition, selectedDateOffset, selectedDestination, activeWf001ScenarioId, selectedScheduleView]);
  if (!definition || !view) return <p>Preparando cenário demonstrativo…</p>;
  const workCenter = definition.workCenters.find((item) => item.id === view.schedule.workCenterId)!;
  const version = definition.scheduleVersions.find((item) => item.id === activeScheduleVersionId)!;
  const previousVersion = definition.scheduleVersions.find((item) => item.id === 'v07')!;
  const previousSchedule = definition.schedules.find((item) => item.id === 'schedule-2025-05-15-v07')!;
  const previousLots = previousSchedule.lotIds.map((id) => definition.lots.find((lot) => lot.id === id)!).filter(Boolean);
  const selectedMaterial = selectedLot ? definition.materials.find((item) => item.id === selectedLot.materialId)! : null;
  const selectedEligibility = selectedMaterial ? eligibilityForMaterial(materialResourceEligibilities, selectedMaterial.id) : undefined;
  const selectedOrder = selectedLot ? definition.productionOrders.find((item) => item.id === selectedLot.productionOrderId)! : null;
  const selectedShift = selectedLot ? shiftForLot(selectedLot, definition.shifts, view.schedule.businessDate) : null;
  const stale = view.freshness.some((item) => item.state === 'STALE');
  const closeLotDetail = () => {
    const lotId = selectedLot?.id;
    setLotModalOpen(false);
    if (lotId) requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-lot-id="${lotId}"]`)?.focus());
  };
  const readinessByLotId = Object.fromEntries(readinessAssessments.map((item) => [item.lotId, item.status]));
  const releaseByLotId = Object.fromEntries(Object.values(productionReleases).map((item) => [item.lotId, item.status]));
  const readinessCounts = readinessAssessments.reduce((counts, item) => ({ ...counts, [item.status]: counts[item.status] + 1 }), { READY: 0, ATTENTION: 0, BLOCKED: 0, UNKNOWN: 0 });
  const compromissoAttentionCount = readinessCounts.ATTENTION + readinessCounts.BLOCKED + readinessCounts.UNKNOWN;
  const compromissoProduced = selectedDateOffset === 0 ? computeFundicaoDcQualitySummary(definition, executionsByLot, liveScenarioTime).produced : null;
  const releaseCounts: ReleaseDecisionCounts = readinessAssessments.reduce((counts, item) => { const status = productionReleases[item.lotId]?.status; if (status === 'RELEASED') counts.released += 1; else if (item.status === 'READY') counts.ready += 1; else if (item.status === 'BLOCKED') counts.blocked += 1; else counts.attention += 1; return counts; }, { ready: 0, attention: 0, blocked: 0, released: 0 });
  const selectedReadiness = selectedLot ? readinessAssessments.find((item) => item.lotId === selectedLot.id) : undefined;
  const conditionContexts: readonly TimelineResourceConditionContext[] = selectedReadiness && selectedLot ? FOUNDRY_RESOURCE_IDS.map((resourceId) => {
    const resource = selectedReadiness.resources.find((item) => item.resourceId === resourceId)!;
    const condition = (kind: 'AVAILABILITY' | 'TOOLING' | 'SETUP') => resource.conditions.find((item) => item.kind === kind)?.evidence ?? (resource.eligible ? 'Sem evidência específica' : 'Análise encerrada por não elegibilidade');
    const resourceLots = view.scheduledLots.filter((item) => item.scheduledResourceId === resourceId).sort((left, right) => Date.parse(left.scheduledStart) - Date.parse(right.scheduledStart));
    const materialNames = resourceLots.map((item) => definition.materials.find((material) => material.id === item.materialId)?.name).filter(Boolean);
    const changes = materialNames.slice(1).filter((name, index) => name !== materialNames[index]).length;
    const setupMinutes = view.scheduledSetups.filter((setup) => setup.resourceId === resourceId).reduce((total, setup) => total + setup.durationMinutes, 0);
    const mainRestriction = resource.conditions.find((item) => item.status === resource.status)?.label ?? resource.conditions.find((item) => item.status !== 'READY')?.label ?? 'Sem blocker conhecido';
    return { resourceId, status: resource.status, eligible: resource.eligible, programmed: selectedLot.scheduledResourceId === resourceId, groupLabel: !resource.eligible || resource.status === 'BLOCKED' ? 'Sem condição' : resource.status === 'READY' ? 'Com condição' : 'Requer atenção', eligibility: resource.eligible ? 'Elegível' : 'Não elegível', availability: condition('AVAILABILITY'), tooling: condition('TOOLING'), setup: condition('SETUP'), mainRestriction, materialContext: changes ? `Mudanças de Material presentes no plano: ${changes}` : materialNames.includes(selectedMaterial?.name ?? '') ? 'Material selecionado já aparece na sequência' : 'Sem mudança de Material derivável no período', setupImpact: `Setup existente conhecido: ${setupMinutes} min` };
  }) : [];
  const runSimulation = (lotId: string, resourceId: FoundryResourceId) => {
    const assessment = readinessAssessments.find((item) => item.lotId === lotId);
    const target = assessment?.resources.find((item) => item.resourceId === resourceId);
    if (!target?.eligible || target.status === 'BLOCKED') return;
    setSelectedLot(definition.lots.find((lot) => lot.id === lotId) ?? null);
    setSimulationImpact(simulateResourceMove(view.allScheduledLots, lotId, resourceId, 30, [BUFFER_CRITICAL_LOT_ID]));
    setSimulationComparing(false);
  };
  const openReadiness = (origin: 'LOT_CONTEXT' | 'EXCEPTION_SUMMARY', lotId: string | null) => {
    preserveJourneyContext({ origin, selectedLotId: lotId, timelineScrollLeft: document.querySelector<HTMLElement>('[data-testid="timeline-scroller"]')?.scrollLeft ?? 0, pageScrollY: window.scrollY, sidebarExpanded });
    const target = withBase(`/demo/fundicao-dc/production-readiness${lotId ? `?lotId=${lotId}` : ''}`);
    window.history.pushState(null, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <OperationalWorkspace perspective="PLAN" lotId={selectedLot?.id ?? null} sidebarContent={<div className={styles.sidebarControls}>
        <details open={openSidebarGroups.period} onToggle={(event) => { const open = event.currentTarget.open; setOpenSidebarGroups((groups) => ({ ...groups, period: open })); }}><summary title="Período"><span aria-hidden="true">◷</span><strong>Período</strong></summary><div className={styles.treeItems}>{(['Hoje', 'D+1', 'D+2', 'D+3'] as const).map((label, index) => <Button key={label} aria-current={selectedDateOffset === index ? 'date' : undefined} onClick={() => selectDateOffset(index as 0 | 1 | 2 | 3)}>{label}</Button>)}</div></details>
        <details open={openSidebarGroups.view} onToggle={(event) => { const open = event.currentTarget.open; setOpenSidebarGroups((groups) => ({ ...groups, view: open })); }}><summary title="Visão"><span aria-hidden="true">▤</span><strong>Visão</strong></summary><div className={styles.treeItems}>{([['24H', '24h'], ['SHIFT_3', 'Turno 3'], ['SHIFT_1', 'Turno 1'], ['SHIFT_2', 'Turno 2']] as const).map(([value, label]) => <Button key={value} aria-current={selectedScheduleView === value ? 'true' : undefined} onClick={() => selectScheduleView(value as ScheduleView)}>{label}</Button>)}</div></details>
        <details open={openSidebarGroups.filters} onToggle={(event) => { const open = event.currentTarget.open; setOpenSidebarGroups((groups) => ({ ...groups, filters: open })); }}><summary title="Filtros"><span aria-hidden="true">⌁</span><strong>Filtros{selectedDestination !== 'ALL' || activeWf001ScenarioId !== 'SCN-WF001-01' ? ' · 1' : ''}</strong></summary><div className={styles.treeFields}><label>Destino<select aria-label="Destino" value={selectedDestination} onChange={(event) => filterByDestination(event.target.value as DemandDestination | 'ALL')}><option value="ALL">Todos os destinos</option>{(Object.entries(destinationLabels) as [DemandDestination, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Variação<select aria-label="Variação demonstrativa" value={activeWf001ScenarioId} onChange={(event) => activateScenario(event.target.value as Wf001ScenarioId)}>{(Object.entries(scenarioLabels) as [Wf001ScenarioId, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div></details>
        <details><summary title="Plano"><span aria-hidden="true">⇄</span><strong>Plano</strong></summary><div className={styles.treeItems}><Button onClick={compareWithPreviousVersion}>Comparar anterior</Button><Button onClick={() => { const revision = document.getElementById('schedule-revision'); if (revision instanceof HTMLDetailsElement) revision.open = true; }}>Ver alterações</Button></div></details>
        <details><summary title="Cenário"><span aria-hidden="true">↺</span><strong>Cenário</strong></summary><div className={styles.treeItems}><Button onClick={() => { resetScenario(); setSelectedLot(null); }}>Reiniciar cenário</Button></div></details>
      </div>}>
      <div className={styles.page}>
      <header className={styles.hero}>
        <h1>{lotModalOpen && lotDetailSection === 'RELEASE' ? 'Podemos liberar para produção?' : 'O que precisamos produzir?'}</h1>
        <DataFreshness key={resetRevision} items={view.freshness} />
      </header>

      {stale ? <div className={styles.staleBanner} role="status"><strong>Plano de hoje ainda não recebido.</strong> A última programação disponível é de 14/05/2025 às 18:30 e está identificada como defasada.</div> : null}
      {view.hasDivergence ? <div className={styles.attentionBanner} role="status"><strong>Divergência informada.</strong> A quantidade da Ordem de Produção não corresponde à soma dos Lotes correlacionados.</div> : null}
      {activeWf001ScenarioId === 'SCN-WF001-02' ? <div className={styles.staleBanner} role="status"><strong>Reservas preservadas.</strong> Quantidades de Reposição e Engenharia permanecem reservadas e não são tratadas como disponibilidade livre para Montagem.</div> : null}
      {activeWf001ScenarioId === 'SCN-WF001-03' ? <div className={styles.staleBanner} role="status"><strong>Cobertura recuperada pelo plano.</strong> O Material A parte de 2,4 dias e alcança 3,1 dias de cobertura projetada no cenário demonstrativo.</div> : null}
      {activeWf001ScenarioId === 'SCN-WF001-04' ? <div className={styles.attentionBanner} role="status"><strong>Atenção de matéria-prima.</strong> O Lote 267 requer avaliação na próxima etapa; nenhuma decisão de liberação foi tomada.</div> : null}

      <ScheduleSummary quantity={view.totalQuantity} lotCount={view.scheduledLots.length} destinations={view.destinationQuantities} versionLabel={version.label} periodLabel={view.periodLabel} rangeStart={view.rangeStart} rangeFinish={view.rangeFinish} produced={compromissoProduced} attentionCount={compromissoAttentionCount} revision={<ScheduleRevisionSummary activeVersion={version} previousVersion={previousVersion} receivedAt={view.schedule.receivedAt} activeLots={view.allScheduledLots} previousLots={previousLots} />} />

      <BufferDecisionSupport position={definition.bufferPositions.find((position) => position.materialId === 'material-a')!} material={definition.materials.find((material) => material.id === 'material-a')!} criticalLot={definition.lots.find((lot) => lot.id === BUFFER_CRITICAL_LOT_ID)} simulationActive={simulationActive} hasConflict={simulationImpact?.bufferImpact === 'RISK'} />

      <QuickAttentionSummary materialAttentionCount={view.scheduledLots.filter((lot) => lot.materialAttention).length} belowCurrentTargetCount={definition.bufferPositions.filter((position) => position.currentCoverageDays < position.targetCoverageDays).length} hasDivergence={view.hasDivergence} readinessCounts={{ ready: readinessCounts.READY, attention: readinessCounts.ATTENTION, blocked: readinessCounts.BLOCKED, unknown: readinessCounts.UNKNOWN }} onOpenReadiness={() => openReadiness('EXCEPTION_SUMMARY', null)} />
      <ReleaseDecisionSummary counts={releaseCounts} onOpen={(group) => { const candidate = readinessAssessments.find((assessment) => group === 'released' ? productionReleases[assessment.lotId]?.status === 'RELEASED' : group === 'ready' ? assessment.status === 'READY' && productionReleases[assessment.lotId]?.status !== 'RELEASED' : group === 'blocked' ? assessment.status === 'BLOCKED' : assessment.status === 'ATTENTION' || assessment.status === 'UNKNOWN'); const lot = candidate ? definition.lots.find((item) => item.id === candidate.lotId) ?? null : null; setSelectedLot(lot); setLotModalOpen(Boolean(lot)); }} />


      {comparisonScheduleVersionId ? <section className={styles.comparison} aria-labelledby="comparison-title"><div><span className={styles.step}>2</span><h2 id="comparison-title">Comparação de versões demonstrativas</h2></div><p><strong>Versão 08 × Versão 07:</strong> Lotes 251 e 252 movidos na sequência; Lote 271 incluído. O baseline anterior permanece preservado.</p><Button onClick={closeVersionComparison}>Fechar comparação</Button></section> : null}

      <div className={styles.timelineLayout} data-detail-open={lotModalOpen ? 'true' : 'false'}>
        <div className={styles.timelineModeControls}><SimulationWorkspace active={simulationActive} selectedLot={selectedLot} readiness={selectedReadiness} impact={simulationImpact} comparing={simulationComparing} alreadyReleased={selectedLot ? productionReleases[selectedLot.id]?.status === 'RELEASED' : false} locked={selectedLot ? (productionExecutions[selectedLot.id]?.status ?? 'NOT_STARTED') !== 'NOT_STARTED' : false} onActivate={() => { setSimulationActive(true); setResourceConditionMode(true); setLotModalOpen(false); }} onSimulate={(resourceId) => selectedLot && runSimulation(selectedLot.id, resourceId)} onUndo={() => { setSimulationImpact(null); setSimulationComparing(false); }} onDiscard={() => { setSimulationActive(false); setSimulationImpact(null); setSimulationComparing(false); setResourceConditionMode(false); }} onCompare={() => setSimulationComparing((value) => !value)} onAdopt={() => { if (simulationImpact) adoptOrganization(simulationImpact, 'Planejador da Fundição · demonstrativo'); setSimulationActive(false); setSimulationImpact(null); setSimulationComparing(false); setResourceConditionMode(false); }} /></div>
        <HourByHourSchedule contextLabel={`${formatDate(view.schedule.businessDate)} · ${view.periodLabel}`} lots={view.lots} setups={view.scheduledSetups} materials={definition.materials} workCenter={workCenter} shifts={definition.shifts} businessDate={view.schedule.businessDate} rangeStart={view.rangeStart} rangeFinish={view.rangeFinish} currentScenarioTime={scenarioDefinition ? liveScenarioTime : null} selectedLotId={selectedLot?.id ?? null} readinessByLotId={readinessByLotId} releaseByLotId={releaseByLotId} organizationsByLotId={organizationsByLotId} initialScrollLeft={journeyContext?.selectedLotId === selectedLot?.id ? journeyContext?.timelineScrollLeft : undefined} sceneMode={simulationActive ? 'SIMULATION' : resourceConditionMode ? 'RESOURCE_CONDITIONS' : 'STANDARD'} resourceConditionContexts={resourceConditionMode || simulationActive ? conditionContexts : []} simulationImpact={simulationImpact} onSimulateDrop={runSimulation} bufferCriticalLotIds={[BUFFER_CRITICAL_LOT_ID]} onToggleResourceConditions={() => { setResourceConditionMode((active) => !active); setLotModalOpen(false); }} onSelectLot={(lot) => { const baselineLot = definition.lots.find((candidate) => candidate.id === lot.id) ?? lot; setSelectedLot(baselineLot); setLotModalOpen(!resourceConditionMode && !simulationActive); }} />
        {lotModalOpen && selectedLot && selectedMaterial && selectedOrder && selectedEligibility && selectedShift ? <LotDetail lot={selectedLot} material={selectedMaterial} eligibility={selectedEligibility} readiness={selectedReadiness} release={productionReleases[selectedLot.id] ?? (selectedReadiness ? assessDemonstrativeRelease({ lotId: selectedLot.id, productionOrderId: selectedLot.productionOrderId, resourceId: organizationsByLotId[selectedLot.id]?.operationalResourceId ?? selectedLot.scheduledResourceId, scheduleVersionId: activeScheduleVersionId, scheduledStart: selectedLot.scheduledStart, scheduledFinish: selectedLot.scheduledFinish, readiness: selectedReadiness.status }) : undefined)} execution={productionExecutions[selectedLot.id]} currentTime={liveScenarioTime} order={selectedOrder} workCenter={workCenter} shiftName={selectedShift.name} scheduleVersion={version.label} receivedAt={view.schedule.receivedAt} bufferPosition={definition.bufferPositions.find((position) => position.materialId === selectedLot.materialId)} simulatedResourceId={simulationImpact?.lotId === selectedLot.id ? simulationImpact.simulatedResourceId : undefined} operationalResourceId={organizationsByLotId[selectedLot.id]?.operationalResourceId} initialSection={selectedLot.id === 'lot-251' ? initialLotSection : 'OVERVIEW'} onSectionChange={setLotDetailSection} onClose={closeLotDetail} onAnalyzeReadiness={() => openReadiness('LOT_CONTEXT', selectedLot.id)} onRelease={() => releaseLot(selectedLot.id)} onStartExecution={() => startLotExecution(selectedLot.id)} /> : null}
      </div>

      <ProductionOrderCorrelation items={view.orders} lots={view.allScheduledLots} materials={definition.materials} />
      <div className={styles.lowerGrid}><BufferCoverageSummary positions={definition.bufferPositions} materials={definition.materials} /><OperationalAttentionSummary lots={view.scheduledLots} materials={definition.materials} /></div>
      <section className={styles.nextStep}><div><span className={styles.step}>7</span><h2>Próxima decisão</h2><p>A liberação é a decisão operacional desta experiência. Após liberar, a próxima capability tratará como a execução será iniciada e controlada.</p></div><Button onClick={() => { setSelectedLot(view.scheduledLots[0] ?? null); setLotModalOpen(true); }}>Selecionar Lote para decisão de liberação</Button></section>
      </div>
    </OperationalWorkspace>
  );
}
