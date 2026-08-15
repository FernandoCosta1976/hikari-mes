import { Button } from '../../../shared/ui/Button/Button';
import styles from '../ProductionSchedulingPage.module.css';

export interface ReleaseDecisionCounts { ready: number; attention: number; blocked: number; released: number }

export function ReleaseDecisionSummary({ counts, onOpen }: { counts: ReleaseDecisionCounts; onOpen: (group: keyof ReleaseDecisionCounts) => void }) {
  return <section className={styles.releaseSummary} aria-labelledby="release-summary-title"><div><span className={styles.step}>4</span><h2 id="release-summary-title">Decisão de liberação</h2><p>Visão por exceção · regra demonstrativa</p></div><nav aria-label="Estados de liberação"><Button onClick={() => onOpen('ready')}><strong>{counts.ready}</strong><span>Prontos para liberar</span></Button><Button onClick={() => onOpen('attention')}><strong>{counts.attention}</strong><span>Requerem atenção</span></Button><Button onClick={() => onOpen('blocked')}><strong>{counts.blocked}</strong><span>Bloqueados</span></Button><Button onClick={() => onOpen('released')} disabled={counts.released === 0}><strong>{counts.released}</strong><span>Liberados</span></Button></nav></section>;
}
