import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLiveScenarioTime } from '../../app/clock/applicationClock';
import { OperationalWorkspace } from '../../app/workspace/OperationalWorkspace';
import { computeFundicaoDcShiftOeeSummaries } from '../../demo/adapters/oeeSummaryAdapter';
import { computeFundicaoDcQualitySummary, computeFundicaoDcShiftQualitySummaries, type FundicaoDcQualityRow } from '../../demo/adapters/qualitySummaryAdapter';
import { selectProductionExecutions, selectProductionScheduling, selectScenarioDefinition, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { isValidQualityConfirmation, qualityRate, type QualityLossReason } from '../../domain/production-quality/models';
import { ScenarioResetControl } from '../../shared/operational/ScenarioResetControl';
import { Bar, StackedBar } from '../../shared/ui/Bar/Bar';
import { Button } from '../../shared/ui/Button/Button';
import { IconTip } from '../../shared/ui/IconTip/IconTip';
import { formatTime } from '../production-scheduling/productionSchedulingViewModel';
import monitoringStyles from '../production-monitoring/ProductionMonitoringPage.module.css';
import styles from './ProductionQualityPage.module.css';

const lossReasonLabel: Record<QualityLossReason, string> = { SCRAP: 'Sucateamento', PROCESS_DEFECT: 'Defeito de processo', DIMENSIONAL: 'Desvio dimensional', SURFACE: 'Defeito superficial', OTHER: 'Outro' };
const pct = (value: number | null) => value === null ? 'N/A' : `${Math.round(value * 100)}%`;
const shiftStatusLabel = { COMPLETED: 'CONCLUÍDO', IN_PROGRESS: 'EM ANDAMENTO', UPCOMING: 'AINDA NÃO INICIADO' } as const;

type Row = FundicaoDcQualityRow;

function machineAttention(row: Row): { icon: string; tone: 'attention' | 'positive' | 'neutral'; note: string | null } {
  if (!row.confirmation) return { icon: '○', tone: 'neutral', note: 'Aguardando produção' };
  if (row.confirmation.rejectQuantity > 0) return { icon: '⚠', tone: 'attention', note: `${row.confirmation.rejectQuantity} refugadas${row.confirmation.lossReason ? ` · ${lossReasonLabel[row.confirmation.lossReason]}` : ''}` };
  if (row.confirmation.reworkQuantity > 0) return { icon: '⚠', tone: 'attention', note: `${row.confirmation.reworkQuantity} em retrabalho` };
  return { icon: '✓', tone: 'positive', note: null };
}

function QualityDialog({ row, onClose }: { row: Row; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { close.current?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [onClose]);
  const { lot, confirmation, resourceId, foundation } = row;
  const rate = confirmation ? qualityRate(confirmation) : null;
  return createPortal(<div className={styles.modalLayer}><button className={styles.backdrop} aria-label="Fechar contexto" onClick={onClose} /><section role="dialog" aria-modal="true" aria-labelledby="quality-context-title" className={styles.modal}>
    <header><div><small>QUALIDADE &amp; DESEMPENHO</small><h2 id="quality-context-title">{resourceId} · Lote {lot.lotNumber}</h2></div><Button ref={close} aria-label="Fechar contexto de qualidade" onClick={onClose}>×</Button></header>
    {confirmation ? <>
      <StackedBar segments={[{ value: confirmation.goodQuantity, tone: 'positive', label: `Boas ${confirmation.goodQuantity}` }, { value: confirmation.rejectQuantity, tone: 'attention', label: `Refugo ${confirmation.rejectQuantity}` }, { value: confirmation.reworkQuantity, tone: 'neutral', label: `Retrabalho ${confirmation.reworkQuantity}` }]} />
      <dl>
        <div><dt>Produzido</dt><dd>{confirmation.producedQuantity}</dd></div>
        <div><dt>Boas</dt><dd>{confirmation.goodQuantity}</dd></div>
        <div><dt>Refugo</dt><dd>{confirmation.rejectQuantity}</dd></div>
        <div><dt>Retrabalho</dt><dd>{confirmation.reworkQuantity}</dd></div>
        <div><dt>Taxa de qualidade</dt><dd>{pct(rate)}</dd></div>
        <div><dt>Motivo da perda</dt><dd>{confirmation.lossReason ? lossReasonLabel[confirmation.lossReason] : 'Nenhuma perda registrada'}</dd></div>
        <div><dt>Tempo de ciclo padrão</dt><dd>{foundation.idealCycleTimeSeconds !== null ? `${foundation.idealCycleTimeSeconds}s · demonstrativo` : 'Não conhecido'}</dd></div>
        <div><dt>Tempo em produção conhecido</dt><dd>{foundation.runTimeMinutes !== null ? `${foundation.runTimeMinutes} min` : 'Não conhecido'}</dd></div>
      </dl>
    </> : <p>Lote ainda não produzido — nenhuma confirmação de qualidade demonstrativa disponível.</p>}
    <section aria-label="Desempenho"><h3>Desempenho</h3><p>{foundation.status === 'PREPARED' ? 'Desempenho preparado para cálculo (CAP-09)' : foundation.status === 'NOT_STARTED' ? 'Recurso ainda não iniciou produção' : 'Fatos insuficientes para preparar Desempenho'}</p></section>
    <small>Confirmado por {confirmation?.confirmedBy ?? '—'} · {confirmation ? formatTime(confirmation.confirmedAt) : '—'} · dados demonstrativos, BUSINESS VALIDATION REQUIRED</small>
  </section></div>, document.body);
}

export function ProductionQualityPage() {
  const definition = useScenarioStore(selectProductionScheduling);
  const scenario = useScenarioStore(selectScenarioDefinition);
  const executionsByLot = useScenarioStore(selectProductionExecutions);
  const [openRow, setOpenRow] = useState<Row | null>(null);
  const currentTime = useLiveScenarioTime(scenario?.currentScenarioTime);
  if (!definition || !scenario) return <p>Preparando qualidade demonstrativa…</p>;

  const day = computeFundicaoDcQualitySummary(definition, executionsByLot, currentTime);
  const shifts = computeFundicaoDcShiftQualitySummaries(definition, executionsByLot, currentTime);
  const oeeShifts = computeFundicaoDcShiftOeeSummaries(definition, executionsByLot, currentTime);
  const currentShift = shifts.find((shift) => shift.status === 'IN_PROGRESS') ?? shifts[shifts.length - 1];
  const currentShiftPerformance = oeeShifts.find((shift) => shift.shiftId === currentShift.shiftId)?.areaPerformance ?? null;
  const completedShifts = shifts.filter((shift) => shift.status === 'COMPLETED');
  const invariantsHold = day.rows.every((row) => !row.confirmation || isValidQualityConfirmation(row.confirmation));

  return <OperationalWorkspace perspective="QUALITY" sidebarContent={<div className={monitoringStyles.sidebar}><strong>Qualidade &amp; Desempenho</strong><IconTip icon="◷" label="Data de referência" value="15/05" tip="Data de referência · 15/05/2025" /><IconTip icon="⏱" label="Horário atual" value={formatTime(currentTime)} /><ScenarioResetControl /><IconTip icon="ⓘ" label="Confirmações demonstrativas" tip={`Confirmações demonstrativas · BUSINESS VALIDATION REQUIRED${!invariantsHold ? ' · INVARIANTE VIOLADA' : ''}`} /></div>}>
    <div className={styles.page}>
      <header className={styles.hero}>
        <div><span>Capability 08 · Core + Essencial</span><h1>Quanto produzimos e quanto foi bom?</h1></div>
        <aside><IconTip icon="⏱" label="Horário atual" value={formatTime(currentTime)} tip="Horário de referência do cenário · passado, agora e futuro" className={styles.currentTimeTip} /></aside>
      </header>

      <section className={styles.turnoRow} aria-label={`Qualidade do ${currentShift.shiftName} e acumulado do dia`}>
        <div className={styles.shiftHeadline}>
          <div className={styles.shiftBadge}><span data-status={currentShift.status}>{currentShift.shiftName.toUpperCase()} · {shiftStatusLabel[currentShift.status]}</span>{currentShift.status === 'IN_PROGRESS' ? <em>Parcial até {formatTime(currentTime)}</em> : null}</div>
          <StackedBar segments={[{ value: currentShift.good, tone: 'positive', label: `Boas ${currentShift.good}` }, { value: currentShift.reject, tone: 'attention', label: `Refugo ${currentShift.reject}` }, { value: currentShift.rework, tone: 'neutral', label: `Retrabalho ${currentShift.rework}` }]} className={styles.mainBar} />
          <div className={styles.summaryStrip}>
            <div><span>Produzido</span><strong>{currentShift.produced}</strong></div>
            <div><span>Boas</span><strong>{currentShift.good}</strong></div>
            <div data-state={currentShift.reject + currentShift.rework > 0 ? 'attention' : undefined}><span>Perdas</span><strong>{currentShift.reject + currentShift.rework}</strong></div>
            <div><span>Taxa de qualidade</span><strong>{pct(currentShift.qualityRate)}</strong></div>
          </div>
          {currentShiftPerformance !== null ? <div className={styles.performanceBlock}><span>Desempenho vs. Tempo de ciclo padrão (CAP-09)</span><Bar ratio={currentShiftPerformance} tone={currentShiftPerformance < 0.85 ? 'attention' : 'positive'} label={`Desempenho real ${pct(currentShiftPerformance)} do ritmo ideal`} /><small>Real {pct(currentShiftPerformance)} · Ideal 100%</small></div> : null}
        </div>
        <div className={styles.dayTile}><span>Acumulado do dia</span><strong>{pct(day.qualityRate)}</strong><StackedBar segments={[{ value: day.good, tone: 'positive', label: `Boas ${day.good}` }, { value: day.reject, tone: 'attention', label: `Refugo ${day.reject}` }, { value: day.rework, tone: 'neutral', label: `Retrabalho ${day.rework}` }]} /><em>{day.produced} peças · {day.losses[0] ? `Principal perda: ${day.losses[0].resourceId}` : 'Sem perdas relevantes'}</em></div>
      </section>

      <section className={styles.shiftHistory} aria-label="Turnos concluídos hoje">
        <span>Turnos concluídos hoje</span>
        <div>{completedShifts.map((shift) => <div key={shift.shiftId} className={styles.shiftHistoryRow}>
          <b>{shift.shiftName}</b>
          {shift.produced > 0 ? <><StackedBar segments={[{ value: shift.good, tone: 'positive', label: `Boas ${shift.good}` }, { value: shift.reject, tone: 'attention', label: `Refugo ${shift.reject}` }, { value: shift.rework, tone: 'neutral', label: `Retrabalho ${shift.rework}` }]} className={styles.historyBar} /><em>{shift.produced} peças · {shift.good} boas · Qualidade {pct(shift.qualityRate)}</em></> : <em>0 peças · sem execução registrada</em>}
        </div>)}{completedShifts.length === 0 ? <p className={styles.empty}>Nenhum turno concluído ainda hoje.</p> : null}</div>
      </section>

      <section className={styles.resources} aria-labelledby="resources-title">
        <header><h2 id="resources-title">Situação das Máquinas</h2><p>DC01–DC05 · Produzido/Boas/Refugo/Retrabalho · acumulado do dia</p></header>
        <div className={styles.machines}>
          {day.rows.map((row) => { const attention = machineAttention(row); const rate = row.confirmation ? qualityRate(row.confirmation) : null; return <button key={row.resourceId} className={styles.machineRow} data-tone={attention.tone} onClick={() => setOpenRow(row)}>
            <span className={styles.machineIcon} aria-hidden="true">{attention.icon}</span>
            <span className={styles.machineId}>{row.resourceId}</span>
            <span className={styles.machineStatus}><small>Lote {row.lot.lotNumber}</small><strong>{row.confirmation ? pct(rate) : 'Aguardando'}</strong></span>
            <span className={styles.machineApq}>{row.confirmation ? `${row.confirmation.producedQuantity} produzidas · ${row.confirmation.goodQuantity} boas` : 'Sem confirmação'}</span>
            {attention.note ? <em className={styles.machineNote}>{attention.note}</em> : null}
          </button>; })}
        </div>
      </section>

      <details className={styles.disclosure}>
        <summary>Como isso prepara o OEE? <span>Ver detalhes</span></summary>
        <div className={styles.oeeChainWrap}><div className={monitoringStyles.oeeChain}>
          <strong>Fatos de disponibilidade</strong><span>PARCIAL (CAP-07)</span>
          <strong>Fatos de desempenho · {day.preparedCount}/5 preparados</strong><span>PARCIAL</span>
          <strong>Fatos de qualidade · {day.rows.filter((row) => row.confirmation).length}/5 confirmados</strong><span>{day.rows.some((row) => row.confirmation) ? 'PRONTO' : 'PARCIAL'}</span>
        </div></div>
      </details>
    </div>
    {openRow ? <QualityDialog row={openRow} onClose={() => setOpenRow(null)} /> : null}
  </OperationalWorkspace>;
}
