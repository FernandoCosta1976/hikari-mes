import { useEffect, useMemo, useState } from 'react';
import { useApplicationContext } from '../../app/providers/ApplicationContext';
import { selectProductionScheduling, useScenarioStore, type Wf001ScenarioId } from '../../demo/scenario-engine/scenarioStore';
import type { DemandDestination, Lot } from '../../domain/production-scheduling/models';
import { Badge } from '../../shared/ui/Badge/Badge';
import { Button } from '../../shared/ui/Button/Button';
import { BufferCoverageSummary } from './components/BufferCoverageSummary';
import { DataFreshness } from './components/DataFreshness';
import { HourByHourSchedule } from './components/HourByHourSchedule';
import { LotDetail } from './components/LotDetail';
import { OperationalAttentionSummary } from './components/OperationalAttentionSummary';
import { ProductionOrderCorrelation } from './components/ProductionOrderCorrelation';
import { ScheduleSummary } from './components/ScheduleSummary';
import { ScheduleRevisionSummary } from './components/ScheduleRevisionSummary';
import { QuickAttentionSummary } from './components/QuickAttentionSummary';
import { FoundryResourceLandscape } from './components/FoundryResourceLandscape';
import { buildProductionSchedulingViewModel, destinationLabels, formatDate, scenarioLabels } from './productionSchedulingViewModel';
import styles from './ProductionSchedulingPage.module.css';

export function ProductionSchedulingPage() {
  const definition = useScenarioStore(selectProductionScheduling);
  const selectedDateOffset = useScenarioStore((state) => state.selectedDateOffset);
  const selectedDestination = useScenarioStore((state) => state.selectedDestination);
  const activeScheduleVersionId = useScenarioStore((state) => state.activeScheduleVersionId);
  const comparisonScheduleVersionId = useScenarioStore((state) => state.comparisonScheduleVersionId);
  const activeWf001ScenarioId = useScenarioStore((state) => state.activeWf001ScenarioId);
  const resetRevision = useScenarioStore((state) => state.resetRevision);
  const selectDateOffset = useScenarioStore((state) => state.selectDateOffset);
  const filterByDestination = useScenarioStore((state) => state.filterByDestination);
  const compareWithPreviousVersion = useScenarioStore((state) => state.compareWithPreviousVersion);
  const closeVersionComparison = useScenarioStore((state) => state.closeVersionComparison);
  const activateScenario = useScenarioStore((state) => state.activateWf001Scenario);
  const resetScenario = useScenarioStore((state) => state.resetScenario);
  const { productiveArea } = useApplicationContext();
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

  useEffect(() => { setSelectedLot(null); }, [resetRevision]);
  useEffect(() => {
    if (activeWf001ScenarioId === 'SCN-WF001-08' && definition) setSelectedLot(definition.lots.find((lot) => lot.id === 'lot-252') ?? null);
  }, [activeWf001ScenarioId, definition]);

  const view = useMemo(() => definition ? buildProductionSchedulingViewModel(definition, selectedDateOffset, selectedDestination, activeWf001ScenarioId) : null, [definition, selectedDateOffset, selectedDestination, activeWf001ScenarioId]);
  if (!definition || !view) return <p>Preparando cenário demonstrativo…</p>;
  const workCenter = definition.workCenters.find((item) => item.id === view.schedule.workCenterId)!;
  const version = definition.scheduleVersions.find((item) => item.id === activeScheduleVersionId)!;
  const previousVersion = definition.scheduleVersions.find((item) => item.id === 'v07')!;
  const previousSchedule = definition.schedules.find((item) => item.id === 'schedule-2025-05-15-v07')!;
  const previousLots = previousSchedule.lotIds.map((id) => definition.lots.find((lot) => lot.id === id)!).filter(Boolean);
  const selectedMaterial = selectedLot ? definition.materials.find((item) => item.id === selectedLot.materialId)! : null;
  const selectedOrder = selectedLot ? definition.productionOrders.find((item) => item.id === selectedLot.productionOrderId)! : null;
  const stale = view.freshness.some((item) => item.state === 'STALE');
  const closeLotDetail = () => {
    const lotId = selectedLot?.id;
    setSelectedLot(null);
    if (lotId) requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-lot-id="${lotId}"]`)?.focus());
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div><span className={styles.eyebrow}>Programação da Produção · Plano Hora-Hora</span><h1>O que precisamos produzir?</h1><p>Visão do plano demonstrativo recebido do Balancing para o curto prazo.</p></div>
        <DataFreshness key={resetRevision} items={view.freshness} />
      </header>

      {stale ? <div className={styles.staleBanner} role="status"><strong>Plano de hoje ainda não recebido.</strong> A última programação disponível é de 14/05/2025 às 18:30 e está identificada como defasada.</div> : null}
      {view.hasDivergence ? <div className={styles.attentionBanner} role="status"><strong>Divergência informada.</strong> A quantidade da Ordem de Produção não corresponde à soma dos Lotes correlacionados.</div> : null}
      {activeWf001ScenarioId === 'SCN-WF001-02' ? <div className={styles.staleBanner} role="status"><strong>Reservas preservadas.</strong> Quantidades de Reposição e Engenharia permanecem reservadas e não são tratadas como disponibilidade livre para Montagem.</div> : null}
      {activeWf001ScenarioId === 'SCN-WF001-03' ? <div className={styles.staleBanner} role="status"><strong>Cobertura recuperada pelo plano.</strong> O Material A parte de 2,4 dias e alcança 3,1 dias de cobertura projetada no cenário demonstrativo.</div> : null}
      {activeWf001ScenarioId === 'SCN-WF001-04' ? <div className={styles.attentionBanner} role="status"><strong>Atenção de matéria-prima.</strong> O Lote 254 requer avaliação na próxima etapa; nenhuma decisão de liberação foi tomada.</div> : null}

      <ScheduleSummary quantity={view.totalQuantity} lotCount={view.scheduledLots.length} destinations={view.destinationQuantities} versionLabel={version.label} />

      <QuickAttentionSummary materialAttentionCount={view.scheduledLots.filter((lot) => lot.materialAttention).length} belowCurrentTargetCount={definition.bufferPositions.filter((position) => position.currentCoverageDays < position.targetCoverageDays).length} hasDivergence={view.hasDivergence} />

      <section className={styles.controls} aria-label="Controles do plano">
        <label>Área Produtiva<select value={productiveArea.id} disabled aria-label="Área Produtiva"><option value={productiveArea.id}>{productiveArea.label}</option></select></label>
        <fieldset><legend>Período do plano</legend>{(['Hoje', 'D+1', 'D+2', 'D+3'] as const).map((label, index) => <Button key={label} aria-pressed={selectedDateOffset === index} onClick={() => selectDateOffset(index as 0 | 1 | 2 | 3)}>{label}</Button>)}</fieldset>
        <label>Destino<select aria-label="Destino" value={selectedDestination} onChange={(event) => filterByDestination(event.target.value as DemandDestination | 'ALL')}><option value="ALL">Todos os destinos</option>{(Object.entries(destinationLabels) as [DemandDestination, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Variação demonstrativa<select aria-label="Variação demonstrativa" value={activeWf001ScenarioId} onChange={(event) => activateScenario(event.target.value as Wf001ScenarioId)}>{(Object.entries(scenarioLabels) as [Wf001ScenarioId, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <Button onClick={compareWithPreviousVersion}>Comparar plano anterior</Button>
        <Button onClick={() => { resetScenario(); setSelectedLot(null); }}>Reiniciar cenário</Button>
      </section>

      <p className={styles.businessDate}>Data da informação: <strong>{formatDate(view.schedule.businessDate)}</strong> · <Badge tone="neutral">Cenário demonstrativo</Badge></p>

      <ScheduleRevisionSummary activeVersion={version} previousVersion={previousVersion} receivedAt={view.schedule.receivedAt} activeLots={view.scheduledLots} previousLots={previousLots} />

      {comparisonScheduleVersionId ? <section className={styles.comparison} aria-labelledby="comparison-title"><div><span className={styles.step}>2</span><h2 id="comparison-title">Comparação de versões demonstrativas</h2></div><p><strong>Versão 08 × Versão 07:</strong> Lote 252 movido na sequência; Lote 256 incluído; horários atualizados. O baseline anterior permanece preservado.</p><Button onClick={closeVersionComparison}>Fechar comparação</Button></section> : null}

      <div className={styles.timelineLayout} data-detail-open={selectedLot ? 'true' : 'false'}>
        <HourByHourSchedule lots={view.lots} materials={definition.materials} workCenter={workCenter} selectedLotId={selectedLot?.id ?? null} onSelectLot={setSelectedLot} />
        {selectedLot && selectedMaterial && selectedOrder ? <LotDetail lot={selectedLot} material={selectedMaterial} order={selectedOrder} workCenter={workCenter} onClose={closeLotDetail} /> : null}
      </div>

      <FoundryResourceLandscape />

      <ProductionOrderCorrelation items={view.orders} lots={view.scheduledLots} materials={definition.materials} />
      <div className={styles.lowerGrid}><BufferCoverageSummary positions={definition.bufferPositions} materials={definition.materials} /><OperationalAttentionSummary lots={view.scheduledLots} materials={definition.materials} /></div>
      <section className={styles.nextStep}><div><span className={styles.step}>7</span><h2>Próxima decisão</h2><p>A preparação será avaliada na próxima experiência, sem atribuir Recurso, liberar ou iniciar produção aqui.</p></div><Button onClick={() => setSelectedLot(view.scheduledLots[0] ?? null)}>Selecionar um Lote para avaliar preparação</Button></section>
    </div>
  );
}
