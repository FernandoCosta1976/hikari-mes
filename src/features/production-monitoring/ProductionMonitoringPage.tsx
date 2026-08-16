import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLiveScenarioTime } from '../../app/clock/applicationClock';
import { OperationalWorkspace } from '../../app/workspace/OperationalWorkspace';
import { fundicaoDcIdealCycleTimeSecondsFixture } from '../../demo/fixtures/fundicaoDcIdealCycleTime';
import { fundicaoDcMoldsFixture } from '../../demo/fixtures/fundicaoDcMolds';
import { fundicaoDcProductionEventsFixture } from '../../demo/fixtures/fundicaoDcProductionEvents';
import { selectProductionExecutions, selectProductionScheduling, selectScenarioDefinition, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { classifyMoldLife, moldForResource } from '../../domain/mold/models';
import { currentExecutionForResource, type ProductionExecutionRecord } from '../../domain/production-execution/models';
import { assessLotExecutionHealth } from '../../domain/production-execution/lotHealth';
import { eventDurationMinutes, eventsNewestFirst, monitoringCounts, type ProductionEvent, type ProductionEventType } from '../../domain/production-monitoring/models';
import type { Lot } from '../../domain/production-scheduling/models';
import { timelinePosition, timelineWidth } from '../../domain/production-scheduling/temporalMath';
import { FOUNDRY_RESOURCE_IDS, type FoundryResourceId } from '../../domain/resource/models';
import { ScenarioResetControl } from '../../shared/operational/ScenarioResetControl';
import { Button } from '../../shared/ui/Button/Button';
import { IconTip } from '../../shared/ui/IconTip/IconTip';
import { LotHealthIndicator } from '../../shared/ui/LotHealthIndicator/LotHealthIndicator';
import { formatTime } from '../production-scheduling/productionSchedulingViewModel';
import styles from './ProductionMonitoringPage.module.css';

const eventIcon: Record<ProductionEventType, string> = { MATERIAL: '▣', MACHINE_ADJUSTMENT: '⚙', TOOLING: '⚙', QUALITY: '◆', OTHER: '△' };

const stateLabel = { NOT_STARTED: 'Aguardando início', IN_PROGRESS: 'Produzindo', PAUSED: 'Parada', COMPLETED: 'Concluído' } as const;
const moldStatusLabel = { NORMAL: 'Normal', ATTENTION: 'Atenção', MAINTENANCE_RECOMMENDED: 'Manutenção recomendada' } as const;
const eventLabel: Record<ProductionEventType, string> = { MATERIAL: 'Falta de material', MACHINE_ADJUSTMENT: 'Ajuste de máquina', TOOLING: 'Ferramental', QUALITY: 'Qualidade', OTHER: 'Outro' };
const rangeStart = '2025-05-15T09:00:00-03:00';
const rangeFinish = '2025-05-15T22:00:00-03:00';

type Context = { kind: 'LOT'; lot: Lot; execution: ProductionExecutionRecord } | { kind: 'RESOURCE'; resourceId: FoundryResourceId; lot: Lot; execution: ProductionExecutionRecord };

function ContextDialog({ context, events, currentTime, materialName, nextLot, onClose }: { context: Context; events: readonly ProductionEvent[]; currentTime: string; materialName: string; nextLot?: Lot; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { close.current?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [onClose]);
  const relevant = events.filter((event) => event.lotId === context.lot.id);
  const active = relevant.find((event) => event.status === 'ACTIVE');
  const mold = context.kind === 'RESOURCE' ? moldForResource(fundicaoDcMoldsFixture, context.resourceId) : undefined;
  const health = assessLotExecutionHealth(context.execution, context.lot.scheduledStart, context.lot.scheduledFinish, fundicaoDcIdealCycleTimeSecondsFixture[context.lot.materialId], currentTime);
  return createPortal(<div className={styles.modalLayer}><button className={styles.backdrop} aria-label="Fechar contexto" onClick={onClose} /><section role="dialog" aria-modal="true" aria-labelledby="monitoring-context-title" className={styles.modal}>
    <header><div><small>{context.kind === 'LOT' ? 'ACOMPANHAMENTO DO LOTE' : 'CONTEXTO DO RECURSO'}</small><h2 id="monitoring-context-title">{context.kind === 'LOT' ? `Lote ${context.lot.lotNumber}` : context.resourceId}</h2><LotHealthIndicator health={health} context={{ lotLabel: context.lot.lotNumber, material: materialName, quantity: context.lot.quantity, resourceId: context.execution.resourceId, scheduledStart: formatTime(context.lot.scheduledStart), scheduledFinish: formatTime(context.lot.scheduledFinish) }} /></div><Button ref={close} aria-label="Fechar contexto de acompanhamento" onClick={onClose}>×</Button></header>
    <p>{context.kind === 'RESOURCE' ? `Lote atual: ${context.lot.lotNumber}` : `${context.execution.resourceId} · Versão do plano ${context.execution.scheduleVersionId}`}</p>
    <dl><div><dt>Estado atual</dt><dd>{stateLabel[context.execution.status]}</dd></div><div><dt>Progresso</dt><dd>{context.execution.producedQuantity} / {context.execution.plannedQuantity} · {Math.round(context.execution.producedQuantity / context.execution.plannedQuantity * 100)}%</dd></div><div><dt>Início planejado</dt><dd>{formatTime(context.lot.scheduledStart)}</dd></div><div><dt>Início real</dt><dd>{context.execution.actualStart ? formatTime(context.execution.actualStart) : '—'}</dd></div><div><dt>Término real</dt><dd>{context.execution.actualFinish ? formatTime(context.execution.actualFinish) : '—'}</dd></div><div><dt>Evento ativo</dt><dd>{active ? `${eventLabel[active.eventType]} · ${eventDurationMinutes(active, currentTime)} min` : 'Nenhum'}</dd></div>{context.kind === 'RESOURCE' ? <div><dt>Próximo Lote</dt><dd>{nextLot ? `${nextLot.lotNumber} · ${formatTime(nextLot.scheduledStart)}` : 'Não conhecido'}</dd></div> : null}{mold ? <div><dt>Molde atual</dt><dd>{mold.code} · {Math.round(mold.lifeUsedRatio * 100)}% da vida útil{classifyMoldLife(mold.lifeUsedRatio) !== 'NORMAL' ? ` · ${moldStatusLabel[classifyMoldLife(mold.lifeUsedRatio)]}` : ''}</dd></div> : null}</dl>
    <section aria-label="Eventos do contexto"><h3>Eventos</h3>{relevant.length ? relevant.map((event) => <p key={event.eventId}>{formatTime(event.startedAt)} · {eventLabel[event.eventType]} · {event.status === 'ACTIVE' ? `ATIVO · ${eventDurationMinutes(event, currentTime)} min` : `${eventDurationMinutes(event, currentTime)} min · ENCERRADO`}</p>) : <p>Sem eventos demonstrativos.</p>}</section>
    <small>Produzido não significa estoque disponível, quantidade boa ou aceita.</small>
  </section></div>, document.body);
}

export function ProductionMonitoringPage() {
  const definition = useScenarioStore(selectProductionScheduling);
  const scenario = useScenarioStore(selectScenarioDefinition);
  const executionsByLot = useScenarioStore(selectProductionExecutions);
  const [context, setContext] = useState<Context | null>(null);
  const events = fundicaoDcProductionEventsFixture;
  const executions = Object.values(executionsByLot);
  const counts = useMemo(() => monitoringCounts(executions), [executions]);
  const feed = useMemo(() => eventsNewestFirst(events), [events]);
  const currentTime = useLiveScenarioTime(scenario?.currentScenarioTime);
  if (!definition || !scenario) return <p>Preparando acompanhamento demonstrativo…</p>;
  const currentPosition = timelinePosition(currentTime, rangeStart, rangeFinish);
  const openLot = (execution: ProductionExecutionRecord) => { const lot = definition.lots.find((item) => item.id === execution.lotId); if (lot) setContext({ kind: 'LOT', lot, execution }); };
  const openResource = (resourceId: FoundryResourceId, execution: ProductionExecutionRecord) => { const lot = definition.lots.find((item) => item.id === execution.lotId); if (lot) setContext({ kind: 'RESOURCE', resourceId, lot, execution }); };
  const contextNextLot = context ? definition.lots.filter((lot) => lot.scheduledResourceId === context.execution.resourceId && Date.parse(lot.scheduledStart) > Date.parse(context.lot.scheduledStart)).sort((a,b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart))[0] : undefined;
  return <OperationalWorkspace perspective="MONITORING" sidebarContent={<div className={styles.sidebar}><strong>Acompanhamento</strong><IconTip icon="◷" label="Data de referência" value="15/05" tip="Data de referência · 15/05/2025" /><IconTip icon="⏱" label="Horário atual" value={formatTime(currentTime)} /><ScenarioResetControl /><IconTip icon="ⓘ" label="Eventos demonstrativos" tip="Eventos demonstrativos · BUSINESS VALIDATION REQUIRED" /></div>}>
    <div className={styles.page}><header className={styles.hero}><div><span>Capability 06 · Core + Essencial</span><h1>O que está acontecendo na produção agora?</h1></div><aside><IconTip icon="⏱" label="Horário atual" value={formatTime(currentTime)} tip="Horário de referência do cenário · passado, agora e futuro" className={styles.currentTimeTip} /></aside></header>
    <section className={styles.wip} aria-label="Resumo de produção em andamento"><button onClick={() => openLot(executions.find((item) => item.status === 'NOT_STARTED')!)}><span>Aguardando</span><strong>{counts.waiting}</strong></button><button onClick={() => openLot(executions.find((item) => item.status === 'IN_PROGRESS')!)}><span>Em produção</span><strong>{counts.running}</strong></button><button data-state="attention" onClick={() => openLot(executions.find((item) => item.status === 'PAUSED')!)}><span>Parados</span><strong>{counts.paused}</strong></button><button onClick={() => openLot(executions.find((item) => item.status === 'COMPLETED')!)}><span>Concluídos</span><strong>{counts.completed}</strong></button><p><b>Evento ativo:</b> DC03 · Lote 266 · Ferramental · {eventDurationMinutes(events[0], currentTime)} min</p></section>
    <section className={styles.live} aria-labelledby="live-title"><header><div><h2 id="live-title">Linha do tempo da produção em tempo real</h2><p>Planejado × Real · clique em um Lote ou Recurso para acompanhar</p></div><span>Taxonomia demonstrativa</span></header>
      <div className={styles.timeline} data-testid="live-production-timeline"><div className={styles.axisCorner}>Recurso</div><div className={styles.axis}>{[9,11,13,15,17,19,21].map((hour) => <span key={hour} style={{ left: `${((hour - 9) / 13) * 100}%` }}>{String(hour).padStart(2,'0')}:00</span>)}</div><div className={styles.timeLine} style={{ left: `calc(8rem + (100% - 8rem) * ${currentPosition / 100})` }}><span>{formatTime(currentTime)}</span></div>
      <div className={styles.lanes}>{FOUNDRY_RESOURCE_IDS.map((resourceId) => { const execution = currentExecutionForResource(executions, resourceId)!; const lot = definition.lots.find((item) => item.id === execution.lotId)!; const actualFinish = execution.actualFinish ?? (execution.status === 'NOT_STARTED' ? execution.scheduledStart : currentTime); const activeEvent = events.find((event) => event.resourceId === resourceId && event.status === 'ACTIVE'); const health = assessLotExecutionHealth(execution, lot.scheduledStart, lot.scheduledFinish, fundicaoDcIdealCycleTimeSecondsFixture[lot.materialId], currentTime); return <section className={styles.lane} key={resourceId} data-state={execution.status}><button className={styles.resource} onClick={() => openResource(resourceId, execution)}><span className={styles.resourceHead}><strong>{resourceId}</strong><LotHealthIndicator health={health} compact /><span>{stateLabel[execution.status]}</span></span><small>Lote {lot.lotNumber} · {execution.producedQuantity}/{execution.plannedQuantity}</small>{activeEvent ? <em className={styles.activeEventChip}><span aria-hidden="true">{eventIcon[activeEvent.eventType]}</span>{eventLabel[activeEvent.eventType]} · {eventDurationMinutes(activeEvent, currentTime)} min</em> : null}</button><div className={styles.tracks}><div><span>PLANEJADO</span><button className={styles.scheduled} style={{ left: `${timelinePosition(lot.scheduledStart, rangeStart, rangeFinish)}%`, width: `${timelineWidth(lot.scheduledStart, lot.scheduledFinish, rangeStart, rangeFinish)}%` }} onClick={() => openLot(execution)}>Lote {lot.lotNumber}</button></div><div><span>REAL</span>{execution.status !== 'NOT_STARTED' ? <button className={styles.actual} style={{ left: `${timelinePosition(execution.actualStart!, rangeStart, rangeFinish)}%`, width: `${timelineWidth(execution.actualStart!, actualFinish, rangeStart, rangeFinish)}%` }} onClick={() => openLot(execution)}>Lote {lot.lotNumber} · {execution.producedQuantity}/{execution.plannedQuantity}</button> : <span className={styles.notStarted} style={{ left: `${timelinePosition(lot.scheduledStart, rangeStart, rangeFinish)}%` }}>Ainda não iniciado</span>}{activeEvent ? <button className={styles.eventBlock} aria-label={`Evento ativo na ${resourceId}: ${eventLabel[activeEvent.eventType]}`} style={{ left: `${timelinePosition(activeEvent.startedAt, rangeStart, rangeFinish)}%`, width: `${timelineWidth(activeEvent.startedAt, currentTime, rangeStart, rangeFinish)}%` }} onClick={() => openLot(execution)}>Evento ativo</button> : null}</div></div></section>; })}</div></div>
    </section>
    <section className={styles.feed} aria-labelledby="feed-title"><header><div><h2 id="feed-title">Registro de Eventos</h2><p>Mais recente primeiro · fatos operacionais demonstrativos</p></div><span>ATIVO / ENCERRADO</span></header><div>{feed.map((event) => { const execution = executionsByLot[event.lotId]; const lot = definition.lots.find((item) => item.id === event.lotId)!; return <button key={event.eventId} data-status={event.status} onClick={() => setContext({ kind: 'LOT', lot, execution })}><time>{formatTime(event.startedAt)}</time><strong>{event.resourceId}</strong><span>Lote {lot.lotNumber}</span><b>{eventLabel[event.eventType]}</b><em>{event.status === 'ACTIVE' ? `ATIVO · ${eventDurationMinutes(event,currentTime)} min` : `${eventDurationMinutes(event,currentTime)} min · ENCERRADO`}</em></button>; })}</div></section>
    <details className={styles.disclosure}><summary>Como esses fatos preparam o OEE? <span>Ver detalhes</span></summary><div className={styles.oeeChain}><strong>Fatos de execução + Eventos de produção + Tempo</strong><span>→ Disponibilidade futura</span><strong>Planejado + Produzido + Tempo + Tempo de ciclo padrão futuro</strong><span>→ Desempenho futuro</span><strong>Produzido + Fatos de qualidade futuros</strong><span>→ Qualidade futura → OEE futuro</span></div></details>
    </div>{context ? <ContextDialog context={context} events={events} currentTime={currentTime} materialName={definition.materials.find((item) => item.id === context.lot.materialId)?.name ?? ''} nextLot={contextNextLot} onClose={() => setContext(null)} /> : null}
  </OperationalWorkspace>;
}
