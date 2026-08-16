import { useEffect, useRef } from 'react';
import type { Lot, Material, ScheduledSetup, Shift, WorkCenter } from '../../../domain/production-scheduling/models';
import { FOUNDRY_RESOURCE_IDS } from '../../../domain/resource/models';
import type { FoundryResourceId } from '../../../domain/resource/models';
import type { LotOrganization } from '../../../domain/production-scheduling/organization';
import { minutesBetween, scrollLeftForCurrentTime, timelinePosition, timelineWidth } from '../../../domain/production-scheduling/temporalMath';
import { breakWindow, shiftWindow } from '../../../domain/production-scheduling/shifts';
import { destinationLabels, formatTime } from '../productionSchedulingViewModel';
import styles from '../ProductionSchedulingPage.module.css';
import type { ReadinessStatus } from '../../../domain/production-readiness/models';
import type { ResourceSimulationImpact } from '../../../domain/production-scheduling/resourceSimulation';
import type { ProductionReleaseStatus } from '../../../domain/production-release/models';

export type TimelineSceneMode = 'STANDARD' | 'RESOURCE_CONDITIONS' | 'SIMULATION';

export interface TimelineResourceConditionContext {
  resourceId: FoundryResourceId;
  status: ReadinessStatus;
  eligible: boolean;
  programmed: boolean;
  groupLabel: 'Com condição' | 'Requer atenção' | 'Sem condição';
  eligibility: string;
  availability: string;
  tooling: string;
  setup: string;
  mainRestriction: string;
  materialContext: string;
  setupImpact: string;
}

export function HourByHourSchedule({ contextLabel, lots, setups = [], materials, workCenter, shifts, businessDate, rangeStart, rangeFinish, currentScenarioTime, selectedLotId, readinessByLotId = {}, releaseByLotId = {}, organizationsByLotId = {}, initialScrollLeft, onSelectLot, resourceIds = FOUNDRY_RESOURCE_IDS, mode = 'PLAN', sceneMode = 'STANDARD', resourceConditionContexts = [], onToggleResourceConditions, simulationImpact = null, onSimulateDrop, bufferCriticalLotIds = [] }: { contextLabel?: string; lots: readonly Lot[]; setups?: readonly ScheduledSetup[]; materials: readonly Material[]; workCenter: WorkCenter; shifts: readonly Shift[]; businessDate: string; rangeStart: string; rangeFinish: string; currentScenarioTime: string | null; selectedLotId: string | null; readinessByLotId?: Readonly<Record<string, ReadinessStatus>>; releaseByLotId?: Readonly<Record<string, ProductionReleaseStatus>>; organizationsByLotId?: Readonly<Record<string, LotOrganization>>; initialScrollLeft?: number; onSelectLot: (lot: Lot) => void; resourceIds?: readonly FoundryResourceId[]; mode?: 'PLAN' | 'READINESS_CONTEXT'; sceneMode?: TimelineSceneMode; resourceConditionContexts?: readonly TimelineResourceConditionContext[]; onToggleResourceConditions?: () => void; simulationImpact?: ResourceSimulationImpact | null; onSimulateDrop?: (lotId: string, resourceId: FoundryResourceId) => void; bufferCriticalLotIds?: readonly string[] }) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const scroller = useRef<HTMLDivElement | null>(null);
  const draggedLotId = useRef<string | null>(null);
  const durationHours = minutesBetween(rangeStart, rangeFinish) / 60;
  const evaluationLot = selectedLotId ? lots.find((lot) => lot.id === selectedLotId) : undefined;
  const evaluationMaterial = evaluationLot ? materials.find((material) => material.id === evaluationLot.materialId) : undefined;
  const firstHour = Math.ceil(Date.parse(rangeStart) / 3_600_000) * 3_600_000;
  const hourTimestamps = [Date.parse(rangeStart)];
  for (let value = firstHour; value < Date.parse(rangeFinish); value += 3_600_000) if (value > Date.parse(rangeStart)) hourTimestamps.push(value);
  hourTimestamps.push(Date.parse(rangeFinish));
  const visibleShifts = shifts.map((shift) => ({ shift, window: shiftWindow(businessDate, shift) })).filter(({ window }) => Date.parse(window.start) < Date.parse(rangeFinish) && Date.parse(rangeStart) < Date.parse(window.finish));
  const visibleBreaks = shifts.flatMap((shift) => shift.breaks.map((plannedBreak) => ({ shift, plannedBreak, window: breakWindow(businessDate, plannedBreak) }))).filter(({ window }) => Date.parse(window.start) < Date.parse(rangeFinish) && Date.parse(rangeStart) < Date.parse(window.finish));
  const currentTimeVisible = currentScenarioTime !== null && Date.parse(currentScenarioTime) >= Date.parse(rangeStart) && Date.parse(currentScenarioTime) <= Date.parse(rangeFinish);
  const currentTimePosition = currentTimeVisible ? timelinePosition(currentScenarioTime, rangeStart, rangeFinish) : null;
  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const frame = requestAnimationFrame(() => {
      if (initialScrollLeft !== undefined) { element.scrollLeft = initialScrollLeft; return; }
      if (currentTimePosition === null) return;
      element.scrollLeft = scrollLeftForCurrentTime(element, currentTimePosition, 132);
    });
    return () => cancelAnimationFrame(frame);
  }, [currentTimePosition, initialScrollLeft, rangeStart, rangeFinish]);
  const moveFocus = (index: number, direction: number) => {
    const target = (index + direction + lots.length) % lots.length;
    buttons.current[target]?.focus();
  };

  return (
    <section className={styles.timelineSection} data-timeline-mode={mode} data-scene-mode={sceneMode} aria-labelledby={mode === 'PLAN' ? 'timeline-title' : 'readiness-timeline-title'}>
      <div className={styles.sectionHeading}>
        <div>{mode === 'PLAN' ? <span className={styles.step}>3</span> : null}<h2 id={mode === 'PLAN' ? 'timeline-title' : 'readiness-timeline-title'}>{mode === 'PLAN' ? 'Plano Hora-Hora por máquina' : 'Contexto Hora-Hora das máquinas'}</h2><p>{contextLabel ? <><strong>{contextLabel}</strong> · </> : null}Requisito recebido — Balancing</p></div>
        <div className={styles.timelineActions}>{mode === 'PLAN' && sceneMode !== 'SIMULATION' && onToggleResourceConditions ? <button type="button" data-testid="evaluation-mode-toggle" className={styles.conditionModeToggle} aria-label={sceneMode === 'RESOURCE_CONDITIONS' ? 'Encerrar avaliação' : 'Avaliar cenários'} aria-pressed={sceneMode === 'RESOURCE_CONDITIONS'} onClick={onToggleResourceConditions}><span aria-hidden="true">◇</span>{sceneMode === 'RESOURCE_CONDITIONS' ? 'Encerrar avaliação' : 'Avaliar cenários'}</button> : null}<span className={styles.timelineHint}>Use ← → para navegar entre Lotes</span></div>
      </div>
      {sceneMode === 'RESOURCE_CONDITIONS' ? <div className={styles.conditionModeNotice} role="status"><div><strong>{evaluationLot ? `AVALIAÇÃO DE ALTERNATIVAS — LOTE ${evaluationLot.lotNumber}` : 'AVALIAÇÃO DE ALTERNATIVAS'}</strong>{evaluationLot ? <small>{evaluationMaterial?.name} · {evaluationLot.quantity} peças · Programado em {evaluationLot.scheduledResourceId}</small> : null}</div><span>{evaluationLot ? 'Condições e impactos conhecidos aplicados sem alterar a ordem DC01–DC05.' : 'Selecione um Lote para avaliar quais máquinas podem recebê-lo e os impactos conhecidos.'}</span></div> : null}
      <div ref={scroller} className={styles.timelineScroller} data-testid={mode === 'PLAN' ? 'timeline-scroller' : 'readiness-timeline-scroller'} tabIndex={0} aria-label={mode === 'PLAN' ? 'Plano Hora-Hora contínuo por máquina programada' : 'Contexto Hora-Hora das máquinas relevantes'}>
        <div className={styles.timeline} style={{ minWidth: `${Math.max(62, durationHours * 9.5)}rem` }}>
          <div className={styles.timelineCorner} aria-hidden="true"><strong>Máquina</strong><span>{workCenter.areaLabel}</span></div>
          <div className={styles.shiftAxis} aria-hidden="true">{visibleShifts.map(({ shift, window }) => <span key={shift.id} style={{ left: `${timelinePosition(window.start, rangeStart, rangeFinish)}%`, width: `${timelineWidth(window.start, window.finish, rangeStart, rangeFinish)}%` }}>{shift.name}</span>)}</div>
          <div className={styles.hourAxis} aria-hidden="true">{hourTimestamps.map((timestamp) => <span key={timestamp} style={{ left: `${timelinePosition(new Date(timestamp).toISOString(), rangeStart, rangeFinish)}%` }}>{formatTime(new Date(timestamp).toISOString())}</span>)}</div>
          <div className={styles.scheduleOverlay} aria-hidden="true">
            {visibleShifts.slice(1).map(({ shift, window }) => <div className={styles.shiftBoundary} key={shift.id} style={{ left: `${timelinePosition(window.start, rangeStart, rangeFinish)}%` }} />)}
            {visibleBreaks.map(({ plannedBreak, window }) => <div className={styles.plannedBreak} data-testid="planned-break" key={plannedBreak.id} style={{ left: `${timelinePosition(window.start, rangeStart, rangeFinish)}%`, width: `${timelineWidth(window.start, window.finish, rangeStart, rangeFinish)}%` }}><span>{plannedBreak.name === 'Refeição' ? 'Refeição' : 'Café'}</span></div>)}
          </div>
          <span className={styles.srOnly}>Três turnos demonstrativos e nove paradas programadas. Parada programada não significa downtime, falha ou manutenção.</span>
          {currentTimeVisible && currentTimePosition !== null ? <>
            <span className={styles.srOnly}>Horário de referência do cenário: {formatTime(currentScenarioTime)}</span>
            <div className={styles.currentTimeOverlay} aria-hidden="true"><div className={styles.currentTimeMarker} data-testid="current-time-marker" style={{ left: `${currentTimePosition}%` }}><span>{formatTime(currentScenarioTime)}</span></div></div>
          </> : null}
          <div className={styles.resourceLanes}>
            {resourceIds.map((resourceId) => {
              const renderedLots = lots.map((lot) => { const operationalResourceId = simulationImpact?.lotId === lot.id ? simulationImpact.simulatedResourceId : organizationsByLotId[lot.id]?.operationalResourceId; return operationalResourceId ? { ...lot, scheduledResourceId: operationalResourceId } : lot; });
              const resourceLots = renderedLots.filter((lot) => lot.scheduledResourceId === resourceId);
              const resourceSetups = setups.filter((setup) => setup.resourceId === resourceId);
              const conditionContext = resourceConditionContexts.find((context) => context.resourceId === resourceId);
              const dropAllowed = sceneMode === 'SIMULATION' && Boolean(conditionContext?.eligible) && conditionContext?.status !== 'BLOCKED';
              return (
                <section className={styles.resourceLane} data-resource-condition={conditionContext?.status} data-resource-eligible={conditionContext?.eligible} data-drop-allowed={dropAllowed} aria-label={`Máquina programada ${resourceId}`} key={resourceId} onDragOver={(event) => { if (dropAllowed) event.preventDefault(); }} onDrop={(event) => { if (!dropAllowed || !onSimulateDrop) return; event.preventDefault(); const lotId = event.dataTransfer.getData('text/plain') || draggedLotId.current; if (lotId) onSimulateDrop(lotId, resourceId); draggedLotId.current = null; }}>
                  <header className={styles.resourceLaneLabel} tabIndex={conditionContext ? 0 : undefined}><strong>{resourceId}{conditionContext?.programmed ? <span>Programada</span> : null}</strong><small>{conditionContext ? `${conditionContext.programmed ? 'Programada' : conditionContext.eligible ? 'Pode receber' : ''}${conditionContext.programmed || conditionContext.eligible ? ' · ' : ''}${conditionContext.groupLabel}` : 'Máquina programada'}</small>{conditionContext ? <div className={styles.resourceConditionPreview} role="tooltip"><b>{conditionContext.groupLabel}</b><span>Elegibilidade: {conditionContext.eligibility}</span><span>Disponibilidade: {conditionContext.availability}</span><span>Ferramental: {conditionContext.tooling}</span><span>Setup: {conditionContext.setup}</span><span>Restrição principal: {conditionContext.mainRestriction}</span></div> : null}</header>
                  <div className={styles.resourceLaneTrack} aria-label={`Lotes programados na ${resourceId}`}>
                    {resourceSetups.map((setup) => {
                      const previousMaterial = materials.find((item) => item.id === setup.previousMaterialId)!;
                      const nextMaterial = materials.find((item) => item.id === setup.nextMaterialId)!;
                      return <div key={setup.id} className={styles.setupBlock} data-testid="scheduled-setup" role="img" aria-label={`Setup na ${resourceId}, ${previousMaterial.name} para ${nextMaterial.name}, ${formatTime(setup.scheduledStart)} a ${formatTime(setup.scheduledFinish)}, duração demonstrativa de ${setup.durationMinutes} minutos`} title={`Setup · ${previousMaterial.name} → ${nextMaterial.name} · ${setup.durationMinutes} min`} style={{ left: `${timelinePosition(setup.scheduledStart, rangeStart, rangeFinish)}%`, width: `${timelineWidth(setup.scheduledStart, setup.scheduledFinish, rangeStart, rangeFinish)}%` }}><strong>Setup</strong><span>{previousMaterial.name.replace('Material ', '')} → {nextMaterial.name.replace('Material ', '')}</span></div>;
                    })}
                    {resourceLots.map((lot) => {
                      const index = lots.indexOf(lot);
                      const material = materials.find((item) => item.id === lot.materialId)!;
                      const readiness = readinessByLotId[lot.id];
                      const released = releaseByLotId[lot.id] === 'RELEASED';
                      const readinessLabel = readiness === 'READY' ? 'condições atendidas' : readiness === 'ATTENTION' ? 'atenção na preparação' : readiness === 'BLOCKED' ? 'condição impeditiva' : 'informação insuficiente';
                      const label = `Lote ${lot.lotNumber}, ${material.name}, ${lot.quantity} peças, máquina programada ${lot.scheduledResourceId}, início previsto ${formatTime(lot.scheduledStart)}, término previsto ${formatTime(lot.scheduledFinish)}, destino ${destinationLabels[lot.destination]}, preparação: ${readinessLabel}`;
                      const simulated = simulationImpact?.lotId === lot.id;
                      const organization = organizationsByLotId[lot.id];
                      const organized = !simulated && Boolean(organization);
                      return <button key={lot.id} ref={(node) => { buttons.current[index] = node; }} type="button" draggable={sceneMode === 'SIMULATION' ? true : undefined} className={styles.lotBlock} data-destination={lot.destination} data-lot-id={lot.id} data-simulated={simulated} data-organized={organized} aria-pressed={selectedLotId === lot.id} style={{ left: `${timelinePosition(lot.scheduledStart, rangeStart, rangeFinish)}%`, width: `${timelineWidth(lot.scheduledStart, lot.scheduledFinish, rangeStart, rangeFinish)}%` }} aria-label={`${label}${released ? ', liberado para produção' : ''}${simulated ? ', simulação' : ''}${organized ? `, organizado para ${organization!.operationalResourceId} (programado ${organization!.programmedResourceId})` : ''}`} onDragStart={(event) => { draggedLotId.current = lot.id; event.dataTransfer.setData('text/plain', lot.id); }} onDragEnd={() => { draggedLotId.current = null; }} onClick={() => onSelectLot(lot)} onKeyDown={(event) => { if (event.key === 'ArrowRight') { event.preventDefault(); moveFocus(index, 1); } if (event.key === 'ArrowLeft') { event.preventDefault(); moveFocus(index, -1); } }}>
                        <strong>Lote {lot.lotNumber}{released ? <em className={styles.releaseSignal}>Liberado</em> : null}{simulated ? <em>Simulação</em> : null}{organized ? <em title={`Programado: ${organization!.programmedResourceId}`}>Organizado</em> : null}{bufferCriticalLotIds.includes(lot.id) ? <em>Buffer-critical</em> : null}</strong><span>{material.name} · {lot.quantity} peças</span><small className={styles.destinationTag}>{destinationLabels[lot.destination]}</small>{readiness ? <small className={styles.readinessSignal} data-status={readiness} title={`Preparação: ${readinessLabel}`} aria-hidden="true">{readiness === 'READY' ? '✓' : readiness === 'ATTENTION' ? '!' : readiness === 'BLOCKED' ? '×' : '?'}</small> : null}
                      </button>;
                    })}
                    {simulationImpact?.lotId && simulationImpact.originalResourceId === resourceId ? (() => { const original = lots.find((lot) => lot.id === simulationImpact.lotId); return original ? <div className={styles.simulationGhost} aria-label={`Posição original do Lote ${original.lotNumber} no plano recebido`} style={{ left: `${timelinePosition(original.scheduledStart, rangeStart, rangeFinish)}%`, width: `${timelineWidth(original.scheduledStart, original.scheduledFinish, rangeStart, rangeFinish)}%` }}><strong>Lote {original.lotNumber}</strong><span>PLANO · {resourceId}</span></div> : null; })() : null}
                    {resourceLots.length === 0 ? <span className={styles.emptyLane}>Sem Lote programado neste intervalo</span> : null}
                  </div>
                </section>
              );
            })}
          </div>
          {lots.length === 0 ? <p className={styles.emptyTimeline}>Nenhum Lote neste destino.</p> : null}
        </div>
      </div>
      <div className={styles.timelineLegend} aria-label="Legenda do Plano Hora-Hora"><span data-destination="ASSEMBLY">Montagem</span><span data-destination="SPARE_PARTS">Reposição</span><span data-destination="ENGINEERING">Engenharia</span><span data-kind="setup">Setup demonstrativo</span><span data-kind="planned-break">Parada programada</span></div>
      {sceneMode === 'RESOURCE_CONDITIONS' && resourceConditionContexts.length ? <section className={styles.conditionImpact} aria-label="Impacto conhecido por Recurso"><h3>Impacto conhecido</h3><div>{resourceConditionContexts.filter((context) => context.eligible).map((context) => <article key={context.resourceId}><strong>{context.resourceId}{context.programmed ? <small>Programada</small> : null}</strong><span>{context.mainRestriction}</span><span>{context.materialContext}</span><span>{context.setupImpact}</span></article>)}</div><p>Fatos demonstrativos do plano atual; sem escolha, recomendação ou alteração de Recurso.</p></section> : null}
      <p className={styles.timelineNote}>Paradas programadas são referências temporais demonstrativas e podem atravessar um Lote; não são tempo de parada, falha ou manutenção. Setup de 30 min é uma premissa demonstrativa/TBD. Recurso programado não representa Despacho, Liberação, Disponibilidade do Recurso ou execução real.</p>
    </section>
  );
}
