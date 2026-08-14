import type { CurrentResourceStateProjection, CurrentResourceProjectionState } from '../../../domain/current-resource-state/models';
import styles from '../ProductionSchedulingPage.module.css';

const stateLabels: Record<CurrentResourceProjectionState, string> = {
  CURRENT_PRODUCTION_KNOWN: 'Produção atual conhecida',
  NO_CURRENT_PRODUCTION_KNOWN: 'Sem produção corrente conhecida',
  INFORMATION_UNAVAILABLE: 'Informação indisponível',
  INFORMATION_STALE: 'Informação desatualizada',
  INFORMATION_PARTIAL: 'Informação parcial',
};

const freshnessLabels: Record<CurrentResourceStateProjection['freshness'], string> = {
  CURRENT: 'Atual',
  STALE: 'Informação desatualizada',
  UNAVAILABLE: 'Informação indisponível',
  PARTIAL: 'Informação parcial',
};

function formatObservedAt(value?: string) {
  if (!value) return 'Horário não informado';
  return `Observado às ${new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' }).format(new Date(value))}`;
}

function accessibleName(item: CurrentResourceStateProjection) {
  return [
    item.resourceId,
    stateLabels[item.activityState],
    item.currentLotReference ? `Lote ${item.currentLotReference}` : null,
    item.currentMaterial ?? null,
    freshnessLabels[item.freshness],
  ].filter(Boolean).join(', ');
}

export function FoundryResourceLandscape({ items }: { items: readonly CurrentResourceStateProjection[] }) {
  return (
    <section className={styles.resourceLandscape} aria-labelledby="resource-landscape-title" aria-describedby="resource-landscape-description resource-landscape-note">
      <header className={styles.resourceHeader}>
        <div>
          <span className={styles.overline}>Contexto operacional somente leitura</span>
          <h2 id="resource-landscape-title">Agora na Fundição</h2>
          <p id="resource-landscape-description">Estado observado · Cenário demonstrativo</p>
        </div>
        <p className={styles.resourceSource}><span>Origem</span><strong>Dados demonstrativos</strong></p>
      </header>

      <ul className={styles.resourceList} aria-label="Estado observado das máquinas da Fundição DC">
        {items.map((item) => (
          <li className={styles.resourceCard} data-freshness={item.freshness.toLowerCase()} aria-label={accessibleName(item)} key={item.resourceId}>
            <div className={styles.resourceCardHeader}>
              <strong>{item.resourceId}</strong>
              <span>{freshnessLabels[item.freshness]}</span>
            </div>
            <p className={styles.resourceState}>{stateLabels[item.activityState]}</p>
            <div className={styles.resourceContext}>
              {item.currentLotReference ? <span><small>Lote atual</small><strong>{item.currentLotReference}</strong></span> : null}
              {item.currentMaterial ? <span><small>Material</small><strong>{item.currentMaterial}</strong></span> : null}
              {item.activityState === 'INFORMATION_PARTIAL' && !item.currentMaterial ? <span><small>Material</small><strong>Não informado</strong></span> : null}
            </div>
            <p className={styles.resourceTimestamp}>{formatObservedAt(item.observedAt)}</p>
            <span className={styles.srOnly}>{item.receivedAt ? `Recebido separadamente às ${new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' }).format(new Date(item.receivedAt))}.` : 'Horário de recebimento não informado.'}</span>
          </li>
        ))}
      </ul>

      <p className={styles.resourceNote} id="resource-landscape-note">A situação atual não representa atribuição dos Lotes planejados às máquinas.</p>
    </section>
  );
}
