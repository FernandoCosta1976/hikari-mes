import { useState, type ReactNode } from 'react';
import { useApplicationContext } from '../providers/ApplicationContext';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { Badge } from '../../shared/ui/Badge/Badge';
import { Button } from '../../shared/ui/Button/Button';
import { Stack } from '../../shared/ui/Stack/Stack';
import styles from './DemoShell.module.css';

export function DemoShell({ children }: { children: ReactNode }) {
  const [contextOpen, setContextOpen] = useState(false);
  const { productiveArea, resetApplicationContext } = useApplicationContext();
  const resetScenario = useScenarioStore((state) => state.resetScenario);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <a className={styles.brand} href="/demo/fundicao-dc/production-scheduling" aria-label="HIKARI MES — início demonstrativo">
          <span>HIKARI</span><small>MES</small>
        </a>
        <nav aria-label="Navegação principal demonstrativa">
          <a className={styles.activeNav} href="/demo/fundicao-dc/production-scheduling">Programação</a>
        </nav>
        <div className={styles.context}>
          <Badge tone="informational">Cenário demonstrativo</Badge>
          <Button onClick={() => setContextOpen((open) => !open)} aria-expanded={contextOpen}>Área: {productiveArea.label}</Button>
        </div>
      </header>
      {contextOpen ? (
        <aside className={styles.contextPanel} aria-label="Contexto da aplicação">
          <Stack gap="small">
            <strong>Área Produtiva</strong>
            <span>{productiveArea.label}</span>
            <div className={styles.actions}>
              <Button onClick={resetApplicationContext}>Redefinir contexto</Button>
              <Button onClick={resetScenario}>Reiniciar cenário</Button>
            </div>
          </Stack>
        </aside>
      ) : null}
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>HIKARI MES · Fundação do protótipo navegável</footer>
    </div>
  );
}
