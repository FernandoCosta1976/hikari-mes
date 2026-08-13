import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'informational' | 'positive' | 'attention' | 'unavailable' }) {
  return <span className={styles.badge} data-tone={tone}>{children}</span>;
}
