import { withBase } from '../../../app/routing/basePath';
import { useScenarioPath } from '../../../app/routing/useScenarioPath';
import type { Lot, Material } from '../../../domain/production-scheduling/models';
import { Button } from '../../../shared/ui/Button/Button';
import { formatTime } from '../productionSchedulingViewModel';
import styles from '../ProductionSchedulingPage.module.css';

export interface ReleaseGroupRow { lot: Lot; material: Material; reason: string; stateLabel: string }

const groupTitle: Record<string, string> = { ready: 'Lotes prontos para liberar', attention: 'Lotes que requerem atenção', blocked: 'Lotes bloqueados', released: 'Lotes liberados' };

/**
 * Section 22 of the demonstrative brief: clicking a Liberação group count
 * must never silently jump to the first matching Lot — it opens this list,
 * and each row explicitly decides where to go next (Abrir Ordem).
 */
export function ReleaseGroupDrawer({ group, rows, onClose }: { group: keyof typeof groupTitle; rows: readonly ReleaseGroupRow[]; onClose: () => void }) {
  const scenarioPath = useScenarioPath();
  return <aside className={styles.releaseGroupDrawer} role="dialog" aria-modal="false" aria-labelledby="release-group-title">
    <header><div><small>Decisão de liberação</small><h2 id="release-group-title">{groupTitle[group]}</h2></div><Button autoFocus onClick={onClose}>Fechar</Button></header>
    {rows.length ? <ul>{rows.map(({ lot, material, reason, stateLabel }) => <li key={lot.id}>
      <div><strong>Lote {lot.lotNumber}</strong><span>{material.name} · {lot.quantity} peças</span></div>
      <div><span>{lot.scheduledResourceId}</span><span>{formatTime(lot.scheduledStart)}</span></div>
      <div className={styles.releaseGroupReason}><span>{reason}</span><small>{stateLabel}</small></div>
      <a href={withBase(scenarioPath(`/orders/${lot.id}`))}>Abrir Ordem →</a>
    </li>)}</ul> : <p>Nenhum Lote neste grupo.</p>}
  </aside>;
}
