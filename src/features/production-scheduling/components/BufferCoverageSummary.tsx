import type { BufferPosition, Material } from '../../../domain/production-scheduling/models';
import { projectedAvailableQuantity } from '../../../domain/production-scheduling/calculations';
import styles from '../ProductionSchedulingPage.module.css';

export function BufferCoverageSummary({ positions, materials }: { positions: readonly BufferPosition[]; materials: readonly Material[] }) {
  return (
    <details className={styles.contextSummary} id="buffer-coverage">
      <summary className={styles.disclosureSummary}><span><span className={styles.step}>5</span><strong>Cobertura de material</strong><small>Atual → Após o plano</small></span><b>Consultar cobertura</b></summary>
      <div className={styles.coverageRows}>
        {positions.map((position) => <div key={position.materialId}>
          <strong>{materials.find((item) => item.id === position.materialId)?.name}</strong>
          <span>Atual <b>{position.currentCoverageDays.toLocaleString('pt-BR')} dias</b></span>
          <span className={styles.coverageArrow} aria-hidden="true">→</span>
          <span>Após o plano <b>{position.projectedCoverageDays.toLocaleString('pt-BR')} dias</b></span>
          <span>Referência demonstrativa <b>≥ {position.targetCoverageDays} dias</b></span>
          <small>Disponível projetado: {projectedAvailableQuantity(position)} peças</small>
        </div>)}
      </div>
      <p className={styles.contextNote}>Cobertura projetada considera quantidade disponível + produção programada esperada − consumo futuro planejado. Reservas não são disponibilidade livre.</p>
    </details>
  );
}
