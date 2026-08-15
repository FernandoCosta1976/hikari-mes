import { useRef, useState, type ReactNode } from 'react';
import styles from './DemoShell.module.css';
import { WorkspaceSidebarContext } from '../providers/WorkspaceSidebarContext';

export function DemoShell({ children }: { children: ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const sidebarButton = useRef<HTMLButtonElement>(null);
  return (
    <WorkspaceSidebarContext.Provider value={{ expanded: sidebarExpanded, setExpanded: setSidebarExpanded, toggleButtonRef: sidebarButton }}><div className={styles.shell}>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>HIKARI MES · Protótipo Navegável Executivo · Cenário demonstrativo</footer>
    </div></WorkspaceSidebarContext.Provider>
  );
}
