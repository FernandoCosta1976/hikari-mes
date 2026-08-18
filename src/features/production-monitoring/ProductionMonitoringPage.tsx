import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLiveScenarioTime } from '../../app/clock/applicationClock';
import { OperationalWorkspace } from '../../app/workspace/OperationalWorkspace';
import { sourceDerivedTraceabilityByLotId } from '../../demo/scenarios/fundicaoDcSourceDerivedScenario';
import { componentResourceMappingByCode } from '../../demo/reference-data/foundry/componentResourceMappings';
import { selectAllProductionEvents, selectConfirmedQuantityByLotId, selectOrganizationsByLotId, selectPreparationConfirmedByLotId, selectProductionConfirmations, selectProductionExecutions, selectProductionReadiness, selectProductionReleases, selectProductionScheduling, selectScenarioDefinition, selectSessionClock, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { buildOperationalStatusByLotId } from '../../demo/adapters/operationalStatusResolution';
import { buildRequirementSnapshots, summarizeDay, type RequirementSnapshot, type RequirementStatus } from '../../domain/production-monitoring/executionStatus';
import { activeEventForLot, eventDurationMinutes, eventsNewestFirst, eventTypeLabel, oeeClassificationFor, type ProductionEvent } from '../../domain/production-monitoring/models';
import type { DemonstrativePauseReason } from '../../domain/production-execution/models';
import { validateConfirmationIncrement, type ProductionConfirmation } from '../../domain/production-confirmation/models';
import type { ProductionReleaseRecord } from '../../domain/production-release/models';
import type { Material, Lot } from '../../domain/production-scheduling/models';
import {
  adherenceQualifierLabel,
  deriveResourceStatusEntries,
  lastStatusChange,
  operationalStatusLabel,
  resourceOperationalStatusLabel,
  summarizeOperationalSnapshot,
  type AdherenceQualifier,
  type OperationalStatus,
  type ProductionOperationalStatus,
} from '../../domain/production-status/models';
import { timelinePosition, timelineWidth } from '../../domain/production-scheduling/temporalMath';
import { FOUNDRY_RESOURCE_IDS } from '../../domain/resource/models';
import { ScenarioResetControl } from '../../shared/operational/ScenarioResetControl';
import { Button } from '../../shared/ui/Button/Button';
import { IconTip } from '../../shared/ui/IconTip/IconTip';
import { destinationLabels, formatTime, materialFamilyLabel } from '../production-scheduling/productionSchedulingViewModel';
import styles from './ProductionMonitoringPage.module.css';

const statusLabel: Record<RequirementStatus, string> = { COMPLETED: 'Concluído', RUNNING: 'Em execução', DELAYED: 'Atrasado', NOT_STARTED: 'Não iniciado', SCHEDULED: 'A executar' };
/**
 * DEMONSTRATIVE EVENT TAXONOMY (Section 3) — the five Unplanned reasons an
 * operator can register live for a RUNNING Requirement via Registrar
 * parada. Planned Stops (Setup/Pausa programada/Refeição) and Microparada
 * stay reserved for calendar/seeded facts this round (Section 46).
 */
const stopReasonChoices: readonly [DemonstrativePauseReason, string][] = [
  ['EQUIPMENT_FAILURE', eventTypeLabel.EQUIPMENT_FAILURE],
  ['MATERIAL_SHORTAGE', eventTypeLabel.MATERIAL],
  ['TOOLING', eventTypeLabel.TOOLING],
  ['MACHINE_ADJUSTMENT', eventTypeLabel.MACHINE_ADJUSTMENT],
  ['OTHER', eventTypeLabel.OTHER],
];

/** Section 42 — "Próxima ação" is informational context, never a duplicate control of Controle de execução. */
function nextActionLabel(status: OperationalStatus, pendingFinalization: boolean, isReleased: boolean): string {
  if (pendingFinalization) return 'Finalizar execução';
  if (status === 'RUNNING') return 'Registrar produção ou pausar';
  if (status === 'PAUSED') return 'Retomar produção';
  if (status === 'WAITING_START') return 'Iniciar produção';
  if (status === 'READY_FOR_RELEASE') return 'Liberar para produção';
  if (status === 'COMPLETED') return 'Nenhuma — requirement concluído';
  if (!isReleased) return 'Aguardar liberação';
  return 'Aguardar preparação';
}

function ContextDialog({ snapshot, operationalStatus, events, confirmations, material, release, currentTime, onClose, onStart, onPause, onResume, onConfirmProduction, onComplete }: { snapshot: RequirementSnapshot; operationalStatus: ProductionOperationalStatus; events: readonly ProductionEvent[]; confirmations: readonly ProductionConfirmation[]; material: Material; release?: ProductionReleaseRecord; currentTime: string; onClose: () => void; onStart: () => void; onPause: (reason: DemonstrativePauseReason, observation?: string) => void; onResume: () => void; onConfirmProduction: (increment: number) => void; onComplete: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  const [registeringStop, setRegisteringStop] = useState(false);
  const [stopReason, setStopReason] = useState<DemonstrativePauseReason>('EQUIPMENT_FAILURE');
  const [stopObservation, setStopObservation] = useState('');
  const [registeringProduction, setRegisteringProduction] = useState(false);
  const [incrementInput, setIncrementInput] = useState('');
  useEffect(() => { close.current?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [onClose]);
  useEffect(() => { setRegisteringStop(false); setStopObservation(''); setRegisteringProduction(false); setIncrementInput(''); }, [snapshot.lot.id]);
  const traceability = sourceDerivedTraceabilityByLotId[snapshot.lot.id];
  const resourceRole = componentResourceMappingByCode[material.code];
  const relevantEvents = events.filter((event) => event.lotId === snapshot.lot.id);
  const { execution } = snapshot;
  const isReleased = release?.status === 'RELEASED';
  const canComplete = operationalStatus.pendingFinalization;
  const activeEvent = activeEventForLot(events, snapshot.lot.id);
  const incrementValue = Number(incrementInput);
  const incrementIsNumeric = incrementInput.trim() !== '' && Number.isFinite(incrementValue);
  const rejection = incrementIsNumeric ? validateConfirmationIncrement({ executionStatus: execution.status, increment: incrementValue, plannedQuantity: execution.plannedQuantity, accumulated: snapshot.producedQuantity }) : null;
  const rejectionMessage = rejection?.kind === 'EXCEEDS_PLANNED' ? `Quantidade excede o saldo planejado de ${rejection.remaining} peças.`
    : rejection?.kind === 'MUST_BE_INTEGER' ? 'Quantidade deve ser um número inteiro.'
    : rejection?.kind === 'MUST_BE_POSITIVE' ? 'Quantidade deve ser maior que zero.'
    : null;
  const previewAccumulated = incrementIsNumeric && !rejection ? snapshot.producedQuantity + incrementValue : snapshot.producedQuantity;
  const confirmProduction = () => { if (!incrementIsNumeric || rejection) return; onConfirmProduction(incrementValue); setIncrementInput(''); setRegisteringProduction(false); };
  const confirmStop = () => { onPause(stopReason, stopObservation.trim() || undefined); setRegisteringStop(false); setStopObservation(''); };
  const lastChange = lastStatusChange(execution);
  return createPortal(<div className={styles.modalLayer}><button className={styles.backdrop} aria-label="Fechar contexto" onClick={onClose} /><section role="dialog" aria-modal="true" aria-labelledby="monitoring-context-title" className={styles.modal}>
    <header><div><small>ACOMPANHAMENTO DO REQUIREMENT</small><h2 id="monitoring-context-title">{material.code}</h2></div><Button ref={close} aria-label="Fechar contexto de acompanhamento" onClick={onClose}>×</Button></header>
    <section aria-label="Situação operacional" className={styles.operationalStatusBlock} data-operational-status={operationalStatus.status}>
      <h3>Situação operacional</h3>
      <dl>
        <div><dt>Situação</dt><dd>{operationalStatusLabel[operationalStatus.status]}{operationalStatus.pendingFinalization ? <small>Pronto para finalização</small> : null}</dd></div>
        <div><dt>Aderência</dt><dd>{adherenceQualifierLabel[operationalStatus.adherence]}{operationalStatus.varianceMinutes !== null ? <small>{operationalStatus.varianceMinutes > 0 ? '+' : ''}{operationalStatus.varianceMinutes} min{snapshot.projectedFinish ? ` · Conclusão projetada ${formatTime(snapshot.projectedFinish)}` : ''}</small> : null}</dd></div>
        <div><dt>Produção</dt><dd>{execution.status === 'NOT_STARTED' ? `— / ${snapshot.lot.quantity}` : `${snapshot.producedQuantity} / ${snapshot.lot.quantity}`}</dd></div>
        <div><dt>Máquina</dt><dd>{snapshot.lot.scheduledResourceId}</dd></div>
        <div><dt>Início</dt><dd>{execution.actualStart ? formatTime(execution.actualStart) : '—'}</dd></div>
        <div><dt>Última mudança</dt><dd>{lastChange ? `${formatTime(lastChange.at)} · ${lastChange.label}` : '—'}</dd></div>
        <div><dt>Próxima ação</dt><dd>{nextActionLabel(operationalStatus.status, operationalStatus.pendingFinalization, isReleased)}</dd></div>
      </dl>
      <small>Situação operacional demonstrativa · consequência dos fatos de Plano, Liberação, Execução e Apontamento · requer validação de negócio.</small>
    </section>
    <dl>
      <div><dt>Peça</dt><dd>{material.code}</dd></div>
      <div><dt>Família</dt><dd>{materialFamilyLabel(material)}</dd></div>
      <div><dt>Lote Linha C</dt><dd>{traceability ? traceability.sourceLot : '—'}</dd></div>
      <div><dt>Planejado</dt><dd>{formatTime(snapshot.lot.scheduledStart)}–{formatTime(snapshot.lot.scheduledFinish)}</dd></div>
      <div><dt>Realizado</dt><dd>{snapshot.execution.actualStart ? `${formatTime(snapshot.execution.actualStart)}${snapshot.execution.actualFinish ? `–${formatTime(snapshot.execution.actualFinish)}` : ' (em curso)'}` : '—'}<small>{snapshot.execution.actualStart ? '' : 'Ausência de apontamento não significa zero produzido.'}</small></dd></div>
    </dl>
    <section aria-label="Detalhe da execução"><h3>Execução</h3><dl>
      <div><dt>Máquina titular</dt><dd>{resourceRole?.primaryResource ?? snapshot.lot.scheduledResourceId}</dd></div>
      <div><dt>Reserva(s)</dt><dd>{resourceRole?.reserveResources.length ? resourceRole.reserveResources.join(', ') : 'Nenhuma'}</dd></div>
      <div><dt>Destino</dt><dd>{destinationLabels[snapshot.lot.destination]}</dd></div>
      <div><dt>Modelo</dt><dd>{traceability?.sourceModel ?? '—'} · {traceability?.sourceColor ?? '—'}</dd></div>
    </dl></section>
    <section aria-label="Controle de execução" className={styles.executionControl}>
      <h3>Controle de execução</h3>
      {execution.status === 'NOT_STARTED' ? <>
        <p className={styles.sectionNote}>{isReleased ? 'Aguardando início' : 'Aguardando liberação — a execução exige o Lote Liberado.'}</p>
        {isReleased ? <Button onClick={onStart}>Iniciar produção</Button> : null}
      </> : null}
      {execution.status === 'IN_PROGRESS' ? <>
        <dl className={styles.contextGrid}>
          <div><dt>Início</dt><dd>{execution.actualStart ? formatTime(execution.actualStart) : '—'}</dd></div>
          <div><dt>Operador</dt><dd>{execution.executedBy ?? '—'}</dd></div>
          <div><dt>Aderência</dt><dd>{adherenceQualifierLabel[operationalStatus.adherence]}{operationalStatus.varianceMinutes !== null ? ` ${operationalStatus.varianceMinutes > 0 ? '+' : ''}${operationalStatus.varianceMinutes} min` : ''}</dd></div>
          <div><dt>Planejado</dt><dd>{execution.plannedQuantity} peças</dd></div>
          <div><dt>Produzido</dt><dd>{snapshot.producedQuantity} peças</dd></div>
          <div><dt>Restante</dt><dd>{Math.max(0, execution.plannedQuantity - snapshot.producedQuantity)} peças</dd></div>
        </dl>
        {registeringProduction ? <div className={styles.confirmationForm}>
          <label>Quantidade produzida nesta confirmação<input type="number" step="1" min="1" value={incrementInput} onChange={(event) => setIncrementInput(event.target.value)} aria-label={`Quantidade produzida na ${snapshot.lot.scheduledResourceId}`} autoFocus /></label>
          {rejectionMessage ? <p className={styles.confirmationError} role="alert">{rejectionMessage}</p> : <p className={styles.sectionNote}>Produção acumulada após confirmação: {previewAccumulated} / {execution.plannedQuantity}</p>}
          <div className={styles.executionActions}><Button onClick={confirmProduction} disabled={!incrementIsNumeric || Boolean(rejection)}>Confirmar apontamento</Button><Button onClick={() => { setRegisteringProduction(false); setIncrementInput(''); }}>Cancelar</Button></div>
        </div> : registeringStop ? <div className={styles.confirmationForm}>
          <label>Motivo<select aria-label={`Motivo da parada na ${snapshot.lot.scheduledResourceId}`} value={stopReason} onChange={(event) => setStopReason(event.target.value as DemonstrativePauseReason)} autoFocus>{stopReasonChoices.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Observação (opcional)<input type="text" aria-label={`Observação da parada na ${snapshot.lot.scheduledResourceId}`} value={stopObservation} onChange={(event) => setStopObservation(event.target.value)} /></label>
          <div className={styles.executionActions}><Button onClick={confirmStop}>Registrar parada</Button><Button onClick={() => { setRegisteringStop(false); setStopObservation(''); }}>Cancelar</Button></div>
        </div>
          : <div className={styles.executionActions}><Button onClick={() => setRegisteringProduction(true)}>Registrar produção</Button><Button onClick={() => setRegisteringStop(true)}>Registrar parada</Button>{canComplete ? <Button onClick={onComplete}>Finalizar execução</Button> : null}</div>}
        {confirmations.length ? <details className={styles.confirmationHistory}><summary>Histórico de apontamentos</summary><ul>{[...confirmations].reverse().map((confirmation) => <li key={confirmation.id}>{formatTime(confirmation.confirmedAt)} · +{confirmation.producedQuantity}</li>)}</ul></details> : null}
      </> : null}
      {execution.status === 'PAUSED' ? <>
        <dl className={styles.contextGrid}>
          <div><dt>Desde</dt><dd>{activeEvent ? formatTime(activeEvent.startedAt) : '—'}</dd></div>
          <div><dt>Motivo</dt><dd>{activeEvent ? eventTypeLabel[activeEvent.eventType] : 'Motivo demonstrativo'}<small>demonstrativo</small></dd></div>
          {activeEvent?.observation ? <div><dt>Observação</dt><dd>{activeEvent.observation}</dd></div> : null}
        </dl>
        <Button onClick={onResume}>Retomar produção</Button>
      </> : null}
      {execution.status === 'COMPLETED' ? <dl className={styles.contextGrid}>
        <div><dt>Início</dt><dd>{execution.actualStart ? formatTime(execution.actualStart) : '—'}</dd></div>
        <div><dt>Fim</dt><dd>{execution.actualFinish ? formatTime(execution.actualFinish) : '—'}</dd></div>
        <div><dt>Quantidade executada</dt><dd>{snapshot.producedQuantity} peças</dd></div>
      </dl> : null}
      <small>Execução demonstrativa · EXECUTION GRANULARITY: DEMONSTRATIVE · requer validação de negócio.</small>
    </section>
    <section aria-label="Eventos do requirement"><h3>Eventos</h3>{relevantEvents.length ? relevantEvents.map((event) => <p key={event.eventId}>{formatTime(event.startedAt)} · {eventTypeLabel[event.eventType]} · {event.status === 'ACTIVE' ? `ATIVO · ${eventDurationMinutes(event, currentTime)} min` : `${eventDurationMinutes(event, currentTime)} min · ENCERRADO`}</p>) : <p>Sem eventos demonstrativos.</p>}</section>
    <small>Produzido não significa estoque disponível, quantidade boa ou aceita. Dados de execução são demonstrativos · requerem validação de negócio.</small>
  </section></div>, document.body);
}

export function ProductionMonitoringPage() {
  const definition = useScenarioStore(selectProductionScheduling);
  const scenario = useScenarioStore(selectScenarioDefinition);
  const executionsByLot = useScenarioStore(selectProductionExecutions);
  const releasesByLot = useScenarioStore(selectProductionReleases);
  const readinessAssessments = useScenarioStore(selectProductionReadiness);
  const preparationConfirmedByLotId = useScenarioStore(selectPreparationConfirmedByLotId);
  const organizationsByLotId = useScenarioStore(selectOrganizationsByLotId);
  const activeScheduleVersionId = useScenarioStore((state) => state.activeScheduleVersionId);
  const confirmedQuantityByLotId = useScenarioStore(selectConfirmedQuantityByLotId);
  const confirmationsByLot = useScenarioStore(selectProductionConfirmations);
  const sessionClock = useScenarioStore(selectSessionClock);
  const currentTime = useLiveScenarioTime(sessionClock ?? scenario?.currentScenarioTime);
  const startExecution = useScenarioStore((state) => state.startLotExecution);
  const pauseExecution = useScenarioStore((state) => state.pauseLotExecution);
  const resumeExecution = useScenarioStore((state) => state.resumeLotExecution);
  const confirmProduction = useScenarioStore((state) => state.confirmProduction);
  const completeExecution = useScenarioStore((state) => state.completeLotExecution);
  const [openLotId, setOpenLotId] = useState<string | null>(null);

  const events = useScenarioStore(selectAllProductionEvents);
  // Only counts downtime that happened DURING an already-started run — an Event that precedes actualStart
  // delayed the start itself, which actualStart already reflects; adding it again here would double-count it.
  // Planned Stops never enter Projection's downtime either (Section 15/18) — same governed Unplanned Downtime OEE consumes.
  const downtimeMinutesByLotId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const event of events) {
      if (oeeClassificationFor(event.eventType) !== 'UNPLANNED_DOWNTIME') continue;
      const actualStart = executionsByLot[event.lotId]?.actualStart;
      if (actualStart && Date.parse(event.startedAt) < Date.parse(actualStart)) continue;
      map[event.lotId] = (map[event.lotId] ?? 0) + eventDurationMinutes(event, currentTime);
    }
    return map;
  }, [events, executionsByLot, currentTime]);

  const lots = definition?.lots ?? [];
  const materialOf = (materialId: string) => definition!.materials.find((item) => item.id === materialId)!;
  const businessDate = currentTime.slice(0, 10);
  const rangeStart = `${businessDate}T00:00:00-03:00`;
  const rangeFinish = `${businessDate}T23:59:59-03:00`;

  const snapshots = useMemo(() => definition ? buildRequirementSnapshots(lots, executionsByLot, confirmedQuantityByLotId, currentTime, downtimeMinutesByLotId) : [], [definition, lots, executionsByLot, confirmedQuantityByLotId, currentTime, downtimeMinutesByLotId]);
  const totals = useMemo(() => summarizeDay(snapshots), [snapshots]);
  const plannedUntilNow = snapshots.filter((snapshot) => snapshot.status !== 'SCHEDULED').reduce((sum, snapshot) => sum + snapshot.lot.quantity, 0);
  const runningCount = snapshots.filter((snapshot) => snapshot.status === 'RUNNING' || snapshot.status === 'DELAYED').length;
  const feed = useMemo(() => eventsNewestFirst(events), [events]);
  const currentPosition = timelinePosition(currentTime, rangeStart, rangeFinish);
  const openSnapshot = openLotId ? snapshots.find((snapshot) => snapshot.lot.id === openLotId) : undefined;
  const endOfDayStatus = totals.atRiskLotIds.length === 0 ? 'NO RITMO' : totals.atRiskLotIds.length <= 2 ? 'ATENÇÃO' : 'RISCO DE NÃO CUMPRIMENTO';
  const firstDelayed = snapshots.find((snapshot) => snapshot.status === 'DELAYED');

  /**
   * Capability 07 — the ONE shared Operational Status per Requirement, the
   * single source every screen (Acompanhamento, Aderência, Estratégica)
   * consumes — never recomputed independently per screen (Section 32/38).
   */
  const projectedFinishByLotId = useMemo(() => Object.fromEntries(snapshots.map((snapshot) => [snapshot.lot.id, snapshot.projectedFinish])), [snapshots]);
  const statusByLotId = useMemo(() => buildOperationalStatusByLotId({
    lots, executionsByLot, releasesByLot, readinessAssessments, preparationConfirmedByLotId, organizationsByLotId,
    confirmedQuantityByLotId, projectedFinishByLotId, activeScheduleVersionId, currentTime,
  }), [lots, executionsByLot, releasesByLot, readinessAssessments, preparationConfirmedByLotId, organizationsByLotId, confirmedQuantityByLotId, projectedFinishByLotId, activeScheduleVersionId, currentTime]);
  const lotsOrderedByResource = useMemo(() => {
    const map: Record<string, Lot[]> = {};
    for (const resourceId of FOUNDRY_RESOURCE_IDS) map[resourceId] = lots.filter((lot) => lot.scheduledResourceId === resourceId).sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart));
    return map;
  }, [lots]);
  const resourceStatusEntries = useMemo(() => deriveResourceStatusEntries(FOUNDRY_RESOURCE_IDS, lotsOrderedByResource, statusByLotId), [lotsOrderedByResource, statusByLotId]);
  const resourceStatusByResourceId = useMemo(() => Object.fromEntries(resourceStatusEntries.map((entry) => [entry.resourceId, entry])), [resourceStatusEntries]);
  /** Section 44 — Operational Snapshot summary, real counts from the current per-Resource situation. */
  const operationalSnapshotSummary = useMemo(() => summarizeOperationalSnapshot(resourceStatusEntries.map((entry) => {
    const producedQuantity = entry.current ? (snapshots.find((snapshot) => snapshot.lot.id === entry.current!.lotId)?.producedQuantity ?? 0) : 0;
    return entry.current ? { status: entry.current.status, adherence: entry.current.adherence, producedQuantity } : { status: 'PLANNED' as OperationalStatus, adherence: 'ON_TIME' as AdherenceQualifier, producedQuantity: 0 };
  })), [resourceStatusEntries, snapshots]);
  /** Section 13 — WIP strip, counted over every Requirement of the reference day, not just the current per-Resource pick. */
  const wipSummary = useMemo(() => summarizeOperationalSnapshot(snapshots.map((snapshot) => {
    const status = statusByLotId[snapshot.lot.id];
    return status ? { status: status.status, adherence: status.adherence, producedQuantity: snapshot.producedQuantity } : null;
  }).filter((entry): entry is { status: OperationalStatus; adherence: AdherenceQualifier; producedQuantity: number } => entry !== null)), [snapshots, statusByLotId]);
  const openOperationalStatus = openSnapshot ? statusByLotId[openSnapshot.lot.id] : undefined;

  if (!definition) return <p>Preparando Acompanhamento demonstrativo…</p>;

  return <OperationalWorkspace perspective="MONITORING" sidebarContent={<div className={styles.sidebar}><strong>Acompanhamento</strong><IconTip icon="◷" label="Data de referência" value={`${businessDate.slice(8, 10)}/${businessDate.slice(5, 7)}`} tip={`Data de referência · ${businessDate}`} /><IconTip icon="⏱" label="Horário atual" value={formatTime(currentTime)} /><ScenarioResetControl /><IconTip icon="ⓘ" label="Dados de execução" tip="Fatos de execução demonstrativos · requerem validação de negócio" /></div>}>
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span>Capacidade 06 · Núcleo + Essencial</span>
          <h1>O que está acontecendo em relação ao plano?</h1>
          <p className={styles.dateContext}>{businessDate.split('-').reverse().join('/')} · Dados simulados até {formatTime(currentTime)} · Futuro projetado</p>
        </div>
        <aside><IconTip icon="⏱" label="Horário atual" value={formatTime(currentTime)} tip="Horário de referência do cenário · passado, agora e futuro" className={styles.currentTimeTip} /></aside>
      </header>

      <section className={styles.kpiStrip} aria-label="Resumo operacional do dia">
        <div><span>Planejado até agora</span><strong>{plannedUntilNow.toLocaleString('pt-BR')}</strong></div>
        <div><span>Realizado até agora</span><strong>{totals.actualQuantity.toLocaleString('pt-BR')}</strong></div>
        <div><span>Em execução</span><strong>{runningCount}</strong></div>
        <div data-attention="true"><span>Atrasados</span><strong>{totals.delayedOrNotStartedCount}</strong></div>
        <div><span>A executar</span><strong>{totals.scheduledCount}</strong></div>
        <div><span>Projeção do dia</span><strong>{totals.projectedFinalQuantity.toLocaleString('pt-BR')}</strong></div>
      </section>

      <section className={styles.wip} aria-label="Situação operacional das máquinas" data-testid="operational-snapshot">
        <button data-state={operationalSnapshotSummary.running > 0 ? 'running' : undefined}><span>Produzindo</span><strong>{operationalSnapshotSummary.running}</strong></button>
        <button data-state={operationalSnapshotSummary.paused > 0 ? 'attention' : undefined}><span>Pausados</span><strong>{operationalSnapshotSummary.paused}</strong></button>
        <button><span>Aguardando início</span><strong>{operationalSnapshotSummary.waitingStart}</strong></button>
        <button><span>Concluídos</span><strong>{operationalSnapshotSummary.completed}</strong></button>
        <p data-testid="wip-summary">WIP (demonstrativo) — {wipSummary.wipRequirementCount} requirements em execução ou pausados · {wipSummary.wipQuantity.toLocaleString('pt-BR')} peças apontadas até agora · {operationalSnapshotSummary.totalCount} máquinas · {operationalSnapshotSummary.late} atrasadas · {operationalSnapshotSummary.atRisk} em risco. <small>WIP SEMANTICS: DEMONSTRATIVE / BUSINESS VALIDATION REQUIRED — nunca Buffer, Estoque Disponível ou Produto Acabado.</small></p>
      </section>

      <section className={styles.live} aria-labelledby="live-title">
        <header><div><h2 id="live-title">Quadro Hora-Hora — Passado, Agora e Futuro</h2><p>Planejado · Realizado · Projetado — clique em um requirement para acompanhar</p></div><span className={styles.legend}><i data-layer="scheduled" />Planejado<i data-layer="actual" />Realizado<i data-layer="projected" />Projetado</span></header>
        <div className={styles.timeline} data-testid="live-production-timeline">
          <div className={styles.axisCorner}>Máquina</div>
          <div className={styles.axis}>{[0, 3, 6, 9, 12, 15, 18, 21].map((hour) => <span key={hour} style={{ left: `${(hour / 24) * 100}%` }}>{String(hour).padStart(2, '0')}:00</span>)}</div>
          <div className={styles.timeLine} style={{ left: `calc(8rem + (100% - 8rem) * ${currentPosition / 100})` }}><span>{formatTime(currentTime)}</span></div>
          <div className={styles.lanes}>
            {FOUNDRY_RESOURCE_IDS.map((resourceId) => {
              const laneSnapshots = snapshots.filter((snapshot) => snapshot.lot.scheduledResourceId === resourceId).sort((a, b) => Date.parse(a.lot.scheduledStart) - Date.parse(b.lot.scheduledStart));
              const dominant = laneSnapshots.find((s) => s.status === 'RUNNING' || s.status === 'DELAYED') ?? laneSnapshots.find((s) => s.status === 'NOT_STARTED') ?? [...laneSnapshots].reverse().find((s) => s.status === 'COMPLETED');
              const dominantMaterial = dominant ? materialOf(dominant.lot.materialId) : undefined;
              const resourceEntry = resourceStatusByResourceId[resourceId];
              const nextMaterial = resourceEntry?.next ? materialOf(lots.find((lot) => lot.id === resourceEntry.next!.lotId)!.materialId) : undefined;
              const laneActiveEvent = dominant && resourceEntry?.current?.status === 'PAUSED' ? events.find((event) => event.lotId === dominant.lot.id && event.status === 'ACTIVE') : undefined;
              return <section className={styles.lane} key={resourceId} data-status={dominant?.status}>
                <button className={styles.resource} data-operational-status={resourceEntry?.current?.status ?? 'NONE'} data-resource-status={resourceEntry?.resourceStatus} onClick={() => dominant && setOpenLotId(dominant.lot.id)}>
                  <span className={styles.resourceHead}><strong>{resourceId}</strong><span data-status={dominant?.status}>{resourceEntry?.current ? operationalStatusLabel[resourceEntry.current.status] : resourceOperationalStatusLabel.NO_ACTIVE_REQUIREMENT}</span></span>
                  <small>{dominantMaterial ? `${dominantMaterial.code} · ${dominant!.producedQuantity}/${dominant!.lot.quantity}${resourceEntry?.current ? ` · ${adherenceQualifierLabel[resourceEntry.current.adherence]}` : ''}` : 'Sem requirement ativo'}</small>
                  {laneActiveEvent ? <small data-testid="active-event-note">{eventTypeLabel[laneActiveEvent.eventType]} · desde {formatTime(laneActiveEvent.startedAt)}</small> : nextMaterial && resourceEntry?.next ? <small>Próximo: {nextMaterial.code} · {formatTime(resourceEntry.next.scheduledStart)}</small> : null}
                </button>
                <div className={styles.tracks}>
                  <div><span>PLANEJADO</span>{laneSnapshots.map((snapshot) => <button key={snapshot.lot.id} className={styles.scheduled} data-status={snapshot.status} data-lot-id={snapshot.lot.id} title={`${materialOf(snapshot.lot.materialId).code} · ${formatTime(snapshot.lot.scheduledStart)}–${formatTime(snapshot.lot.scheduledFinish)}`} style={{ left: `${timelinePosition(snapshot.lot.scheduledStart, rangeStart, rangeFinish)}%`, width: `${timelineWidth(snapshot.lot.scheduledStart, snapshot.lot.scheduledFinish, rangeStart, rangeFinish)}%` }} onClick={() => setOpenLotId(snapshot.lot.id)}>{materialOf(snapshot.lot.materialId).code}</button>)}</div>
                  <div><span>REAL</span>{laneSnapshots.map((snapshot) => {
                    if (snapshot.status === 'SCHEDULED') return snapshot.projection === 'AT_RISK' ? <span key={snapshot.lot.id} className={styles.projectedOnly} data-testid="projected-risk" style={{ left: `${timelinePosition(snapshot.lot.scheduledStart, rangeStart, rangeFinish)}%` }}>Projetado em risco</span> : null;
                    if (snapshot.status === 'NOT_STARTED') return <span key={snapshot.lot.id} className={styles.notStarted} data-lot-id={snapshot.lot.id} style={{ left: `${timelinePosition(snapshot.lot.scheduledStart, rangeStart, rangeFinish)}%` }} onClick={() => setOpenLotId(snapshot.lot.id)}>Ainda não iniciado</span>;
                    const actualFinish = snapshot.execution.actualFinish ?? currentTime;
                    return <span key={snapshot.lot.id} className={styles.actualWrap}>
                      <button className={styles.actual} data-status={snapshot.status} data-lot-id={snapshot.lot.id} title={`${materialOf(snapshot.lot.materialId).code} · ${statusLabel[snapshot.status]} · ${snapshot.producedQuantity}/${snapshot.lot.quantity}`} style={{ left: `${timelinePosition(snapshot.execution.actualStart!, rangeStart, rangeFinish)}%`, width: `${timelineWidth(snapshot.execution.actualStart!, actualFinish, rangeStart, rangeFinish)}%` }} onClick={() => setOpenLotId(snapshot.lot.id)}>{materialOf(snapshot.lot.materialId).code} · {snapshot.producedQuantity}/{snapshot.lot.quantity}</button>
                      {snapshot.projectedFinish && snapshot.status !== 'COMPLETED' ? <span className={styles.projected} style={{ left: `${timelinePosition(actualFinish, rangeStart, rangeFinish)}%`, width: `${timelineWidth(actualFinish, snapshot.projectedFinish, rangeStart, rangeFinish)}%` }} /> : null}
                    </span>;
                  })}{events.filter((event) => event.resourceId === resourceId).map((event) => <button key={event.eventId} className={styles.eventBlock} aria-label={`Evento na ${resourceId}: ${eventTypeLabel[event.eventType]}`} style={{ left: `${timelinePosition(event.startedAt, rangeStart, rangeFinish)}%`, width: `${timelineWidth(event.startedAt, event.endedAt ?? currentTime, rangeStart, rangeFinish)}%` }} onClick={() => setOpenLotId(event.lotId)}>Evento</button>)}</div>
                </div>
              </section>;
            })}
          </div>
        </div>
      </section>

      <section className={styles.narrative} aria-label="Leitura executiva do dia">
        <p>Hoje tínhamos <b>{totals.plannedQuantity.toLocaleString('pt-BR')}</b> peças programadas em {lots.length} requirements reais. Até {formatTime(currentTime)} já concluímos <b>{totals.actualQuantity.toLocaleString('pt-BR')}</b>. Neste momento <b>{runningCount}</b> máquina(s) estão produzindo{firstDelayed ? <> — a <b>{firstDelayed.lot.scheduledResourceId}</b> sofreu uma parada não planejada de {downtimeMinutesByLotId[firstDelayed.lot.id] ?? 0} minutos e está com atraso projetado de {firstDelayed.varianceMinutes} min</> : null}. <b>{totals.delayedOrNotStartedCount}</b> requirement(s) precisam de atenção — {totals.atRiskLotIds.length} em risco de não cumprir o horário planejado. Mantidas as condições atuais, a projeção de fechamento é <b>{totals.projectedFinalQuantity.toLocaleString('pt-BR')}</b> peças.</p>
      </section>

      <section className={styles.endOfDay} aria-label="Projeção de fechamento do dia" data-status={endOfDayStatus}>
        <header><h2>Projeção de fechamento do dia</h2><span data-status={endOfDayStatus}>{endOfDayStatus}</span></header>
        <dl>
          <div><dt>Planejado</dt><dd>{totals.plannedQuantity.toLocaleString('pt-BR')}</dd></div>
          <div><dt>Realizado até agora</dt><dd>{totals.actualQuantity.toLocaleString('pt-BR')}</dd></div>
          <div><dt>Em execução</dt><dd>{totals.runningQuantity.toLocaleString('pt-BR')}</dd></div>
          <div><dt>Restante</dt><dd>{totals.remainingQuantity.toLocaleString('pt-BR')}</dd></div>
          <div><dt>Projetado ao final</dt><dd>{totals.projectedFinalQuantity.toLocaleString('pt-BR')}</dd></div>
          <div><dt>Requirements em risco</dt><dd>{totals.atRiskLotIds.length}</dd></div>
        </dl>
        <p>Cálculo determinístico: Planejado − Realizado − Em execução = Restante ({totals.plannedQuantity.toLocaleString('pt-BR')} − {totals.actualQuantity.toLocaleString('pt-BR')} − {totals.runningQuantity.toLocaleString('pt-BR')} = {totals.remainingQuantity.toLocaleString('pt-BR')}). Projeção assume que os requirements em risco iniciam nos próximos minutos; nenhuma máquina é reprogramada ou reatribuída automaticamente.</p>
      </section>

      <section className={styles.feed} aria-labelledby="feed-title"><header><div><h2 id="feed-title">Registro de Eventos</h2><p>Mais recente primeiro · fatos operacionais demonstrativos</p></div><span>ATIVO / ENCERRADO</span></header><div>{feed.map((event) => <button key={event.eventId} data-status={event.status} onClick={() => setOpenLotId(event.lotId)}><time>{formatTime(event.startedAt)}</time><strong>{event.resourceId}</strong><span>{materialOf(lots.find((lot) => lot.id === event.lotId)!.materialId).code}</span><b>{eventTypeLabel[event.eventType]}</b><em>{event.status === 'ACTIVE' ? `ATIVO · ${eventDurationMinutes(event, currentTime)} min` : `${eventDurationMinutes(event, currentTime)} min · ENCERRADO`}</em></button>)}</div></section>

      <details className={styles.disclosure}><summary>Como esses fatos preparam o OEE? <span>Ver detalhes</span></summary><div className={styles.oeeChain}><strong>Fatos de execução + Eventos + Tempo</strong><span>→ Tempo de Produção Planejado / Tempo em Operação / Tempo Parado</span><strong>Produzido (Quantidade Total)</strong><span>→ Quantidade Boa permanece desconhecida até haver dado de qualidade governado</span><strong>OEE</strong><span>não calculado nesta capacidade</span></div></details>
    </div>
    {openSnapshot && openOperationalStatus ? <ContextDialog snapshot={openSnapshot} operationalStatus={openOperationalStatus} events={events} confirmations={confirmationsByLot[openSnapshot.lot.id] ?? []} material={materialOf(openSnapshot.lot.materialId)} release={releasesByLot[openSnapshot.lot.id]} currentTime={currentTime} onClose={() => setOpenLotId(null)} onStart={() => startExecution(openSnapshot.lot.id)} onPause={(reason, observation) => pauseExecution(openSnapshot.lot.id, reason, observation)} onResume={() => resumeExecution(openSnapshot.lot.id)} onConfirmProduction={(increment) => confirmProduction(openSnapshot.lot.id, increment)} onComplete={() => completeExecution(openSnapshot.lot.id)} /> : null}
  </OperationalWorkspace>;
}
