import type { Lot, Material } from '../../../domain/production-scheduling/models';
import styles from '../ProductionSchedulingPage.module.css';

export function OperationalAttentionSummary({ lots, materials }: { lots: readonly Lot[]; materials: readonly Material[] }) {
  const affected = lots.filter((lot) => lot.materialAttention);
  return (
    <details className={styles.contextSummary} id="material-attention">
      <summary className={styles.disclosureSummary}><span><span className={styles.step}>6</span><strong>Matéria-prima</strong><small>{affected.length ? `${affected.length} Lote requer atenção` : 'Sem atenção conhecida'}</small></span><b>Consultar atenção</b></summary>
      {affected.map((lot) => <p key={lot.id}><strong>Lote {lot.lotNumber}</strong> · {materials.find((item) => item.id === lot.materialId)?.name}<br /><small>A disponibilidade requer avaliação na preparação; este plano não decide liberação.</small></p>)}
    </details>
  );
}
