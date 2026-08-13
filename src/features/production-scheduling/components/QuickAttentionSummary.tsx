import styles from '../ProductionSchedulingPage.module.css';

export function QuickAttentionSummary({ materialAttentionCount, belowCurrentTargetCount, hasDivergence }: { materialAttentionCount: number; belowCurrentTargetCount: number; hasDivergence: boolean }) {
  return (
    <section className={styles.quickAttention} aria-labelledby="quick-attention-title">
      <div><span className={styles.overline}>Leitura rápida</span><h2 id="quick-attention-title">O que merece atenção antes da preparação?</h2></div>
      <a href="#material-attention"><strong>Matéria-prima</strong><span>{materialAttentionCount} Lote requer atenção</span></a>
      <a href="#buffer-coverage"><strong>Buffer</strong><span>{belowCurrentTargetCount} {belowCurrentTargetCount === 1 ? 'Material abaixo' : 'Materiais abaixo'} da referência atual</span></a>
      <a href="#production-order-correlation"><strong>Conciliação</strong><span>{hasDivergence ? '1 divergência informada' : 'Sem divergência no plano atual'}</span></a>
      <a href="#schedule-revision"><strong>Plano</strong><span>Versão atualizada · ver alterações</span></a>
    </section>
  );
}
