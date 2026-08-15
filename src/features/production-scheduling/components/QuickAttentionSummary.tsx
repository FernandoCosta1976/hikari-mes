import styles from '../ProductionSchedulingPage.module.css';

export function QuickAttentionSummary({ materialAttentionCount, belowCurrentTargetCount, hasDivergence, readinessCounts, onOpenReadiness }: { materialAttentionCount: number; belowCurrentTargetCount: number; hasDivergence: boolean; readinessCounts?: { ready: number; attention: number; blocked: number; unknown: number }; onOpenReadiness?: () => void }) {
  const reveal = (id: string) => {
    const target = document.getElementById(id);
    if (target instanceof HTMLDetailsElement) target.open = true;
  };
  return (
    <section className={styles.quickAttention} aria-labelledby="quick-attention-title">
      <div><span className={styles.overline}>Leitura rápida</span><h2 id="quick-attention-title">O que merece atenção antes da preparação?</h2></div>
      <a href="#material-attention" onClick={() => reveal('material-attention')}><strong>Matéria-prima</strong><span>{materialAttentionCount} Lote requer atenção</span></a>
      <a href="#buffer-coverage" onClick={() => reveal('buffer-coverage')}><strong>Buffer</strong><span>{belowCurrentTargetCount} {belowCurrentTargetCount === 1 ? 'Material abaixo' : 'Materiais abaixo'} da referência atual</span></a>
      <a href="#production-order-correlation" onClick={() => reveal('production-order-correlation')}><strong>Conciliação</strong><span>{hasDivergence ? '1 divergência informada' : 'Sem divergência no plano atual'}</span></a>
      <a href="#schedule-revision" onClick={() => reveal('schedule-revision')}><strong>Plano</strong><span>Versão atualizada · ver alterações</span></a>
      {readinessCounts && onOpenReadiness ? <button className={styles.readinessSummaryLink} onClick={onOpenReadiness}><strong>Preparação</strong><span>{readinessCounts.ready} OK · {readinessCounts.attention} atenção · {readinessCounts.blocked} imped. · {readinessCounts.unknown} desconhec.</span></button> : null}
    </section>
  );
}
