import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLiveScenarioTime } from '../../app/clock/applicationClock';
import { withBase } from '../../app/routing/basePath';
import { OperationalWorkspace } from '../../app/workspace/OperationalWorkspace';
import { computeFundicaoDcOeeSummary, computeFundicaoDcShiftOeeSummaries, type FundicaoDcOeeRow } from '../../demo/adapters/oeeSummaryAdapter';
import { fundicaoDcProductionEventsFixture } from '../../demo/fixtures/fundicaoDcProductionEvents';
import { fundicaoDcQualityConfirmationsFixture } from '../../demo/fixtures/fundicaoDcQualityConfirmations';
import { selectProductionExecutions, selectProductionScheduling, selectScenarioDefinition, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import type { OeeDimension } from '../../domain/oee/calculations';
import type { FoundryResourceId } from '../../domain/resource/models';
import { ScenarioResetControl } from '../../shared/operational/ScenarioResetControl';
import { Button } from '../../shared/ui/Button/Button';
import { IconTip } from '../../shared/ui/IconTip/IconTip';
import { formatTime } from '../production-scheduling/productionSchedulingViewModel';
import monitoringStyles from '../production-monitoring/ProductionMonitoringPage.module.css';
import styles from './OeePage.module.css';

const dimensionIcon: Record<OeeDimension, string> = { AVAILABILITY: '⏱', PERFORMANCE: '⚡', QUALITY: '◆' };

const dimensionLabel: Record<OeeDimension, string> = { AVAILABILITY: 'Disponibilidade', PERFORMANCE: 'Desempenho', QUALITY: 'Qualidade' };
const lossReasonLabel: Record<string, string> = { SCRAP: 'Sucateamento', PROCESS_DEFECT: 'Defeito de processo', DIMENSIONAL: 'Desvio dimensional', SURFACE: 'Defeito superficial', OTHER: 'Outro' };
const eventTypeLabel: Record<string, string> = { MATERIAL: 'Falta de material', MACHINE_ADJUSTMENT: 'Ajuste de máquina', TOOLING: 'Ferramental', QUALITY: 'Qualidade', OTHER: 'Evento' };
const pct = (value: number | null) => value === null ? 'N/A' : `${Math.round(value * 100)}%`;

type Row = FundicaoDcOeeRow;
type Focus = { kind: 'DIMENSION'; dimension: OeeDimension; rows: readonly Row[]; scopeLabel: string } | { kind: 'RESOURCE'; resourceId: FoundryResourceId };

function rowAttention(row: Row, impacts: readonly { dimension: OeeDimension; resourceId: FoundryResourceId }[]): { icon: string; tone: 'attention' | 'positive' | 'neutral'; note: string | null } {
  if (row.oee === null) return { icon: '○', tone: 'neutral', note: 'Aguardando produção' };
  const activeEvent = fundicaoDcProductionEventsFixture.find((event) => event.resourceId === row.resourceId && event.status === 'ACTIVE');
  if (activeEvent) return { icon: '⚠', tone: 'attention', note: `${eventTypeLabel[activeEvent.eventType]} ativo` };
  const impact = impacts.find((item) => item.resourceId === row.resourceId);
  if (impact) return { icon: dimensionIcon[impact.dimension], tone: 'attention', note: `Principal atenção: ${dimensionLabel[impact.dimension]}` };
  return { icon: '✓', tone: 'positive', note: null };
}

function impactEvidence(row: Row, dimension: OeeDimension): string {
  if (dimension === 'AVAILABILITY') {
    const event = fundicaoDcProductionEventsFixture.find((item) => item.lotId === row.lot.id);
    const downtime = row.plannedTimeMinutes !== null && row.runTimeMinutes !== null ? row.plannedTimeMinutes - row.runTimeMinutes : null;
    return event ? `${event.status === 'ACTIVE' ? 'Parada ativa' : 'Parada registrada'} · ${downtime !== null ? `${downtime} min de tempo não produtivo conhecido` : 'duração não calculável'}` : `${downtime ?? '—'} min de tempo não produtivo conhecido`;
  }
  if (dimension === 'PERFORMANCE') return `Ritmo observado abaixo do Tempo de ciclo padrão (${row.idealCycleTimeSeconds ?? '—'}s/peça, ${row.producedQuantity} peças em ${row.runTimeMinutes ?? '—'} min de Tempo em produção)`;
  const confirmation = fundicaoDcQualityConfirmationsFixture.find((item) => item.lotId === row.lot.id);
  const lossQty = (confirmation?.rejectQuantity ?? 0) + (confirmation?.reworkQuantity ?? 0);
  return `${lossQty} peças em refugo/retrabalho${confirmation?.lossReason ? ` · ${lossReasonLabel[confirmation.lossReason]}` : ''}`;
}

function FocusDialog({ focus, rows, currentTime, onClose }: { focus: Focus; rows: readonly Row[]; currentTime: string; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { close.current?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [onClose]);

  if (focus.kind === 'DIMENSION') {
    const title = dimensionLabel[focus.dimension];
    return createPortal(<div className={styles.modalLayer}><button className={styles.backdrop} aria-label="Fechar contexto" onClick={onClose} /><section role="dialog" aria-modal="true" aria-labelledby="oee-dimension-title" className={styles.modal}>
      <header><div><small>OEE · {title.toUpperCase()} · {focus.scopeLabel}</small><h2 id="oee-dimension-title">{title} por máquina</h2></div><Button ref={close} aria-label="Fechar contexto de OEE" onClick={onClose}>×</Button></header>
      {focus.rows.length === 0 ? <p>Nenhuma máquina com fatos neste recorte.</p> : <div className={styles.breakdown}>{focus.rows.map((row) => <div key={row.resourceId} className={styles.breakdownRow}>
        <strong>{row.resourceId}</strong>
        {focus.dimension === 'AVAILABILITY' ? <><span>Planejado {row.plannedTimeMinutes ?? '—'} min</span><span>Tempo em produção {row.runTimeMinutes ?? '—'} min</span><span>Tempo parado {row.plannedTimeMinutes !== null && row.runTimeMinutes !== null ? `${row.plannedTimeMinutes - row.runTimeMinutes} min` : '—'}</span></> : null}
        {focus.dimension === 'PERFORMANCE' ? <><span>Ciclo padrão {row.idealCycleTimeSeconds ?? '—'}s</span><span>Produzido {row.producedQuantity}</span><span>Tempo em produção {row.runTimeMinutes ?? '—'} min</span></> : null}
        {focus.dimension === 'QUALITY' ? <><span>Produzido {row.producedQuantity}</span><span>Boas {row.goodQuantity ?? '—'}</span></> : null}
        <b>{pct(focus.dimension === 'AVAILABILITY' ? row.availability : focus.dimension === 'PERFORMANCE' ? row.performance : row.quality)}</b>
      </div>)}</div>}
      <small>Fórmula demonstrativa · requer validação de negócio</small>
    </section></div>, document.body);
  }

  const row = rows.find((item) => item.resourceId === focus.resourceId)!;
  return createPortal(<div className={styles.modalLayer}><button className={styles.backdrop} aria-label="Fechar contexto" onClick={onClose} /><section role="dialog" aria-modal="true" aria-labelledby="oee-resource-title" className={styles.modal}>
    <header><div><small>OEE · RECURSO</small><h2 id="oee-resource-title">{row.resourceId} · Lote {row.lot.lotNumber}</h2></div><Button ref={close} aria-label="Fechar contexto de OEE" onClick={onClose}>×</Button></header>
    <dl>
      <div><dt>Disponibilidade</dt><dd>{pct(row.availability)}</dd></div>
      <div><dt>Desempenho</dt><dd>{pct(row.performance)}</dd></div>
      <div><dt>Qualidade</dt><dd>{pct(row.quality)}</dd></div>
      <div><dt>OEE</dt><dd>{pct(row.oee)}</dd></div>
      <div><dt>Tempo de produção planejado</dt><dd>{row.plannedTimeMinutes !== null ? `${row.plannedTimeMinutes} min` : 'N/A'}</dd></div>
      <div><dt>Tempo em produção</dt><dd>{row.runTimeMinutes !== null ? `${row.runTimeMinutes} min` : 'N/A'}</dd></div>
      <div><dt>Tempo de ciclo padrão</dt><dd>{row.idealCycleTimeSeconds !== null ? `${row.idealCycleTimeSeconds}s` : 'Não conhecido'}</dd></div>
      <div><dt>Produzido / Boas</dt><dd>{row.producedQuantity} / {row.goodQuantity ?? '—'}</dd></div>
    </dl>
    <small>Rastreável a Fatos de execução (CAP-05), Eventos (CAP-06), Desvios (CAP-07) e Confirmação de Qualidade (CAP-08) · Horário atual {formatTime(currentTime)}</small>
  </section></div>, document.body);
}

const shiftStatusLabel = { COMPLETED: 'CONCLUÍDO', IN_PROGRESS: 'EM ANDAMENTO', UPCOMING: 'AINDA NÃO INICIADO' } as const;

export function OeePage() {
  const definition = useScenarioStore(selectProductionScheduling);
  const scenario = useScenarioStore(selectScenarioDefinition);
  const executionsByLot = useScenarioStore(selectProductionExecutions);
  const [focus, setFocus] = useState<Focus | null>(null);
  const currentTime = useLiveScenarioTime(scenario?.currentScenarioTime);
  if (!definition || !scenario) return <p>Preparando OEE demonstrativo…</p>;

  const day = computeFundicaoDcOeeSummary(definition, executionsByLot, currentTime);
  const shifts = computeFundicaoDcShiftOeeSummaries(definition, executionsByLot, currentTime);
  const currentShift = shifts.find((shift) => shift.status === 'IN_PROGRESS') ?? shifts[shifts.length - 1];
  const completedShifts = shifts.filter((shift) => shift.status === 'COMPLETED');
  const { rows, mainImpact: dayMainImpact } = day;
  const shiftMainImpactRow = currentShift.mainImpact ? currentShift.rows.find((row) => row.resourceId === currentShift.mainImpact!.resourceId) : undefined;

  return <OperationalWorkspace perspective="OEE" sidebarContent={<div className={monitoringStyles.sidebar}><strong>OEE</strong><IconTip icon="◷" label="Data de referência" value="15/05" tip="Data de referência · 15/05/2025" /><IconTip icon="⏱" label="Horário atual" value={formatTime(currentTime)} /><ScenarioResetControl /><IconTip icon="ⓘ" label="Fórmula demonstrativa" tip="Fórmula demonstrativa · requer validação de negócio" /></div>}>
    <div className={styles.page}>
      <header className={styles.hero}>
        <div><span>Capacidade 09 · OEE</span><h1>Como estamos performando e por quê?</h1></div>
        <aside><IconTip icon="⏱" label="Horário atual" value={formatTime(currentTime)} tip="Horário de referência do cenário · passado, agora e futuro" className={styles.currentTimeTip} /></aside>
      </header>

      <section className={styles.turnoRow} aria-label={`OEE do ${currentShift.shiftName} e acumulado do dia`}>
        <div className={styles.shiftHeadline}>
          <div className={styles.shiftBadge}><span data-status={currentShift.status}>{currentShift.shiftName.toUpperCase()} · {shiftStatusLabel[currentShift.status]}</span>{currentShift.status === 'IN_PROGRESS' ? <em>Parcial até {formatTime(currentTime)}</em> : null}</div>
          <div className={styles.headline}>
            <div className={styles.oeeTile}><span>OEE</span><strong>{pct(currentShift.areaOee)}</strong></div>
            <button className={styles.dimTile} onClick={() => setFocus({ kind: 'DIMENSION', dimension: 'AVAILABILITY', rows: currentShift.rows, scopeLabel: currentShift.shiftName.toUpperCase() })}><span className={styles.btnHead}><span aria-hidden="true">{dimensionIcon.AVAILABILITY}</span>Disponibilidade</span><strong>{pct(currentShift.areaAvailability)}</strong></button>
            <button className={styles.dimTile} onClick={() => setFocus({ kind: 'DIMENSION', dimension: 'PERFORMANCE', rows: currentShift.rows, scopeLabel: currentShift.shiftName.toUpperCase() })}><span className={styles.btnHead}><span aria-hidden="true">{dimensionIcon.PERFORMANCE}</span>Desempenho</span><strong>{pct(currentShift.areaPerformance)}</strong></button>
            <button className={styles.dimTile} onClick={() => setFocus({ kind: 'DIMENSION', dimension: 'QUALITY', rows: currentShift.rows, scopeLabel: currentShift.shiftName.toUpperCase() })}><span className={styles.btnHead}><span aria-hidden="true">{dimensionIcon.QUALITY}</span>Qualidade</span><strong>{pct(currentShift.areaQuality)}</strong></button>
          </div>
          <div className={styles.mainImpact}>
            {currentShift.mainImpact && shiftMainImpactRow ? <><span>Maior perda do turno</span><strong>{dimensionLabel[currentShift.mainImpact.dimension]} é o maior fator de redução do OEE</strong><p>{shiftMainImpactRow.resourceId} · Lote {shiftMainImpactRow.lot.lotNumber} · {impactEvidence(shiftMainImpactRow, currentShift.mainImpact.dimension)}</p></> : <span>Nenhuma perda relevante identificada neste turno.</span>}
          </div>
        </div>
        <div className={styles.dayTile}><span>Acumulado do dia</span><strong>{pct(day.areaOee)}</strong><small>A {pct(day.areaAvailability)} · P {pct(day.areaPerformance)} · Q {pct(day.areaQuality)}</small><em>{dayMainImpact ? `Maior perda do dia: ${dimensionLabel[dayMainImpact.dimension]}` : 'Sem perda relevante'}</em></div>
      </section>

      <section className={styles.shiftHistory} aria-label="Turnos concluídos hoje">
        <span>Turnos concluídos hoje</span>
        <div>{completedShifts.map((shift) => { const produced = shift.rows.reduce((sum, row) => sum + row.producedQuantity, 0); return <div key={shift.shiftId} className={styles.shiftHistoryRow}>
          <b>{shift.shiftName}</b><span>{produced} peças</span>
          {shift.areaOee === null ? <em>OEE N/A · sem execução registrada</em> : <em>OEE {pct(shift.areaOee)}{shift.mainImpact ? ` · Maior perda: ${dimensionLabel[shift.mainImpact.dimension]}` : ''}</em>}
        </div>; })}</div>
      </section>

      <p className={styles.businessQuestion}><b>Conseguiremos sustentar a necessidade da Montagem hoje?</b> Condição atual: {dayMainImpact ? `${dimensionLabel[dayMainImpact.dimension]} é o fator que mais limita o ritmo da Fundição no dia — ` : ''}avaliar buffer e prioridade de atendimento à Montagem com base nos fatos capturados até {formatTime(currentTime)}.</p>

      <section className={styles.resources} aria-labelledby="resources-title">
        <header><h2 id="resources-title">Situação das Máquinas</h2><p>DC01–DC05 · Disponibilidade · Desempenho · Qualidade · OEE · acumulado do dia</p></header>
        <div className={styles.machines}>
          {rows.map((row) => { const attention = rowAttention(row, day.impacts); return <button key={row.resourceId} className={styles.machineRow} data-tone={attention.tone} onClick={() => setFocus({ kind: 'RESOURCE', resourceId: row.resourceId })}>
            <span className={styles.machineIcon} aria-hidden="true">{attention.icon}</span>
            <span className={styles.machineId}>{row.resourceId}</span>
            <span className={styles.machineOee}><small>OEE</small><strong>{pct(row.oee)}</strong></span>
            <span className={styles.machineApq}>A {pct(row.availability)} · P {pct(row.performance)} · Q {pct(row.quality)}</span>
            {attention.note ? <em className={styles.machineNote}>{attention.note}</em> : null}
          </button>; })}
        </div>
      </section>

      <details className={styles.disclosure}>
        <summary>Como chegamos a este resultado? <span>Ver detalhes</span></summary>
        <div className={styles.explain}>
          <p>Ranking simples por impacto conhecido · até 3 fatores · acumulado do dia</p>
          {day.impacts.length === 0 ? <p className={styles.empty}>Nenhuma perda relevante identificada.</p> : <div>{day.impacts.map((impact, index) => { const row = rows.find((item) => item.resourceId === impact.resourceId)!; return <button key={`${impact.dimension}-${impact.resourceId}-${index}`} onClick={() => setFocus({ kind: 'RESOURCE', resourceId: row.resourceId })}>
            <strong>{row.resourceId}</strong><span>Lote {row.lot.lotNumber}</span><b>{dimensionLabel[impact.dimension]} · -{Math.round(impact.lossFraction * 100)}pp</b><em>{impactEvidence(row, impact.dimension)}</em>
          </button>; })}</div>}
          <div className={styles.closing}><div><b>Plano</b><i>→</i><b>Execução</b><i>→</i><b>Eventos</b><i>→</i><b>Perdas</b><i>→</i><b>Qualidade</b><i>→</i><strong>Indicador explicável</strong></div></div>
        </div>
      </details>
      <a className={styles.backLink} href={withBase('/demo/fundicao-dc')}>← Voltar à Visão Executiva</a>
    </div>
    {focus ? <FocusDialog focus={focus} rows={rows} currentTime={currentTime} onClose={() => setFocus(null)} /> : null}
  </OperationalWorkspace>;
}
