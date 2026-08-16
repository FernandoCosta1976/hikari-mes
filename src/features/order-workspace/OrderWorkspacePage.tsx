import { useState } from 'react';
import { useLiveScenarioTime } from '../../app/clock/applicationClock';
import { withBase } from '../../app/routing/basePath';
import { OperationalWorkspace } from '../../app/workspace/OperationalWorkspace';
import { resolveDemonstrativeRelease } from '../../demo/adapters/releaseResolution';
import { fundicaoDcIdealCycleTimeSecondsFixture } from '../../demo/fixtures/fundicaoDcIdealCycleTime';
import { selectMaterialResourceEligibilities, selectOrganizationsByLotId, selectPostponedLotIds, selectPreparationConfirmedByLotId, selectProductionExecutions, selectProductionReadiness, selectProductionReleases, selectProductionScheduling, selectScenarioDefinition, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { assessLotExecutionHealth } from '../../domain/production-execution/lotHealth';
import type { ProductionExecutionRecord } from '../../domain/production-execution/models';
import { dominantReadinessCondition } from '../../domain/production-readiness/presentation';
import { revocationReasonLabel, type ProductionReleaseRecord, type RevocationReason } from '../../domain/production-release/models';
import { deriveOrderLifecycleStatus, orderLifecycleLabel, orderLifecycleStepIndex, ORDER_LIFECYCLE_SEQUENCE, type OrderLifecycleStatus } from '../../domain/production-scheduling/orderLifecycle';
import { simulateResourceMove } from '../../domain/production-scheduling/resourceSimulation';
import { FOUNDRY_RESOURCE_IDS, type FoundryResourceId } from '../../domain/resource/models';
import { Badge } from '../../shared/ui/Badge/Badge';
import { Button } from '../../shared/ui/Button/Button';
import { LotHealthIndicator } from '../../shared/ui/LotHealthIndicator/LotHealthIndicator';
import { RouteMessage } from '../../shared/ui/RouteMessage/RouteMessage';
import { destinationLabels, eligibilityForMaterial, formatTime } from '../production-scheduling/productionSchedulingViewModel';
import styles from './OrderWorkspacePage.module.css';

type Panel = null | 'RELEASE_CONFIRM' | 'REVOKE_CONFIRM' | 'REPROGRAM';
type ReprogramWindow = 'ATUAL' | 'TURNO_3' | 'PROXIMO_DIA';

const lifecycleStepLabel: Record<OrderLifecycleStatus, string> = { ...orderLifecycleLabel, PAUSADA: 'Produção (pausada)' };

export function OrderWorkspacePage({ lotId }: { lotId: string }) {
  const definition = useScenarioStore(selectProductionScheduling);
  const scenario = useScenarioStore(selectScenarioDefinition);
  const currentTime = useLiveScenarioTime(scenario?.currentScenarioTime);
  const executionsByLot = useScenarioStore(selectProductionExecutions);
  const readinessAssessments = useScenarioStore(selectProductionReadiness);
  const organizationsByLotId = useScenarioStore(selectOrganizationsByLotId);
  const productionReleases = useScenarioStore(selectProductionReleases);
  const preparationConfirmedByLotId = useScenarioStore(selectPreparationConfirmedByLotId);
  const postponedLotIds = useScenarioStore(selectPostponedLotIds);
  const materialResourceEligibilities = useScenarioStore(selectMaterialResourceEligibilities);
  const activeScheduleVersionId = useScenarioStore((state) => state.activeScheduleVersionId);
  const confirmPreparation = useScenarioStore((state) => state.confirmPreparation);
  const releaseLot = useScenarioStore((state) => state.releaseLot);
  const revokeLotRelease = useScenarioStore((state) => state.revokeLotRelease);
  const postponeLot = useScenarioStore((state) => state.postponeLot);
  const adoptOrganization = useScenarioStore((state) => state.adoptOrganization);

  const [panel, setPanel] = useState<Panel>(null);
  const [revocationReason, setRevocationReason] = useState<RevocationReason>('PLAN_CHANGE');
  const [reprogramWindow, setReprogramWindow] = useState<ReprogramWindow>('ATUAL');
  const [reprogramTarget, setReprogramTarget] = useState<FoundryResourceId | null>(null);

  const sidebar = <div className={styles.sidebar}><strong>Workspace da Ordem</strong><a href={withBase('/demo/fundicao-dc/production-scheduling')}>← Plano Hora-Hora</a></div>;

  if (!definition || !scenario) return <p>Preparando ordem demonstrativa…</p>;
  const lot = definition.lots.find((item) => item.id === lotId);
  if (!lot) return <OperationalWorkspace perspective="ORDER" sidebarContent={sidebar}><RouteMessage title="Ordem não encontrada" detail="Este Lote não existe no cenário demonstrativo atual." /></OperationalWorkspace>;

  const material = definition.materials.find((item) => item.id === lot.materialId)!;
  const readiness = readinessAssessments.find((item) => item.lotId === lot.id);
  const execution = executionsByLot[lot.id];
  const operationalResourceId = organizationsByLotId[lot.id]?.operationalResourceId ?? lot.scheduledResourceId;
  const preparationConfirmed = Boolean(preparationConfirmedByLotId[lot.id]);
  const cycleTimeSeconds = fundicaoDcIdealCycleTimeSecondsFixture[lot.materialId];
  const executionForHealth: ProductionExecutionRecord = execution ?? { lotId: lot.id, productionOrderId: lot.productionOrderId, resourceId: operationalResourceId, scheduleVersionId: activeScheduleVersionId, plannedQuantity: lot.quantity, producedQuantity: 0, scheduledStart: lot.scheduledStart, status: 'NOT_STARTED', pauses: [], demonstrative: true };
  const health = assessLotExecutionHealth(executionForHealth, lot.scheduledStart, lot.scheduledFinish, cycleTimeSeconds, currentTime);
  // A manually confirmed preparation lets Release proceed even while the underlying Readiness fact still shows ATTENTION — the two remain distinct, separately displayed facts (section 29).
  const effectiveReadinessStatus = preparationConfirmed ? 'READY' : readiness?.status;
  const releaseRecord: ProductionReleaseRecord | undefined = productionReleases[lot.id] ?? (effectiveReadinessStatus ? resolveDemonstrativeRelease({ lotId: lot.id, productionOrderId: lot.productionOrderId, resourceId: operationalResourceId, scheduleVersionId: activeScheduleVersionId, scheduledStart: lot.scheduledStart, scheduledFinish: lot.scheduledFinish, readiness: effectiveReadinessStatus }, lot.materialId, currentTime) : undefined);
  const lifecycle = deriveOrderLifecycleStatus(readiness?.status, execution, preparationConfirmed);
  const notStarted = !execution || execution.status === 'NOT_STARTED';
  const eligibility = eligibilityForMaterial(materialResourceEligibilities, lot.materialId);
  const postponed = postponedLotIds[lot.id];
  const dominantCondition = readiness ? dominantReadinessCondition(readiness, lot.scheduledResourceId) : undefined;

  const nextDecision = execution?.status === 'IN_PROGRESS'
    ? { icon: '▶', tone: 'positive' as const, title: 'Em produção', body: 'Acompanhe o avanço na perspectiva Execução.', href: '/demo/fundicao-dc/production-execution', hrefLabel: 'Abrir Execução' }
    : execution?.status === 'PAUSED'
    ? { icon: '⏸', tone: 'attention' as const, title: 'Produção pausada', body: 'Retome ou trate a pausa na perspectiva Execução.', href: '/demo/fundicao-dc/production-execution', hrefLabel: 'Abrir Execução' }
    : execution?.status === 'COMPLETED'
    ? { icon: '✓', tone: 'positive' as const, title: 'Produção concluída', body: 'Resultados desta Ordem estão disponíveis em Qualidade e OEE.' }
    : lifecycle === 'EM_PREPARACAO'
    ? { icon: '⚠', tone: 'attentionStrong' as const, title: `${dominantCondition?.label ?? 'Preparação'} ainda pendente`, body: dominantCondition?.evidence ?? 'Esta Ordem não pode ser liberada enquanto esta condição permanecer pendente.', action: { label: 'Marcar preparação como concluída', onClick: () => confirmPreparation(lot.id) } }
    : releaseRecord?.status === 'RELEASED'
    ? { icon: '✓', tone: 'positive' as const, title: releaseRecord.releaseType === 'AUTOMATIC' ? 'Liberada automaticamente pela regra HIKARI' : 'Liberada manualmente', body: 'Pronta para iniciar produção quando a máquina estiver disponível.' }
    : releaseRecord?.status === 'READY_FOR_RELEASE'
    ? { icon: '○', tone: 'attention' as const, title: 'Pronta para liberação', body: 'A preparação está concluída; falta a decisão de liberação.', action: { label: 'Liberar para produção', onClick: () => setPanel('RELEASE_CONFIRM') } }
    : releaseRecord?.status === 'BLOCKED_FOR_RELEASE'
    ? { icon: '⊘', tone: 'attentionStrong' as const, title: 'Bloqueada para liberação', body: releaseRecord.reason }
    : releaseRecord?.status === 'RELEASE_REVOKED'
    ? { icon: '⚠', tone: 'attention' as const, title: 'Liberação revogada', body: `Motivo: ${revocationReasonLabel[releaseRecord.revocationReason!]}. Uma nova decisão de liberação é necessária.`, action: { label: 'Liberar para produção', onClick: () => setPanel('RELEASE_CONFIRM') } }
    : { icon: '⚠', tone: 'attention' as const, title: 'Liberação requer revisão', body: releaseRecord?.reason ?? 'Aguardando avaliação de preparação.' };

  return <OperationalWorkspace perspective="ORDER" lotId={lot.id} sidebarContent={sidebar}>
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Origem"><a href={withBase('/demo/fundicao-dc/production-scheduling')}>Plano Hora-Hora</a><span>/</span><strong>Ordem</strong></nav>
      <header className={styles.hero}>
        <div className={styles.heroTitle}><span className={styles.overline}>Workspace da Ordem</span><h1>Ordem / Lote {lot.lotNumber}</h1><p>O que precisa acontecer para esta Ordem avançar?</p></div>
        <dl className={styles.heroFacts}>
          <div><dt>Material</dt><dd>{material.name}</dd></div>
          <div><dt>Quantidade</dt><dd>{lot.quantity} peças</dd></div>
          <div><dt>Destino</dt><dd>{destinationLabels[lot.destination]}</dd></div>
          <div><dt>Estado</dt><dd>{orderLifecycleLabel[lifecycle]}</dd></div>
          <div><dt>Liberação</dt><dd>{releaseRecord?.status === 'RELEASED' ? (releaseRecord.releaseType === 'AUTOMATIC' ? 'Liberada automaticamente' : 'Liberada manualmente') : releaseRecord?.status === 'READY_FOR_RELEASE' ? 'Aguardando liberação' : releaseRecord?.status === 'BLOCKED_FOR_RELEASE' ? 'Bloqueada para liberação' : releaseRecord?.status === 'RELEASE_REVOKED' ? 'Liberação revogada' : 'Não liberada'}</dd></div>
          <div><dt>Programação</dt><dd>{operationalResourceId} · {formatTime(lot.scheduledStart)} → {formatTime(lot.scheduledFinish)}{operationalResourceId !== lot.scheduledResourceId ? <small>Programado originalmente: {lot.scheduledResourceId}</small> : <small>Horário derivado pelo Tempo de ciclo padrão</small>}</dd></div>
        </dl>
        <div className={styles.heroHealth}><LotHealthIndicator health={health} context={{ lotLabel: lot.lotNumber, material: material.name, quantity: lot.quantity, resourceId: operationalResourceId, scheduledStart: formatTime(lot.scheduledStart), scheduledFinish: formatTime(lot.scheduledFinish) }} />{postponed ? <Badge tone="neutral">Em espera · {postponed.targetLabel}</Badge> : null}</div>
      </header>

      <ol className={styles.stepper} aria-label="Ciclo de vida da Ordem">{ORDER_LIFECYCLE_SEQUENCE.map((step, index) => { const currentIndex = orderLifecycleStepIndex(lifecycle); return <li key={step} data-state={index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'}><span aria-hidden="true">{index < currentIndex ? '✓' : index === currentIndex ? '●' : '○'}</span><small>{lifecycleStepLabel[step]}</small></li>; })}</ol>

      <section className={styles.nextDecision} aria-label="Próxima decisão" data-tone={nextDecision.tone}>
        <span aria-hidden="true">{nextDecision.icon}</span>
        <div><strong>{nextDecision.title}</strong><p>{nextDecision.body}</p></div>
        {'action' in nextDecision && nextDecision.action ? <Button onClick={nextDecision.action.onClick}>{nextDecision.action.label}</Button> : 'href' in nextDecision && nextDecision.href ? <a href={withBase(nextDecision.href)}>{nextDecision.hrefLabel}</a> : null}
      </section>

      <div className={styles.actions}>
        {releaseRecord?.status === 'RELEASED' && notStarted ? <Button onClick={() => setPanel('REVOKE_CONFIRM')}>Revogar liberação</Button> : null}
        {notStarted ? <Button onClick={() => { setPanel('REPROGRAM'); setReprogramTarget(null); setReprogramWindow('ATUAL'); }}>Alterar programação</Button> : null}
        <a href={withBase(`/demo/fundicao-dc/production-readiness?lotId=${lot.id}`)}>Ver preparação →</a>
      </div>

      {panel === 'RELEASE_CONFIRM' ? <section className={styles.panel} aria-label="Confirmar liberação">
        <h2>Liberar para produção</h2>
        <dl className={styles.panelGrid}><div><dt>Lote</dt><dd>{lot.lotNumber}</dd></div><div><dt>Material</dt><dd>{material.name}</dd></div><div><dt>Quantidade</dt><dd>{lot.quantity} peças</dd></div><div><dt>Máquina</dt><dd>{operationalResourceId}</dd></div><div><dt>Horário planejado</dt><dd>{formatTime(lot.scheduledStart)} → {formatTime(lot.scheduledFinish)}</dd></div><div><dt>Preparação</dt><dd>{readiness ? readiness.summary : 'Não avaliada'}</dd></div><div><dt>Saúde temporal</dt><dd>{lifecycleStepLabel[lifecycle]}</dd></div></dl>
        <div className={styles.panelActions}><Button onClick={() => { releaseLot(lot.id); setPanel(null); }}>Confirmar liberação</Button><Button onClick={() => setPanel(null)}>Cancelar</Button></div>
      </section> : null}

      {panel === 'REVOKE_CONFIRM' ? <section className={styles.panel} aria-label="Revogar liberação">
        <h2>Revogar liberação</h2>
        <p>Lote {lot.lotNumber} · {operationalResourceId} · {formatTime(lot.scheduledStart)}</p>
        <label>Motivo<select aria-label="Motivo da revogação" value={revocationReason} onChange={(event) => setRevocationReason(event.target.value as RevocationReason)}>{Object.entries(revocationReasonLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <div className={styles.panelActions}><Button onClick={() => { revokeLotRelease(lot.id, revocationReason); setPanel(null); }}>Confirmar revogação</Button><Button onClick={() => setPanel(null)}>Cancelar</Button></div>
      </section> : null}

      {panel === 'REPROGRAM' ? <section className={styles.panel} aria-label="Alterar programação">
        <h2>Alterar programação</h2>
        <p>Lote {lot.lotNumber} · {material.name} · {lot.quantity} peças · duração calculada pelo Tempo de ciclo padrão</p>
        <div className={styles.reprogramCurrent}><small>ATUAL</small><strong>{operationalResourceId} · {formatTime(lot.scheduledStart)} → {formatTime(lot.scheduledFinish)}</strong></div>
        <fieldset className={styles.turnoFieldset}><legend>Produzir</legend>
          <label><input type="radio" name="reprogram-window" checked={reprogramWindow === 'ATUAL'} onChange={() => setReprogramWindow('ATUAL')} /> Hoje — turno atual</label>
          <label><input type="radio" name="reprogram-window" checked={reprogramWindow === 'TURNO_3'} onChange={() => setReprogramWindow('TURNO_3')} /> Hoje — Turno 3</label>
          <label><input type="radio" name="reprogram-window" checked={reprogramWindow === 'PROXIMO_DIA'} onChange={() => setReprogramWindow('PROXIMO_DIA')} /> Próximo dia</label>
        </fieldset>
        {reprogramWindow === 'ATUAL' ? <>
          <div className={styles.dcList}>{FOUNDRY_RESOURCE_IDS.map((resourceId) => { const isCurrent = resourceId === operationalResourceId; const eligible = eligibility?.eligibleResourceIds.includes(resourceId) ?? false; return <button key={resourceId} disabled={isCurrent || !eligible} data-selected={reprogramTarget === resourceId || undefined} onClick={() => setReprogramTarget(resourceId)}><strong>{resourceId}</strong><span>{isCurrent ? '● Programação atual' : eligible ? '✓ Elegível' : '⊘ Não elegível'}</span></button>; })}</div>
          {reprogramTarget ? (() => {
            const impact = simulateResourceMove(definition.lots, lot.id, reprogramTarget, 30, []);
            return <div className={styles.reprogramPreview}>
              <div className={styles.beforeAfter}><div><small>ANTES</small><strong>{operationalResourceId} · {formatTime(lot.scheduledStart)}</strong></div><div><small>DEPOIS</small><strong>{reprogramTarget} · {formatTime(lot.scheduledStart)}</strong></div></div>
              <ul className={styles.impactList}>
                <li>✓ Recurso elegível</li>
                <li>✓ Material compatível</li>
                {impact.conflictLotIds.length || impact.conflictSetupIds.length ? <li>△ Impacto no próximo Lote da máquina de destino</li> : <li>✓ Janela sem conflito conhecido</li>}
                {impact.netSetupDeltaMinutes !== 0 ? <li>△ Impacto de Setup: {impact.netSetupDeltaMinutes > 0 ? '+' : ''}{impact.netSetupDeltaMinutes} min</li> : <li>✓ Sem novo Setup previsto</li>}
              </ul>
              <div className={styles.panelActions}><Button onClick={() => { adoptOrganization(impact, 'Planejador da Fundição · demonstrativo'); setPanel(null); setReprogramTarget(null); }}>Confirmar nova programação</Button><Button onClick={() => setReprogramTarget(null)}>Cancelar</Button></div>
            </div>;
          })() : null}
        </> : <div className={styles.reprogramHold}>
          <p>Primeiras janelas demonstrativas possíveis: DC02 · 03:10 · DC04 · 04:40. Protótipo — sem calendário completo.</p>
          <div className={styles.panelActions}><Button onClick={() => { postponeLot(lot.id, reprogramWindow === 'TURNO_3' ? 'Turno 3' : 'Próximo dia'); setPanel(null); }}>Colocar em espera</Button><Button onClick={() => setPanel(null)}>Cancelar</Button></div>
        </div>}
      </section> : null}
    </div>
  </OperationalWorkspace>;
}
