import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLiveScenarioTime } from '../../app/clock/applicationClock';
import { OperationalWorkspace } from '../../app/workspace/OperationalWorkspace';
import { computeFundicaoDcShiftOeeSummaries } from '../../demo/adapters/oeeSummaryAdapter';
import { computeFundicaoDcQualitySummary, computeFundicaoDcShiftQualitySummaries, type FundicaoDcQualityRow } from '../../demo/adapters/qualitySummaryAdapter';
import { idealCycleTimeSecondsForScenario } from '../../demo/scenario-engine/scenarioFixtures';
import { selectAllQualityConfirmations, selectProductionConfirmations, selectProductionExecutions, selectProductionScheduling, selectScenarioDefinition, selectSessionClock, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { qualityRate, qualityReasonLabel, validateQualityIncrement, type QualityReasonCode } from '../../domain/production-quality/models';
import { ScenarioResetControl } from '../../shared/operational/ScenarioResetControl';
import { Bar, StackedBar } from '../../shared/ui/Bar/Bar';
import { Button } from '../../shared/ui/Button/Button';
import { IconTip } from '../../shared/ui/IconTip/IconTip';
import { formatTime } from '../production-scheduling/productionSchedulingViewModel';
import monitoringStyles from '../production-monitoring/ProductionMonitoringPage.module.css';
import styles from './ProductionQualityPage.module.css';

const pct = (value: number | null) => value === null ? 'N/A' : `${Math.round(value * 100)}%`;
const shiftStatusLabel = { COMPLETED: 'CONCLUÍDO', IN_PROGRESS: 'EM ANDAMENTO', UPCOMING: 'AINDA NÃO INICIADO' } as const;
const reasonChoices = Object.entries(qualityReasonLabel) as [QualityReasonCode, string][];

type Row = FundicaoDcQualityRow;

function machineAttention(row: Row): { icon: string; tone: 'attention' | 'positive' | 'neutral'; note: string | null } {
  if (row.producedQuantity === 0) return { icon: '○', tone: 'neutral', note: 'Aguardando produção' };
  if (row.quality.reject > 0) return { icon: '⚠', tone: 'attention', note: `${row.quality.reject} rejeitadas` };
  if (row.pending > 0) return { icon: '○', tone: 'neutral', note: `${row.pending} pendentes de classificação` };
  return { icon: '✓', tone: 'positive', note: null };
}

/**
 * Capability 09 — never re-asks Produzido (already known from Production
 * Confirmations, Capability 06). Only the Pending Classification balance is
 * editable here, and the increment can never exceed it (Section 3/8).
 */
function QualityDialog({ row, onClose, onConfirmQuality }: { row: Row; onClose: () => void; onConfirmQuality: (good: number, reject: number, reasonCode?: QualityReasonCode) => void }) {
  const close = useRef<HTMLButtonElement>(null);
  const [registering, setRegistering] = useState(false);
  const [goodInput, setGoodInput] = useState('');
  const [rejectInput, setRejectInput] = useState('');
  const [reasonCode, setReasonCode] = useState<QualityReasonCode>(reasonChoices[0][0]);
  useEffect(() => { close.current?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [onClose]);
  useEffect(() => { setRegistering(false); setGoodInput(''); setRejectInput(''); }, [row.lot.id]);
  const { lot, quality, classified, pending, producedQuantity, confirmations, foundation } = row;
  const rate = qualityRate(quality.good, classified);
  const goodValue = Number(goodInput || 0);
  const rejectValue = Number(rejectInput || 0);
  const hasInput = goodInput.trim() !== '' || rejectInput.trim() !== '';
  const rejection = hasInput ? validateQualityIncrement({ goodIncrement: goodValue, rejectIncrement: rejectValue, pendingQuantity: pending, reasonCode: rejectValue > 0 ? reasonCode : undefined }) : null;
  const rejectionMessage = rejection?.kind === 'EXCEEDS_PENDING' ? `Existem apenas ${rejection.pending} peças pendentes de classificação.`
    : rejection?.kind === 'MUST_BE_INTEGER' ? 'Quantidade deve ser um número inteiro.'
    : rejection?.kind === 'NEGATIVE_QUANTITY' ? 'Quantidade não pode ser negativa.'
    : rejection?.kind === 'REQUIRES_POSITIVE_TOTAL' ? 'Informe ao menos uma peça boa ou rejeitada.'
    : rejection?.kind === 'REQUIRES_REASON' ? 'Selecione o motivo da rejeição.'
    : null;
  const previewClassified = hasInput && !rejection ? classified + goodValue + rejectValue : classified;
  const previewPending = Math.max(0, producedQuantity - previewClassified);
  const confirm = () => { if (!hasInput || rejection) return; onConfirmQuality(goodValue, rejectValue, rejectValue > 0 ? reasonCode : undefined); setGoodInput(''); setRejectInput(''); setRegistering(false); };
  return createPortal(<div className={styles.modalLayer}><button className={styles.backdrop} aria-label="Fechar contexto" onClick={onClose} /><section role="dialog" aria-modal="true" aria-labelledby="quality-context-title" className={styles.modal}>
    <header><div><small>QUALIDADE &amp; DESEMPENHO</small><h2 id="quality-context-title">{row.resourceId} · Lote {lot.lotNumber}</h2></div><Button ref={close} aria-label="Fechar contexto de qualidade" onClick={onClose}>×</Button></header>
    {producedQuantity > 0 ? <>
      <StackedBar segments={[{ value: quality.good, tone: 'positive', label: `Boas ${quality.good}` }, { value: quality.reject, tone: 'attention', label: `Rejeitadas ${quality.reject}` }, { value: quality.rework, tone: 'neutral', label: `Retrabalho ${quality.rework}` }, { value: pending, tone: 'neutral', label: `Pendente ${pending}` }]} />
      <dl>
        <div><dt>Produção confirmada</dt><dd>{producedQuantity}</dd></div>
        <div><dt>Classificado</dt><dd>{classified}</dd></div>
        <div><dt>Pendente de classificação</dt><dd>{pending}</dd></div>
        <div><dt>Boas</dt><dd>{quality.good}</dd></div>
        <div><dt>Rejeitadas</dt><dd>{quality.reject}</dd></div>
        <div><dt>Taxa de qualidade</dt><dd>{pct(rate)}</dd></div>
        <div><dt>Tempo de ciclo padrão</dt><dd>{foundation.idealCycleTimeSeconds !== null ? `${foundation.idealCycleTimeSeconds}s · demonstrativo` : 'Não conhecido'}</dd></div>
        <div><dt>Tempo em produção conhecido</dt><dd>{foundation.runTimeMinutes !== null ? `${foundation.runTimeMinutes} min` : 'Não conhecido'}</dd></div>
      </dl>
      <section aria-label="Registrar qualidade" className={styles.qualityControl}>
        <h3>Registrar qualidade</h3>
        {pending === 0 ? <p className={styles.sectionNote}>Classificação completa — não há saldo pendente.</p> : registering ? <div className={styles.confirmationForm}>
          <label>Boas<input type="number" step="1" min="0" value={goodInput} onChange={(event) => setGoodInput(event.target.value)} aria-label={`Peças boas na ${row.resourceId}`} autoFocus /></label>
          <label>Rejeitadas<input type="number" step="1" min="0" value={rejectInput} onChange={(event) => setRejectInput(event.target.value)} aria-label={`Peças rejeitadas na ${row.resourceId}`} /></label>
          {rejectValue > 0 ? <label>Motivo da rejeição<select aria-label={`Motivo da rejeição na ${row.resourceId}`} value={reasonCode} onChange={(event) => setReasonCode(event.target.value as QualityReasonCode)}>{reasonChoices.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label> : null}
          {rejectionMessage ? <p className={styles.confirmationError} role="alert">{rejectionMessage}</p> : <p className={styles.sectionNote}>Após confirmar: Classificado {previewClassified} · Pendente {previewPending}</p>}
          <div className={styles.executionActions}><Button onClick={confirm} disabled={!hasInput || Boolean(rejection)}>Confirmar</Button><Button onClick={() => { setRegistering(false); setGoodInput(''); setRejectInput(''); }}>Cancelar</Button></div>
        </div> : <div className={styles.executionActions}><Button onClick={() => setRegistering(true)}>Registrar qualidade</Button></div>}
      </section>
      {confirmations.length ? <details className={styles.confirmationHistory}><summary>Histórico de qualidade</summary><ul>{[...confirmations].reverse().map((confirmation) => <li key={confirmation.id}>{formatTime(confirmation.confirmedAt)} · +{confirmation.goodQuantity} boas{confirmation.rejectQuantity > 0 ? ` · +${confirmation.rejectQuantity} rejeitadas${confirmation.reasonCode ? ` · ${qualityReasonLabel[confirmation.reasonCode]}` : ''}` : ''} · {confirmation.operator ?? '—'}</li>)}</ul></details> : null}
    </> : <p>Lote ainda não produzido — nenhuma confirmação de qualidade disponível.</p>}
    <section aria-label="Desempenho"><h3>Desempenho</h3><p>{foundation.status === 'PREPARED' ? 'Desempenho preparado para cálculo (CAP-09)' : foundation.status === 'NOT_STARTED' ? 'Máquina ainda não iniciou produção' : 'Fatos insuficientes para preparar Desempenho'}</p></section>
    <small>Produzido nunca muda ao registrar qualidade — apenas o saldo pendente é classificado. Dados demonstrativos, requerem validação de negócio.</small>
  </section></div>, document.body);
}

export function ProductionQualityPage() {
  const definition = useScenarioStore(selectProductionScheduling);
  const scenario = useScenarioStore(selectScenarioDefinition);
  const executionsByLot = useScenarioStore(selectProductionExecutions);
  const productionConfirmationsByLot = useScenarioStore(selectProductionConfirmations);
  const qualityConfirmations = useScenarioStore(selectAllQualityConfirmations);
  const confirmQuality = useScenarioStore((state) => state.confirmQuality);
  const [openLotId, setOpenLotId] = useState<string | null>(null);
  const sessionClock = useScenarioStore(selectSessionClock);
  const currentTime = useLiveScenarioTime(sessionClock ?? scenario?.currentScenarioTime);
  const idealCycleTimeSecondsByMaterialId = idealCycleTimeSecondsForScenario(scenario?.id);
  if (!definition || !scenario) return <p>Preparando qualidade demonstrativa…</p>;
  const businessDate = currentTime.slice(0, 10);
  const productionConfirmations = Object.values(productionConfirmationsByLot).flat();

  const day = computeFundicaoDcQualitySummary(definition, executionsByLot, currentTime, qualityConfirmations, idealCycleTimeSecondsByMaterialId, productionConfirmations);
  const shifts = computeFundicaoDcShiftQualitySummaries(definition, executionsByLot, currentTime, qualityConfirmations, idealCycleTimeSecondsByMaterialId, productionConfirmations);
  const oeeShifts = computeFundicaoDcShiftOeeSummaries(definition, executionsByLot, currentTime, qualityConfirmations, idealCycleTimeSecondsByMaterialId, productionConfirmations);
  const currentShift = shifts.find((shift) => shift.status === 'IN_PROGRESS') ?? shifts[shifts.length - 1];
  const currentShiftPerformance = oeeShifts.find((shift) => shift.shiftId === currentShift.shiftId)?.areaPerformance ?? null;
  const completedShifts = shifts.filter((shift) => shift.status === 'COMPLETED');
  const openRow = openLotId ? day.rows.find((row) => row.lot.id === openLotId) : undefined;

  return <OperationalWorkspace perspective="QUALITY" sidebarContent={<div className={monitoringStyles.sidebar}><strong>Qualidade &amp; Desempenho</strong><IconTip icon="◷" label="Data de referência" value={`${businessDate.slice(8, 10)}/${businessDate.slice(5, 7)}`} tip={`Data de referência · ${businessDate}`} /><IconTip icon="⏱" label="Horário atual" value={formatTime(currentTime)} /><ScenarioResetControl /><IconTip icon="ⓘ" label="Confirmações demonstrativas" tip="Confirmações demonstrativas · requer validação de negócio" /></div>}>
    <div className={styles.page}>
      <header className={styles.hero}>
        <div><span>Capacidade 09 · Núcleo + Essencial</span><h1>Do que produzimos, quanto está conforme e quanto perdemos por qualidade?</h1></div>
        <aside><IconTip icon="⏱" label="Horário atual" value={formatTime(currentTime)} tip="Horário de referência do cenário · passado, agora e futuro" className={styles.currentTimeTip} /></aside>
      </header>

      <section className={styles.turnoRow} aria-label={`Qualidade do ${currentShift.shiftName} e acumulado do dia`}>
        <div className={styles.shiftHeadline}>
          <div className={styles.shiftBadge}><span data-status={currentShift.status}>{currentShift.shiftName.toUpperCase()} · {shiftStatusLabel[currentShift.status]}</span>{currentShift.status === 'IN_PROGRESS' ? <em>Parcial até {formatTime(currentTime)}</em> : null}</div>
          <StackedBar segments={[{ value: currentShift.good, tone: 'positive', label: `Boas ${currentShift.good}` }, { value: currentShift.reject, tone: 'attention', label: `Rejeitadas ${currentShift.reject}` }, { value: currentShift.rework, tone: 'neutral', label: `Retrabalho ${currentShift.rework}` }, { value: currentShift.pending, tone: 'neutral', label: `Pendente ${currentShift.pending}` }]} className={styles.mainBar} />
          <div className={styles.summaryStrip}>
            <div><span>Produzido</span><strong>{currentShift.produced}</strong></div>
            <div><span>Classificado</span><strong>{currentShift.classified}</strong></div>
            <div><span>Pendente</span><strong>{currentShift.pending}</strong></div>
            <div><span>Boas</span><strong>{currentShift.good}</strong></div>
            <div data-state={currentShift.reject > 0 ? 'attention' : undefined}><span>Rejeitadas</span><strong>{currentShift.reject}</strong></div>
            <div><span>Taxa de qualidade</span><strong>{pct(currentShift.qualityRate)}</strong></div>
          </div>
          {currentShiftPerformance !== null ? <div className={styles.performanceBlock}><span>Desempenho vs. Tempo de ciclo padrão (CAP-09)</span><Bar ratio={currentShiftPerformance} tone={currentShiftPerformance < 0.85 ? 'attention' : 'positive'} label={`Desempenho real ${pct(currentShiftPerformance)} do ritmo ideal`} /><small>Real {pct(currentShiftPerformance)} · Ideal 100%</small></div> : null}
        </div>
        <div className={styles.dayTile}><span>Acumulado do dia</span><strong>{pct(day.qualityRate)}</strong><StackedBar segments={[{ value: day.good, tone: 'positive', label: `Boas ${day.good}` }, { value: day.reject, tone: 'attention', label: `Rejeitadas ${day.reject}` }, { value: day.rework, tone: 'neutral', label: `Retrabalho ${day.rework}` }, { value: day.pending, tone: 'neutral', label: `Pendente ${day.pending}` }]} /><em>{day.produced} peças · {day.losses[0] ? `Principal perda: ${day.losses[0].resourceId}` : 'Sem perdas relevantes'}</em></div>
      </section>

      <section className={styles.shiftHistory} aria-label="Turnos concluídos hoje">
        <span>Turnos concluídos hoje</span>
        <div>{completedShifts.map((shift) => <div key={shift.shiftId} className={styles.shiftHistoryRow}>
          <b>{shift.shiftName}</b>
          {shift.produced > 0 ? <><StackedBar segments={[{ value: shift.good, tone: 'positive', label: `Boas ${shift.good}` }, { value: shift.reject, tone: 'attention', label: `Rejeitadas ${shift.reject}` }, { value: shift.rework, tone: 'neutral', label: `Retrabalho ${shift.rework}` }, { value: shift.pending, tone: 'neutral', label: `Pendente ${shift.pending}` }]} className={styles.historyBar} /><em>{shift.produced} peças · {shift.good} boas · Qualidade {pct(shift.qualityRate)}</em></> : <em>0 peças · sem execução registrada</em>}
        </div>)}{completedShifts.length === 0 ? <p className={styles.empty}>Nenhum turno concluído ainda hoje.</p> : null}</div>
      </section>

      <section className={styles.resources} aria-labelledby="resources-title">
        <header><h2 id="resources-title">Situação das Máquinas</h2><p>DC01–DC05 · Produzido/Boas/Rejeitadas/Pendente · acumulado do dia</p></header>
        <div className={styles.machines}>
          {day.rows.map((row) => { const attention = machineAttention(row); const rate = row.classified > 0 ? qualityRate(row.quality.good, row.classified) : null; return <button key={row.resourceId} className={styles.machineRow} data-tone={attention.tone} onClick={() => setOpenLotId(row.lot.id)}>
            <span className={styles.machineIcon} aria-hidden="true">{attention.icon}</span>
            <span className={styles.machineId}>{row.resourceId}</span>
            <span className={styles.machineStatus}><small>Lote {row.lot.lotNumber}</small><strong>{row.classified > 0 ? pct(rate) : 'Aguardando'}</strong></span>
            <span className={styles.machineApq}>{row.producedQuantity > 0 ? `${row.producedQuantity} produzidas · ${row.quality.good} boas` : 'Sem confirmação'}</span>
            {attention.note ? <em className={styles.machineNote}>{attention.note}</em> : null}
          </button>; })}
        </div>
      </section>

      <details className={styles.disclosure}>
        <summary>Como isso prepara o OEE? <span>Ver detalhes</span></summary>
        <div className={styles.oeeChainWrap}><div className={monitoringStyles.oeeChain}>
          <strong>Fatos de disponibilidade</strong><span>Eventos governados (CAP-08)</span>
          <strong>Fatos de desempenho · {day.preparedCount}/5 preparados</strong><span>PARCIAL</span>
          <strong>Fatos de qualidade · {day.rows.filter((row) => row.classified > 0).length}/5 classificados</strong><span>{day.rows.some((row) => row.classified > 0) ? 'PRONTO' : 'PARCIAL'}</span>
        </div></div>
      </details>
    </div>
    {openRow ? <QualityDialog row={openRow} onClose={() => setOpenLotId(null)} onConfirmQuality={(good, reject, reasonCode) => confirmQuality(openRow.lot.id, good, reject, reasonCode)} /> : null}
  </OperationalWorkspace>;
}
