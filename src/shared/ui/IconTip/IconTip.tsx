import styles from './IconTip.module.css';

/**
 * Compact "icon + value" pattern (glyph + short text) with an always-present
 * accessible name, plus an optional Nível 3 tooltip (hover + keyboard focus)
 * for detail that would otherwise sit permanently on screen.
 */
export function IconTip({ icon, label, value, tip, className }: { icon: string; label: string; value?: string; tip?: string; className?: string }) {
  const accessibleLabel = `${label}${value ? `: ${value}` : ''}${tip ? ` — ${tip}` : ''}`;
  return <span role="group" className={`${styles.iconTip} ${className ?? ''}`} tabIndex={tip ? 0 : undefined} data-tip={tip} aria-label={accessibleLabel}>
    <span aria-hidden="true">{icon}</span>
    {value !== undefined ? <b aria-hidden="true">{value}</b> : null}
  </span>;
}
