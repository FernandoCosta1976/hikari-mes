import { useState } from 'react';
import type { DataFreshness as DataFreshnessModel } from '../../../domain/production-scheduling/models';
import { Button } from '../../../shared/ui/Button/Button';
import { formatDate, formatDateTime, formatTime } from '../productionSchedulingViewModel';
import styles from '../ProductionSchedulingPage.module.css';

export function DataFreshness({ items }: { items: readonly DataFreshnessModel[] }) {
  const [open, setOpen] = useState(false);
  const stale = items.some((item) => item.state === 'STALE');
  return (
    <div className={styles.freshness}>
      <Button aria-expanded={open} aria-controls="freshness-detail" onClick={() => setOpen((value) => !value)}>
        ● {stale ? 'Defasado' : 'Atualizado'} · {formatTime(items[0].receivedAt)}
      </Button>
      {open ? (
        <section id="freshness-detail" className={styles.popover} aria-label="Detalhes da atualização dos dados">
          <h2>Confiabilidade das fontes</h2>
          {stale ? <p className={styles.attentionText}><strong>Plano de hoje ainda não recebido.</strong> Exibindo a última programação disponível.</p> : null}
          {items.map((item) => (
            <dl key={item.source} className={styles.inlineDefinition}>
              <div><dt>Fonte</dt><dd>{item.source}</dd></div>
              <div><dt>Data da informação</dt><dd>{formatDate(item.businessDate)}</dd></div>
              <div><dt>Última recepção</dt><dd>{formatDateTime(item.receivedAt)}</dd></div>
              <div><dt>Estado</dt><dd>{item.state === 'CURRENT' ? 'Atual' : 'Defasado'}</dd></div>
            </dl>
          ))}
        </section>
      ) : null}
    </div>
  );
}
