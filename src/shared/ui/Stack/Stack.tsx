import type { CSSProperties, ReactNode } from 'react';
import styles from './Stack.module.css';

const gaps = { small: 'var(--space-2)', medium: 'var(--space-4)', large: 'var(--space-8)' } as const;

export function Stack({ children, gap = 'medium' }: { children: ReactNode; gap?: keyof typeof gaps }) {
  return <div className={styles.stack} style={{ '--stack-gap': gaps[gap] } as CSSProperties}>{children}</div>;
}
