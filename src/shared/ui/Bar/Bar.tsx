import styles from './Bar.module.css';

/** Horizontal progress/ratio bar — the preferred representation for proportion and comparison over plain numbers. */
export function Bar({ ratio, tone = 'positive', label, className }: { ratio: number | null; tone?: 'positive' | 'attention' | 'neutral'; label: string; className?: string }) {
  const percent = ratio === null ? 0 : Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  return <div className={`${styles.bar} ${className ?? ''}`} role="img" aria-label={label}>
    <div className={styles.fill} data-tone={ratio === null ? 'neutral' : tone} style={{ width: `${percent}%` }} />
  </div>;
}

/** Stacked segments bar (e.g. Good/Reject/Rework) — proportion of a whole, each segment individually labeled for accessibility. */
export function StackedBar({ segments, className }: { segments: readonly { value: number; tone: 'positive' | 'attention' | 'neutral'; label: string }[]; className?: string }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return <div className={`${styles.bar} ${styles.stacked} ${className ?? ''}`} role="img" aria-label={segments.map((segment) => segment.label).join(' · ')}>
    {total > 0 ? segments.filter((segment) => segment.value > 0).map((segment, index) => <div key={index} className={styles.fill} data-tone={segment.tone} style={{ width: `${(segment.value / total) * 100}%` }} />) : null}
  </div>;
}
