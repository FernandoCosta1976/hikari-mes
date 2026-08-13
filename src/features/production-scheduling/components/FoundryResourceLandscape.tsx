import styles from '../ProductionSchedulingPage.module.css';

const foundryResources = ['DC01', 'DC02', 'DC03', 'DC04', 'DC05'] as const;

export function FoundryResourceLandscape() {
  return (
    <section className={styles.resourceLandscape} aria-labelledby="resource-landscape-title" aria-describedby="resource-landscape-description">
      <header className={styles.resourceHeader}>
        <div>
          <span className={styles.overline}>Contexto físico da área</span>
          <h2 id="resource-landscape-title">Máquinas da Fundição DC</h2>
          <p id="resource-landscape-description">A Fundição DC possui 5 máquinas físicas.</p>
        </div>
        <p className={styles.resourceAssignment}><span>Atribuição dos Lotes</span><strong>Ainda não realizada</strong></p>
      </header>
      <div className={styles.resourceList} role="list" aria-label="Máquinas da Fundição DC">
        {foundryResources.map((resource) => <span role="listitem" aria-label={`Máquina ${resource}, sem Lote atribuído`} key={resource}>{resource}</span>)}
      </div>
      <p className={styles.resourceNote}>A elegibilidade e a disponibilidade das máquinas serão avaliadas na preparação.</p>
    </section>
  );
}
