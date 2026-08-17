import { useState } from 'react';
import type { Lot } from '../../../domain/production-scheduling/models';
import type { LotReadinessAssessment } from '../../../domain/production-readiness/models';
import { FOUNDRY_RESOURCE_IDS, type FoundryResourceId } from '../../../domain/resource/models';
import type { SequenceMoveResult } from '../../../domain/production-scheduling/sequencing';
import { formatTime } from '../productionSchedulingViewModel';
import { Button } from '../../../shared/ui/Button/Button';
import styles from '../ProductionSchedulingPage.module.css';

const statusLabel = { READY: 'Com condição', ATTENTION: 'Atenção', BLOCKED: 'Sem condição', UNKNOWN: 'Desconhecido' } as const;

export function SimulationWorkspace({ active, selectedLot, allLots, readiness, impact, rejection, comparing, alreadyReleased, locked, onActivate, onSimulate, onUndo, onDiscard, onCompare, onAdopt }: { active: boolean; selectedLot: Lot | null; allLots: readonly Lot[]; readiness?: LotReadinessAssessment; impact: SequenceMoveResult | null; rejection: string | null; comparing: boolean; alreadyReleased?: boolean; locked?: boolean; onActivate: () => void; onSimulate: (resourceId: FoundryResourceId, anchorLotId: string | null) => void; onUndo: () => void; onDiscard: () => void; onCompare: () => void; onAdopt: () => void }) {
  const [pendingResourceId, setPendingResourceId] = useState<FoundryResourceId | null>(null);
  if (!active) return <Button onClick={onActivate}><span aria-hidden="true">◇</span> Avaliar cenário</Button>;

  const positionOptionsFor = (resourceId: FoundryResourceId) => selectedLot ? allLots.filter((lot) => lot.scheduledResourceId === resourceId && lot.id !== selectedLot.id).sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart)) : [];

  return <section className={styles.simulationWorkspace} aria-label="Avaliação de cenário">
    <header><div><strong>AVALIAR CENÁRIO</strong><span>{impact ? '1 movimentação' : '0 alterações'}</span></div><div><Button disabled={!impact} onClick={onCompare}>Comparar</Button><Button onClick={onDiscard}>Encerrar avaliação</Button></div></header>
    <p className={styles.simulationCallout}>As alterações abaixo são uma simulação e não alteram o plano vigente.</p>
    {selectedLot && locked ? <p className={styles.adoptWarning}>Lote {selectedLot.lotNumber} já iniciado/pausado/concluído — programação operacional bloqueada para execução em andamento.</p> : selectedLot && readiness ? <div className={styles.keyboardTargets}>
      <strong>Lote {selectedLot.lotNumber} · {selectedLot.quantity} peças</strong>
      <span>Programação atual: {selectedLot.scheduledResourceId}. Escolha uma máquina (pode ser a mesma, para reordenar) e depois uma posição.</span>
      <div>{FOUNDRY_RESOURCE_IDS.map((resourceId) => {
        const resource = readiness.resources.find((item) => item.resourceId === resourceId)!;
        const sameResource = resourceId === selectedLot.scheduledResourceId;
        const invalid = !sameResource && (!resource.eligible || resource.status === 'BLOCKED');
        return <Button key={resourceId} disabled={invalid} aria-pressed={pendingResourceId === resourceId} onClick={() => setPendingResourceId(resourceId)}><b>{resourceId}</b><small>{sameResource ? 'Programada · reordenar' : resource.eligible ? statusLabel[resource.status] : 'Não elegível'}</small></Button>;
      })}</div>
      {pendingResourceId ? <div className={styles.positionTargets} aria-label={`Posição na ${pendingResourceId}`}>
        <span>Inserir na {pendingResourceId}:</span>
        <Button onClick={() => onSimulate(pendingResourceId, null)}>No início</Button>
        {positionOptionsFor(pendingResourceId).map((lot) => <Button key={lot.id} onClick={() => onSimulate(pendingResourceId, lot.id)}>Depois de Lote {lot.lotNumber} ({formatTime(lot.scheduledFinish)})</Button>)}
      </div> : null}
    </div> : <p>Selecione um Lote para avaliar outra máquina ou posição.</p>}
    {rejection ? <p className={styles.simulationRejection} role="alert">{rejection}</p> : null}
    {impact ? <div className={styles.simulationSummary}>
      <h3>Cenário simulado</h3>
      <dl>
        <div><dt>Lote movido</dt><dd>Lote {selectedLot?.lotNumber}</dd></div>
        <div><dt>Origem</dt><dd>{impact.originResourceId}</dd></div>
        <div><dt>Destino</dt><dd>{impact.destinationResourceId}</dd></div>
        <div><dt>Requirements impactados</dt><dd>{impact.affectedLotIds.length}</dd></div>
        <div><dt>Horário original</dt><dd>{formatTime(impact.originalStart)}–{formatTime(impact.originalFinish)}</dd></div>
        <div><dt>Novo horário</dt><dd>{formatTime(impact.newStart)}–{formatTime(impact.newFinish)}</dd></div>
        <div><dt>Setups (plano vigente)</dt><dd>{impact.baselineSetupCount}</dd></div>
        <div><dt>Setups (simulação)</dt><dd>{impact.simulatedSetupCount}</dd></div>
        <div><dt>Δ Setups</dt><dd>{impact.netSetupDeltaCount > 0 ? '+' : ''}{impact.netSetupDeltaCount}</dd></div>
        <div><dt>Término {impact.originResourceId} (plano vigente)</dt><dd>{formatTime(impact.originLastFinishBaseline)}</dd></div>
        <div><dt>Término {impact.originResourceId} (simulação)</dt><dd>{formatTime(impact.originLastFinishSimulated)}{impact.originClosingDeltaMinutes !== 0 ? ` (${impact.originClosingDeltaMinutes > 0 ? '+' : ''}${impact.originClosingDeltaMinutes} min)` : ''}</dd></div>
        {impact.destinationResourceId !== impact.originResourceId ? <><div><dt>Término {impact.destinationResourceId} (plano vigente)</dt><dd>{formatTime(impact.destinationLastFinishBaseline)}</dd></div><div><dt>Término {impact.destinationResourceId} (simulação)</dt><dd>{formatTime(impact.destinationLastFinishSimulated)}{impact.destinationClosingDeltaMinutes !== 0 ? ` (${impact.destinationClosingDeltaMinutes > 0 ? '+' : ''}${impact.destinationClosingDeltaMinutes} min)` : ''}</dd></div></> : null}
      </dl>
      <div className={styles.adoptRow}>
        <Button onClick={onUndo}>Desfazer</Button>
        <Button disabled={locked} onClick={onAdopt}>Confirmar nova programação</Button>
        {alreadyReleased ? <span className={styles.adoptWarning}>Lote já liberado na máquina programada — revisar Liberação após confirmar.</span> : null}
      </div>
      {impact.affectedLotIds.length ? <p className={styles.sectionNote}>Confirmar aplica a máquina do Lote movido. O sequenciamento completo dos {impact.affectedLotIds.length} requirement(s) impactado(s) permanece como simulação — aplicação definitiva de sequenciamento ainda não governada.</p> : null}
      {comparing ? <section className={styles.simulationComparison} aria-label="Comparação Plano recebido versus Simulação"><h3>Plano recebido versus Simulação</h3><p>Máquina original: {impact.originResourceId} · Máquina simulada: {impact.destinationResourceId} · Δ Setups {impact.netSetupDeltaCount > 0 ? '+' : ''}{impact.netSetupDeltaCount} · Requirements impactados: {impact.affectedLotIds.length} · Fechamento {impact.destinationResourceId}: {impact.destinationClosingDeltaMinutes > 0 ? '+' : ''}{impact.destinationClosingDeltaMinutes} min.</p></section> : null}
    </div> : null}
  </section>;
}
