import type { Lot, ScheduleVersion } from '../../../domain/production-scheduling/models';
import { compareScheduleLots } from '../../../domain/production-scheduling/calculations';
import { formatDateTime } from '../productionSchedulingViewModel';
import styles from '../ProductionSchedulingPage.module.css';

const changeLabels = {
  ADDED: 'incluído',
  REMOVED: 'removido',
  MOVED: 'reposicionado',
  TIME_CHANGED: 'horário alterado',
  QUANTITY_CHANGED: 'quantidade alterada',
} as const;

export function ScheduleRevisionSummary({ activeVersion, previousVersion, receivedAt, activeLots, previousLots }: { activeVersion: ScheduleVersion; previousVersion: ScheduleVersion; receivedAt: string; activeLots: readonly Lot[]; previousLots: readonly Lot[] }) {
  const changes = compareScheduleLots(previousLots, activeLots);
  const counts = changes.flatMap((item) => item.changes).reduce<Record<string, number>>((result, change) => ({ ...result, [change]: (result[change] ?? 0) + 1 }), {});
  return (
    <details className={styles.revision} id="schedule-revision">
      <summary>
        <span><strong>Alterações do plano</strong><small>{activeVersion.label} · recebida {formatDateTime(receivedAt)}</small></span>
        <span className={styles.revisionCounts} aria-label="Resumo das alterações desde a versão anterior">
          <b>{counts.ADDED ?? 0} Lote incluído</b><b>{counts.MOVED ?? 0} Lotes reposicionados</b>
        </span>
      </summary>
      <div className={styles.revisionDetail}>
        <p><strong>Desde {previousVersion.label}</strong> — comparação demonstrativa, sem definir mecanismo técnico externo.</p>
        <ul>{changes.map((item) => <li key={item.lotId}><strong>{item.lotId.replace('lot-', 'Lote ')}</strong>: {item.changes.map((change) => changeLabels[change]).join(', ')}.</li>)}</ul>
      </div>
    </details>
  );
}
