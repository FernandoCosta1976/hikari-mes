import { useLiveScenarioTime } from '../../app/clock/applicationClock';
import { withBase } from '../../app/routing/basePath';
import { useScenarioPath } from '../../app/routing/useScenarioPath';
import { OperationalWorkspace } from '../../app/workspace/OperationalWorkspace';
import { computeFundicaoDcAdherenceSummary, computeFundicaoDcShiftAdherenceSummaries } from '../../demo/adapters/adherenceSummaryAdapter';
import { computeFundicaoDcOeeSummary } from '../../demo/adapters/oeeSummaryAdapter';
import { computeFundicaoDcQualitySummary } from '../../demo/adapters/qualitySummaryAdapter';
import { downstreamHealthForScenario, idealCycleTimeSecondsForScenario, moldsForScenario, qualityConfirmationsForScenario } from '../../demo/scenario-engine/scenarioFixtures';
import { selectConfirmedQuantityByLotId, selectProductionConfirmations, selectProductionExecutions, selectProductionReadiness, selectProductionScheduling, selectScenarioDefinition, selectSessionClock, useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import type { DownstreamAreaStatus } from '../../domain/downstream/models';
import { mostCriticalMold } from '../../domain/mold/models';
import { assessLotExecutionHealth, byLotHealthAttention, lotHealthIcon, lotHealthLabel, type LotHealthProjection, type LotHealthStatus } from '../../domain/production-execution/lotHealth';
import { currentExecutionForResource } from '../../domain/production-execution/models';
import { FOUNDRY_RESOURCE_IDS, type FoundryResourceId } from '../../domain/resource/models';
import type { Lot } from '../../domain/production-scheduling/models';
import { ScenarioResetControl } from '../../shared/operational/ScenarioResetControl';
import { Bar, StackedBar } from '../../shared/ui/Bar/Bar';
import { IconTip } from '../../shared/ui/IconTip/IconTip';
import { LotHealthIndicator } from '../../shared/ui/LotHealthIndicator/LotHealthIndicator';
import { formatTime } from '../production-scheduling/productionSchedulingViewModel';
import monitoringStyles from '../production-monitoring/ProductionMonitoringPage.module.css';
import styles from './StrategicViewPage.module.css';

const pct = (value: number | null) => value === null ? 'N/A' : `${Math.round(value * 100)}%`;

type OverallStatus = 'SAUDAVEL' | 'ATENCAO' | 'RISCO';
const overallLabel: Record<OverallStatus, string> = { SAUDAVEL: 'SAUDÁVEL', ATENCAO: 'ATENÇÃO', RISCO: 'RISCO' };
const overallIcon: Record<OverallStatus, string> = { SAUDAVEL: '✓', ATENCAO: '△', RISCO: '⚠' };
const overallTone: Record<OverallStatus, 'positive' | 'attention' | 'attentionStrong'> = { SAUDAVEL: 'positive', ATENCAO: 'attention', RISCO: 'attentionStrong' };

const downstreamLabel: Record<DownstreamAreaStatus, string> = { PROTECTED: 'Sem risco', ATTENTION: 'Atenção', RISK: 'Risco', UNKNOWN: 'Sem dados' };
const downstreamTone: Record<DownstreamAreaStatus, 'positive' | 'attention' | 'neutral'> = { PROTECTED: 'positive', ATTENTION: 'attention', RISK: 'attention', UNKNOWN: 'neutral' };
const downstreamIcon: Record<DownstreamAreaStatus, string> = { PROTECTED: '✓', ATTENTION: '△', RISK: '⚠', UNKNOWN: '?' };

/**
 * Deterministic, page-local aggregation over already-governed facts (Lot
 * Health, Downstream coverage) — not a new business rule. Mirrors the
 * attention derivations already used per-page (rowAttention in OeePage,
 * classificationTone in ProductionAdherencePage).
 */
function deriveOverallStatus(healthCounts: Record<LotHealthStatus, number>, downstreamStatus: DownstreamAreaStatus): OverallStatus {
  const serious = healthCounts.LATE_NOT_STARTED + healthCounts.BEHIND_PLAN;
  const attention = healthCounts.AT_RISK + healthCounts.STARTED_LATE;
  if (serious >= 2 || downstreamStatus === 'RISK') return 'RISCO';
  if (serious >= 1 || attention >= 1 || downstreamStatus === 'ATTENTION') return 'ATENCAO';
  return 'SAUDAVEL';
}

export function StrategicViewPage() {
  const scenarioPath = useScenarioPath();
  const definition = useScenarioStore(selectProductionScheduling);
  const scenario = useScenarioStore(selectScenarioDefinition);
  const executionsByLot = useScenarioStore(selectProductionExecutions);
  const confirmedQuantityByLotId = useScenarioStore(selectConfirmedQuantityByLotId);
  const productionConfirmationsByLot = useScenarioStore(selectProductionConfirmations);
  const readinessAssessments = useScenarioStore(selectProductionReadiness);
  const sessionClock = useScenarioStore(selectSessionClock);
  const currentTime = useLiveScenarioTime(sessionClock ?? scenario?.currentScenarioTime);
  const qualityConfirmations = qualityConfirmationsForScenario(scenario?.id);
  const idealCycleTimeSecondsByMaterialId = idealCycleTimeSecondsForScenario(scenario?.id);
  const downstream = downstreamHealthForScenario(scenario?.id);
  const criticalMold = mostCriticalMold(moldsForScenario(scenario?.id));
  if (!definition || !scenario) return <p>Preparando visão estratégica…</p>;
  const businessDate = currentTime.slice(0, 10);
  const productionConfirmations = Object.values(productionConfirmationsByLot).flat();

  const oeeDay = computeFundicaoDcOeeSummary(definition, executionsByLot, currentTime, qualityConfirmations, idealCycleTimeSecondsByMaterialId, productionConfirmations);
  const adherenceDay = computeFundicaoDcAdherenceSummary(definition, executionsByLot, currentTime);
  const adherenceShifts = computeFundicaoDcShiftAdherenceSummaries(definition, executionsByLot, currentTime);
  const currentShift = adherenceShifts.find((shift) => shift.status === 'IN_PROGRESS') ?? adherenceShifts[adherenceShifts.length - 1];
  const qualityDay = computeFundicaoDcQualitySummary(definition, executionsByLot, currentTime, qualityConfirmations, idealCycleTimeSecondsByMaterialId, productionConfirmations);

  const todaySchedule = definition.schedules[0];
  const todayLots = todaySchedule.lotIds.map((id) => definition.lots.find((lot) => lot.id === id)!).filter(Boolean);
  const meta = todayLots.reduce((sum, lot) => sum + lot.quantity, 0);
  const producedTotal = qualityDay.produced;
  const effectivenessRatio = meta > 0 ? producedTotal / meta : null;
  const readinessCounts = readinessAssessments.reduce((counts, item) => ({ ...counts, [item.status]: counts[item.status] + 1 }), { READY: 0, ATTENTION: 0, BLOCKED: 0, UNKNOWN: 0 });
  const lotsEmAtencao = readinessCounts.ATTENTION + readinessCounts.BLOCKED + readinessCounts.UNKNOWN;

  const healthByResource = Object.fromEntries(FOUNDRY_RESOURCE_IDS.map((resourceId) => {
    const execution = currentExecutionForResource(Object.values(executionsByLot), resourceId)!;
    const lot = definition.lots.find((item) => item.id === execution.lotId)!;
    const cycleTimeSeconds = idealCycleTimeSecondsByMaterialId[lot.materialId];
    const health = assessLotExecutionHealth(execution, confirmedQuantityByLotId[execution.lotId] ?? 0, lot.scheduledStart, lot.scheduledFinish, cycleTimeSeconds, currentTime);
    return [resourceId, { health, lot }] as const;
  })) as Record<FoundryResourceId, { health: LotHealthProjection; lot: Lot }>;

  const healthCounts = Object.values(healthByResource).reduce((counts, { health }) => ({ ...counts, [health.status]: counts[health.status] + 1 }), { NOT_DUE: 0, AT_RISK: 0, ON_TRACK: 0, LATE_NOT_STARTED: 0, STARTED_LATE: 0, BEHIND_PLAN: 0, AHEAD_OF_PLAN: 0, COMPLETED: 0, UNKNOWN: 0 } as Record<LotHealthStatus, number>);
  const lotsEmRisco = healthCounts.AT_RISK;
  const status = deriveOverallStatus(healthCounts, downstream.status);

  const priorities = Object.entries(healthByResource)
    .filter(([, { health }]) => ['LATE_NOT_STARTED', 'BEHIND_PLAN', 'AT_RISK'].includes(health.status))
    .sort(([, a], [, b]) => byLotHealthAttention(a.health.status, b.health.status))
    .slice(0, 3)
    .map(([resourceId, { health, lot }]) => ({ resourceId, health, lot }));

  const oeeRow = (resourceId: string) => oeeDay.rows.find((row) => row.resourceId === resourceId)!;

  const statusReason = status === 'RISCO'
    ? `${healthCounts.LATE_NOT_STARTED + healthCounts.BEHIND_PLAN} máquina(s) atrasada(s) ou abaixo do plano`
    : status === 'ATENCAO'
    ? (downstream.status !== 'PROTECTED' ? 'Usinagem em atenção de cobertura' : `${healthCounts.AT_RISK + healthCounts.STARTED_LATE} máquina(s) em risco de atraso`)
    : 'Nenhum desvio relevante identificado';

  return <OperationalWorkspace perspective="STRATEGIC" sidebarContent={<div className={monitoringStyles.sidebar}><strong>Visão Estratégica</strong><IconTip icon="◷" label="Data de referência" value={`${businessDate.slice(8, 10)}/${businessDate.slice(5, 7)}`} tip={`Data de referência · ${businessDate}`} /><IconTip icon="⏱" label="Horário atual" value={formatTime(currentTime)} /><ScenarioResetControl /><IconTip icon="ⓘ" label="Cockpit demonstrativo" tip="Cockpit demonstrativo · requer validação de negócio" /></div>}>
    <div className={styles.page}>
      <header className={styles.hero} aria-labelledby="strategic-title">
        <span className={styles.eyebrow}>Fundição DC · {currentShift.shiftName.toUpperCase()} · {formatTime(currentTime)}</span>
        <h1 id="strategic-title">Como está a saúde da Fundição DC?</h1>
        <div className={styles.statusBanner} data-tone={overallTone[status]}>
          <span aria-hidden="true">{overallIcon[status]}</span>
          <strong>{overallLabel[status]}</strong>
          <span className={styles.statusReason}>{statusReason}</span>
        </div>
      </header>

      <section className={styles.n1Row} aria-label="Indicadores principais">
        <article aria-labelledby="q-production">
          <h2 id="q-production">Eficácia</h2>
          <strong className={styles.n1Value}>{pct(effectivenessRatio)}</strong>
          <Bar ratio={effectivenessRatio} tone="positive" label={`Produzido ${pct(effectivenessRatio)} da meta do dia`} />
          <small>Meta {meta.toLocaleString('pt-BR')} · Produzido {producedTotal.toLocaleString('pt-BR')} · Falta {Math.max(0, meta - producedTotal).toLocaleString('pt-BR')} · {lotsEmAtencao} em atenção · {lotsEmRisco} em risco</small>
          <a href={withBase(scenarioPath('/production-scheduling'))}>Ver Plano →</a>
        </article>

        <article aria-labelledby="q-oee">
          <h2 id="q-oee">Eficiência · OEE</h2>
          <strong className={styles.n1Value}>{pct(oeeDay.areaOee)}</strong>
          <div className={styles.oeeBars}>
            <div><span>Disponibilidade</span><Bar ratio={oeeDay.areaAvailability} tone="positive" label={`Disponibilidade ${pct(oeeDay.areaAvailability)}`} /><b>{pct(oeeDay.areaAvailability)}</b></div>
            <div><span>Desempenho</span><Bar ratio={oeeDay.areaPerformance} tone="positive" label={`Desempenho ${pct(oeeDay.areaPerformance)}`} /><b>{pct(oeeDay.areaPerformance)}</b></div>
            <div><span>Qualidade</span><Bar ratio={oeeDay.areaQuality} tone="positive" label={`Qualidade ${pct(oeeDay.areaQuality)}`} /><b>{pct(oeeDay.areaQuality)}</b></div>
          </div>
          <a href={withBase(scenarioPath('/oee'))}>Entender perda →</a>
        </article>

        <article aria-labelledby="q-risk" className={styles.riskCard} data-tone={priorities[0] ? 'attentionStrong' : 'positive'}>
          <h2 id="q-risk">Principal risco</h2>
          {priorities[0] ? <>
            <span className={styles.riskIcon} aria-hidden="true">{lotHealthIcon[priorities[0].health.status]}</span>
            <strong className={styles.n1Value}>{priorities[0].resourceId} · Lote {priorities[0].lot.lotNumber}</strong>
            <small>{lotHealthLabel[priorities[0].health.status]}</small>
            <a href={withBase(scenarioPath('/production-execution'))}>Ver {priorities[0].resourceId} →</a>
          </> : <><strong className={styles.n1Value}>Nenhum</strong><small>Nenhum risco relevante identificado</small></>}
        </article>
      </section>

      <section className={styles.priorities} aria-label="Prioridades agora">
        <h2>Prioridades agora</h2>
        {priorities.length ? <ol>{priorities.map(({ resourceId, health, lot }) => <li key={resourceId}>
          <span aria-hidden="true">{lotHealthIcon[health.status]}</span>
          <div><strong>{resourceId} · Lote {lot.lotNumber}</strong><span>{lotHealthLabel[health.status]}</span></div>
          <a href={withBase(scenarioPath('/production-execution'))}>Ver {resourceId} →</a>
        </li>)}</ol> : <p>Nenhuma prioridade identificada nos fatos atuais.</p>}
      </section>

      <section className={styles.machines} aria-labelledby="machines-title">
        <div className={styles.machinesHead}><h2 id="machines-title">Situação das Máquinas</h2><StackedBar segments={(Object.entries(healthCounts) as [LotHealthStatus, number][]).filter(([, count]) => count > 0).map(([statusKey, count]) => ({ value: count, tone: statusKey === 'BEHIND_PLAN' || statusKey === 'LATE_NOT_STARTED' || statusKey === 'AT_RISK' ? 'attention' : statusKey === 'ON_TRACK' || statusKey === 'COMPLETED' ? 'positive' : 'neutral', label: `${lotHealthIcon[statusKey]} ${lotHealthLabel[statusKey]}: ${count}` }))} className={styles.machinesSummaryBar} /></div>
        <div className={styles.machineGrid}>{FOUNDRY_RESOURCE_IDS.map((resourceId) => { const { health } = healthByResource[resourceId]; const row = oeeRow(resourceId); return <a key={resourceId} className={styles.machineTile} href={withBase(scenarioPath('/production-execution'))}>
          <strong>{resourceId}</strong>
          <LotHealthIndicator health={health} compact />
          <span>{lotHealthLabel[health.status]}</span>
          <small>OEE {pct(row.oee)}</small>
        </a>; })}</div>
      </section>

      <section className={styles.n2Row} aria-label="Detalhes de apoio">
        <article aria-label="Aderência ao plano">
          <h3>Aderência ao plano</h3>
          <div className={styles.shiftBars}>{adherenceShifts.map((shift) => <div key={shift.shiftId} data-current={shift.shiftId === currentShift.shiftId || undefined}><span>{shift.shiftName}</span><Bar ratio={shift.total > 0 ? shift.ratio : null} tone="positive" label={`${shift.shiftName}: ${shift.total > 0 ? pct(shift.ratio) : 'N/A'}`} /><b>{shift.total > 0 ? `${shift.onPlan}/${shift.total}` : 'N/A'}</b></div>)}</div>
          <small>{adherenceDay.onPlan}/{adherenceDay.total} Lotes conforme plano no dia</small>
          <a href={withBase(scenarioPath('/production-adherence'))}>Ver Aderência →</a>
        </article>

        <article aria-label="Qualidade do dia">
          <h3>Qualidade do dia</h3>
          <StackedBar segments={[{ value: qualityDay.good, tone: 'positive', label: `Boas ${qualityDay.good}` }, { value: qualityDay.reject, tone: 'attention', label: `Refugo ${qualityDay.reject}` }, { value: qualityDay.rework, tone: 'neutral', label: `Retrabalho ${qualityDay.rework}` }]} />
          <small>{pct(qualityDay.qualityRate)} de qualidade · {qualityDay.produced} peças produzidas</small>
          <a href={withBase(scenarioPath('/production-quality'))}>Ver Qualidade →</a>
        </article>

        <article aria-label="Risco para a próxima etapa · Usinagem">
          <h3>Risco para a próxima etapa · Usinagem</h3>
          <div className={styles.downstream} data-tone={downstreamTone[downstream.status]}>
            <span className={styles.downstreamStatus}><span aria-hidden="true">{downstreamIcon[downstream.status]}</span> {downstreamLabel[downstream.status]}</span>
            <Bar ratio={downstream.projectedCoverageHours / downstream.targetCoverageHours} tone={downstreamTone[downstream.status] === 'positive' ? 'positive' : 'attention'} label={`Cobertura projetada ${downstream.projectedCoverageHours}h de referência ${downstream.targetCoverageHours}h`} />
            <small>{downstream.currentCoverageHours}h de cobertura / referência {downstream.targetCoverageHours}h · Projetada {downstream.projectedCoverageHours}h</small>
            <small>Material crítico: {downstream.criticalMaterial}</small>
          </div>
          {criticalMold ? <small className={styles.moldRisk}><span aria-hidden="true">△</span> Molde {criticalMold.code} ({criticalMold.resourceId}) próximo da manutenção · {Math.round(criticalMold.lifeUsedRatio * 100)}% da vida útil</small> : null}
          <a href={withBase(scenarioPath('/production-monitoring'))}>Ver Acompanhamento →</a>
        </article>
      </section>
    </div>
  </OperationalWorkspace>;
}
