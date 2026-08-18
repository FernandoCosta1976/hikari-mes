import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLiveScenarioTime } from '../../app/clock/applicationClock';
import { OperationalWorkspace } from '../../app/workspace/OperationalWorkspace';
import { computeFundicaoDcAdherenceSummary, computeFundicaoDcShiftAdherenceSummaries, rankedExceptions, type FundicaoDcAdherenceRow } from '../../demo/adapters/adherenceSummaryAdapter';
import { buildOperationalStatusByLotId } from '../../demo/adapters/operationalStatusResolution';
import { eventsForScenario, idealCycleTimeSecondsForScenario } from '../../demo/scenario-engine/scenarioFixtures';
import { selectConfirmedQuantityByLotId, selectOrganizationsByLotId, selectPreparationConfirmedByLotId, selectProductionExecutions, selectProductionReadiness, selectProductionReleases, selectProductionScheduling, selectScenarioDefinition, selectSessionClock, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import type { DeviationClassification } from '../../domain/production-adherence/models';
import { assessLotExecutionHealth } from '../../domain/production-execution/lotHealth';
import { eventDurationMinutes, type ProductionEvent, type ProductionEventType } from '../../domain/production-monitoring/models';
import { adherenceQualifierLabel, operationalStatusLabel, type ProductionOperationalStatus } from '../../domain/production-status/models';
import { timelinePosition, timelineWidth } from '../../domain/production-scheduling/temporalMath';
import { ScenarioResetControl } from '../../shared/operational/ScenarioResetControl';
import { Bar } from '../../shared/ui/Bar/Bar';
import { Button } from '../../shared/ui/Button/Button';
import { IconTip } from '../../shared/ui/IconTip/IconTip';
import { LotHealthIndicator } from '../../shared/ui/LotHealthIndicator/LotHealthIndicator';
import { formatDateTime, formatTime } from '../production-scheduling/productionSchedulingViewModel';
import monitoringStyles from '../production-monitoring/ProductionMonitoringPage.module.css';
import styles from './ProductionAdherencePage.module.css';

const classificationLabel: Record<DeviationClassification, string> = { ON_PLAN: 'Conforme plano', EARLY: 'Início antecipado', LATE: 'Atraso', STOPPED: 'Parado', AT_RISK: 'Risco de atraso' };
const classificationIcon: Record<DeviationClassification, string> = { ON_PLAN: '✓', STOPPED: '⚠', LATE: '◷', EARLY: '↗', AT_RISK: '?' };
const classificationTone: Record<DeviationClassification, 'positive' | 'attention' | 'neutral'> = { ON_PLAN: 'positive', STOPPED: 'attention', LATE: 'attention', AT_RISK: 'attention', EARLY: 'neutral' };
const eventLabel: Record<ProductionEventType, string> = { MATERIAL: 'Falta de material', MACHINE_ADJUSTMENT: 'Ajuste de máquina', TOOLING: 'Ferramental', QUALITY: 'Qualidade', OTHER: 'Outro' };
const shiftStatusLabel = { COMPLETED: 'CONCLUÍDO', IN_PROGRESS: 'EM ANDAMENTO', UPCOMING: 'AINDA NÃO INICIADO' } as const;

function AdherenceDialog({ row, operationalStatus, events, idealCycleTimeSecondsByMaterialId, confirmedQuantityByLotId, currentTime, onClose }: { row: FundicaoDcAdherenceRow; operationalStatus?: ProductionOperationalStatus; events: readonly ProductionEvent[]; idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>>; confirmedQuantityByLotId: Readonly<Record<string, number>>; currentTime: string; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { close.current?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [onClose]);
  const { lot, execution, classification, deviationMinutes, impact, resourceId } = row;
  const producedQuantity = confirmedQuantityByLotId[lot.id] ?? 0;
  const activeEvent = events.find((event) => event.lotId === lot.id && event.status === 'ACTIVE');
  const health = assessLotExecutionHealth(execution, producedQuantity, lot.scheduledStart, lot.scheduledFinish, idealCycleTimeSecondsByMaterialId[lot.materialId], currentTime);
  return createPortal(<div className={styles.modalLayer}><button className={styles.backdrop} aria-label="Fechar contexto" onClick={onClose} /><section role="dialog" aria-modal="true" aria-labelledby="adherence-context-title" className={styles.modal}>
    <header><div><small>ADERÊNCIA</small><h2 id="adherence-context-title">{resourceId} · Lote {lot.lotNumber}</h2><LotHealthIndicator health={health} context={{ lotLabel: lot.lotNumber, material: '', quantity: lot.quantity, resourceId, scheduledStart: formatTime(lot.scheduledStart), scheduledFinish: formatTime(lot.scheduledFinish) }} /></div><Button ref={close} aria-label="Fechar contexto de aderência" onClick={onClose}>×</Button></header>
    {operationalStatus ? <p data-operational-status={operationalStatus.status}>{operationalStatusLabel[operationalStatus.status]} · {adherenceQualifierLabel[operationalStatus.adherence]}{operationalStatus.varianceMinutes !== null ? ` ${operationalStatus.varianceMinutes > 0 ? '+' : ''}${operationalStatus.varianceMinutes} min` : ''}</p> : null}
    <dl>
      <div><dt>Início planejado</dt><dd>{formatTime(lot.scheduledStart)}</dd></div>
      <div><dt>Início real</dt><dd>{execution.actualStart ? formatTime(execution.actualStart) : '—'}</dd></div>
      <div><dt>Término planejado</dt><dd>{formatTime(lot.scheduledFinish)}</dd></div>
      <div><dt>Término real/projetado</dt><dd>{execution.actualFinish ? formatTime(execution.actualFinish) : '—'}</dd></div>
      <div><dt>Progresso</dt><dd>{producedQuantity} / {execution.plannedQuantity} · {Math.round(producedQuantity / execution.plannedQuantity * 100)}%</dd></div>
      <div><dt>Classificação do desvio de início</dt><dd>{classificationLabel[classification]}{deviationMinutes !== null ? ` · ${deviationMinutes > 0 ? '+' : ''}${deviationMinutes} min` : ''} <small>DEMONSTRATIVA</small></dd></div>
      <div><dt>Evento ativo</dt><dd>{activeEvent ? `${eventLabel[activeEvent.eventType]} · ${eventDurationMinutes(activeEvent, currentTime)} min` : 'Nenhum'}</dd></div>
      <div><dt>Próximo Lote potencialmente impactado</dt><dd>{impact ? `${impact.impactedLot.lotNumber} · ${formatDateTime(impact.impactedLot.scheduledStart)}` : 'Nenhum conhecido'}</dd></div>
    </dl>
    <small>Aderência ao plano — indicador demonstrativo, sem correspondência a fórmula industrial de OEE.</small>
  </section></div>, document.body);
}

export function ProductionAdherencePage() {
  const definition = useScenarioStore(selectProductionScheduling);
  const scenario = useScenarioStore(selectScenarioDefinition);
  const executionsByLot = useScenarioStore(selectProductionExecutions);
  const releasesByLot = useScenarioStore(selectProductionReleases);
  const readinessAssessments = useScenarioStore(selectProductionReadiness);
  const preparationConfirmedByLotId = useScenarioStore(selectPreparationConfirmedByLotId);
  const organizationsByLotId = useScenarioStore(selectOrganizationsByLotId);
  const activeScheduleVersionId = useScenarioStore((state) => state.activeScheduleVersionId);
  const confirmedQuantityByLotId = useScenarioStore(selectConfirmedQuantityByLotId);
  const [openRow, setOpenRow] = useState<FundicaoDcAdherenceRow | null>(null);
  const sessionClock = useScenarioStore(selectSessionClock);
  const currentTime = useLiveScenarioTime(sessionClock ?? scenario?.currentScenarioTime);
  const events = eventsForScenario(scenario?.id);
  const idealCycleTimeSecondsByMaterialId = idealCycleTimeSecondsForScenario(scenario?.id);
  if (!definition || !scenario) return <p>Preparando aderência demonstrativa…</p>;
  const businessDate = currentTime.slice(0, 10);
  const rangeStart = `${businessDate}T00:00:00-03:00`;
  const rangeFinish = `${businessDate}T23:59:59-03:00`;
  const currentPosition = timelinePosition(currentTime, rangeStart, rangeFinish);

  /** Capability 07 — the SAME shared Operational Status Acompanhamento consumes, never a separate "Em produção" classification (Section 23). */
  const statusByLotId = buildOperationalStatusByLotId({
    lots: definition.lots, executionsByLot, releasesByLot, readinessAssessments, preparationConfirmedByLotId, organizationsByLotId,
    confirmedQuantityByLotId, activeScheduleVersionId, currentTime,
  });

  const day = computeFundicaoDcAdherenceSummary(definition, executionsByLot, currentTime);
  const shifts = computeFundicaoDcShiftAdherenceSummaries(definition, executionsByLot, currentTime);
  const currentShift = shifts.find((shift) => shift.status === 'IN_PROGRESS') ?? shifts[shifts.length - 1];
  const completedShifts = shifts.filter((shift) => shift.status === 'COMPLETED');
  const shiftExceptions = rankedExceptions(currentShift.rows);
  const mainException = shiftExceptions[0];
  const dayException = rankedExceptions(day.rows)[0];

  return <OperationalWorkspace perspective="ADHERENCE" sidebarContent={<div className={monitoringStyles.sidebar}><strong>Aderência</strong><IconTip icon="◷" label="Data de referência" value={`${businessDate.slice(8, 10)}/${businessDate.slice(5, 7)}`} tip={`Data de referência · ${businessDate}`} /><IconTip icon="⏱" label="Horário atual" value={formatTime(currentTime)} /><ScenarioResetControl /><IconTip icon="ⓘ" label="Classificação demonstrativa" tip="Classificação demonstrativa · requer validação de negócio" /></div>}>
    <div className={styles.page}>
      <header className={styles.hero}>
        <div><span>Capacidade 07 · Núcleo + Essencial</span><h1>Estamos executando conforme o planejado?</h1></div>
        <aside><IconTip icon="⏱" label="Horário atual" value={formatTime(currentTime)} tip="Horário de referência do cenário · passado, agora e futuro" className={styles.currentTimeTip} /></aside>
      </header>

      <section className={styles.turnoRow} aria-label={`Aderência do ${currentShift.shiftName} e acumulado do dia`}>
        <div className={styles.shiftHeadline}>
          <div className={styles.shiftBadge}><span data-status={currentShift.status}>{currentShift.shiftName.toUpperCase()} · {shiftStatusLabel[currentShift.status]}</span>{currentShift.status === 'IN_PROGRESS' ? <em>Parcial até {formatTime(currentTime)}</em> : null}</div>
          <div className={styles.ratioBlock}><strong>{currentShift.total > 0 ? `${currentShift.onPlan} / ${currentShift.total}` : 'N/A'}</strong><Bar ratio={currentShift.total > 0 ? currentShift.ratio : null} tone="positive" label={`Aderência do turno: ${Math.round(currentShift.ratio * 100)}%`} className={styles.ratioBar} /><small>Lotes conforme plano / total analisado</small></div>
          <div className={styles.mainImpact}>
            {mainException ? <><span>Principal desvio</span><strong>{mainException.resourceId} · Lote {mainException.lot.lotNumber} · {classificationLabel[mainException.classification]}</strong><p>{mainException.impact ? `Próximo Lote potencialmente impactado: ${mainException.impact.impactedLot.lotNumber} · ${formatDateTime(mainException.impact.impactedLot.scheduledStart)}` : mainException.deviationMinutes !== null ? `${mainException.deviationMinutes > 0 ? '+' : ''}${mainException.deviationMinutes} min vs. plano` : 'Sem impacto conhecido na sequência.'}</p></> : <span>Nenhuma exceção neste turno.</span>}
          </div>
        </div>
        <div className={styles.dayTile}><span>Acumulado do dia</span><strong>{day.onPlan} / {day.total}</strong><Bar ratio={day.ratio} tone="positive" label={`Aderência do dia: ${Math.round(day.ratio * 100)}%`} /><em>{dayException ? `Principal desvio: ${dayException.resourceId} · ${classificationLabel[dayException.classification]}` : 'Sem desvios relevantes'}</em></div>
      </section>

      <section className={styles.shiftHistory} aria-label="Turnos concluídos hoje">
        <span>Turnos concluídos hoje</span>
        <div>{completedShifts.map((shift) => <div key={shift.shiftId} className={styles.shiftHistoryRow}>
          <b>{shift.shiftName}</b>
          {shift.total > 0 ? <><Bar ratio={shift.ratio} tone="positive" label={`${shift.shiftName}: ${Math.round(shift.ratio * 100)}% de aderência`} className={styles.historyBar} /><em>{shift.onPlan}/{shift.total} Lotes conformes · {Math.round(shift.ratio * 100)}%</em></> : <em>N/A · sem execução registrada</em>}
        </div>)}{completedShifts.length === 0 ? <p className={styles.empty}>Nenhum turno concluído ainda hoje.</p> : null}</div>
      </section>

      <section className={styles.resources} aria-labelledby="resources-title">
        <header><h2 id="resources-title">Situação das Máquinas</h2><p>DC01–DC05 · situação operacional e aderência · acumulado do dia</p></header>
        <div className={styles.machines}>
          {day.rows.map((row) => { const producedQuantity = confirmedQuantityByLotId[row.lot.id] ?? 0; const health = assessLotExecutionHealth(row.execution, producedQuantity, row.lot.scheduledStart, row.lot.scheduledFinish, idealCycleTimeSecondsByMaterialId[row.lot.materialId], currentTime); const operationalStatus = statusByLotId[row.lot.id]; return <button key={row.resourceId} className={styles.machineRow} data-tone={classificationTone[row.classification]} data-operational-status={operationalStatus?.status} onClick={() => setOpenRow(row)}>
            <span className={styles.machineIcon} aria-hidden="true">{classificationIcon[row.classification]}</span>
            <span className={styles.machineId}>{row.resourceId}</span>
            <span className={styles.machineStatus}><small>Lote {row.lot.lotNumber}</small><strong>{operationalStatus ? `${operationalStatusLabel[operationalStatus.status]} · ${adherenceQualifierLabel[operationalStatus.adherence]}` : classificationLabel[row.classification]}</strong></span>
            <LotHealthIndicator health={health} compact />
            <span className={styles.machineApq}>{row.deviationMinutes !== null ? `${row.deviationMinutes > 0 ? '+' : ''}${row.deviationMinutes} min vs. plano` : `${producedQuantity}/${row.execution.plannedQuantity}`}</span>
            {row.impact ? <em className={styles.machineNote}>Impacto: Lote {row.impact.impactedLot.lotNumber}</em> : null}
          </button>; })}
        </div>
      </section>

      <details className={styles.disclosure}>
        <summary>Planejado × Realizado <span>Ver linha do tempo</span></summary>
        <div className={monitoringStyles.timeline} data-testid="adherence-timeline">
          <div className={monitoringStyles.axisCorner}>Máquina</div>
          <div className={monitoringStyles.axis}>{[0, 3, 6, 9, 12, 15, 18, 21].map((hour) => <span key={hour} style={{ left: `${(hour / 24) * 100}%` }}>{String(hour).padStart(2, '0')}:00</span>)}</div>
          <div className={monitoringStyles.timeLine} style={{ left: `calc(8rem + (100% - 8rem) * ${currentPosition / 100})` }}><span>{formatTime(currentTime)}</span></div>
          <div className={monitoringStyles.lanes}>{day.rows.map((row) => { const { resourceId, lot, execution, classification, deviationMinutes } = row; const producedQuantity = confirmedQuantityByLotId[lot.id] ?? 0; const actualFinish = execution.actualFinish ?? (execution.status === 'NOT_STARTED' ? execution.scheduledStart : currentTime); return <section className={monitoringStyles.lane} key={resourceId} data-state={execution.status}>
            <button className={monitoringStyles.resource} onClick={() => setOpenRow(row)}><strong>{resourceId}</strong><span className={styles.badge} data-classification={classification}>{classificationLabel[classification]}</span><small>{producedQuantity}/{execution.plannedQuantity} · {Math.round(producedQuantity/execution.plannedQuantity*100)}%</small></button>
            <div className={monitoringStyles.tracks}>
              <div><span>PLANEJADO</span><button className={monitoringStyles.scheduled} style={{ left: `${timelinePosition(lot.scheduledStart, rangeStart, rangeFinish)}%`, width: `${timelineWidth(lot.scheduledStart, lot.scheduledFinish, rangeStart, rangeFinish)}%` }} onClick={() => setOpenRow(row)}>Lote {lot.lotNumber}</button></div>
              <div><span>REAL</span>{execution.status !== 'NOT_STARTED' ? <button className={monitoringStyles.actual} style={{ left: `${timelinePosition(execution.actualStart!, rangeStart, rangeFinish)}%`, width: `${timelineWidth(execution.actualStart!, actualFinish, rangeStart, rangeFinish)}%` }} onClick={() => setOpenRow(row)}>Lote {lot.lotNumber} · {deviationMinutes !== null ? `${deviationMinutes > 0 ? '+' : ''}${deviationMinutes} min` : classificationLabel[classification]}</button> : <span className={monitoringStyles.notStarted} style={{ left: `${timelinePosition(lot.scheduledStart, rangeStart, rangeFinish)}%` }}>Ainda não iniciado</span>}</div>
            </div>
          </section>; })}</div>
        </div>
      </details>
    </div>
    {openRow ? <AdherenceDialog row={openRow} operationalStatus={statusByLotId[openRow.lot.id]} events={events} idealCycleTimeSecondsByMaterialId={idealCycleTimeSecondsByMaterialId} confirmedQuantityByLotId={confirmedQuantityByLotId} currentTime={currentTime} onClose={() => setOpenRow(null)} /> : null}
  </OperationalWorkspace>;
}
