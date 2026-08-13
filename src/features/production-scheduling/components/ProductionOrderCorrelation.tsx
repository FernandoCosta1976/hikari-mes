import type { Lot, Material, ProductionOrder } from '../../../domain/production-scheduling/models';
import type { ReconciliationResult } from '../../../domain/production-scheduling/calculations';
import { Badge } from '../../../shared/ui/Badge/Badge';
import styles from '../ProductionSchedulingPage.module.css';

export function ProductionOrderCorrelation({ items, lots, materials }: { items: readonly { order: ProductionOrder; reconciliation: ReconciliationResult }[]; lots: readonly Lot[]; materials: readonly Material[] }) {
  return (
    <details className={styles.correlation} id="production-order-correlation">
      <summary className={styles.disclosureSummary}><span><span className={styles.step}>4</span><strong>Conciliação Balancing × PyMAC</strong><small>{items.some(({ reconciliation }) => reconciliation.status === 'DIVERGENT') ? '1 divergência requer avaliação' : `${items.length} Ordens conciliadas`}</small></span><b>Consultar correlação</b></summary>
      <div className={styles.correlationGrid}>
        {items.map(({ order, reconciliation }) => {
          const related = lots.filter((lot) => order.correlatedLotIds.includes(lot.id));
          const material = materials.find((item) => item.id === order.materialId)!;
          return <article key={order.id}>
            <header><strong>OP {order.orderNumber}</strong><Badge tone={reconciliation.status === 'MATCHED' ? 'positive' : 'attention'}>{reconciliation.status === 'MATCHED' ? 'Conciliada' : 'Divergência'}</Badge></header>
            <p>{material.name} · Ordem: {reconciliation.orderQuantity} peças</p>
            <p>{related.map((lot) => `Lote ${lot.lotNumber}`).join(' + ')} = {reconciliation.correlatedLotsQuantity} peças</p>
            {reconciliation.status === 'DIVERGENT' ? <p className={styles.attentionText}>Diferença informada: {Math.abs(reconciliation.difference)} peças. Nenhuma correção automática foi aplicada.</p> : null}
          </article>;
        })}
      </div>
    </details>
  );
}
