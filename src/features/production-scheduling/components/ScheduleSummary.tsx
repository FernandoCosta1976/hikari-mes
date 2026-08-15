import type { DemandDestination } from '../../../domain/production-scheduling/models';
import { destinationLabels, formatTime } from '../productionSchedulingViewModel';
import styles from '../ProductionSchedulingPage.module.css';
import type { ReactNode } from 'react';

export function ScheduleSummary({ quantity, lotCount, destinations, versionLabel, periodLabel, rangeStart, rangeFinish, revision }: { quantity: number; lotCount: number; destinations: Record<DemandDestination, number>; versionLabel: string; periodLabel: string; rangeStart: string; rangeFinish: string; revision?: ReactNode }) {
  return (
    <section className={styles.summary} aria-label="Compromisso do período">
      <div className={styles.commitment}>
        <p className={styles.overline} id="commitment-title">Compromisso · {periodLabel}</p>
        <strong>{quantity.toLocaleString('pt-BR')} <small>peças</small></strong>
        <span>{lotCount} Lotes · {formatTime(rangeStart)} → {formatTime(rangeFinish)}</span>
      </div>
      <div className={styles.destinations}>
        <p className={styles.overline}>Destinos da demanda</p>
        <div>{(Object.entries(destinationLabels) as [DemandDestination, string][]).map(([key, label]) => <span key={key}><strong>{destinations[key]}</strong><small>{label}</small></span>)}</div>
      </div>
      <div className={styles.version}>
        <p className={styles.overline}>Fonte do plano</p>
        <strong>Balancing</strong>
        <span>{versionLabel}</span>
        <small>Ordens correlacionadas: PyMAC</small>
        {revision}
      </div>
    </section>
  );
}
