import { lotHealthIcon, lotHealthLabel, lotHealthTone, type LotHealthProjection } from '../../../domain/production-execution/lotHealth';
import styles from './LotHealthIndicator.module.css';

export interface LotHealthContext {
  lotLabel: string;
  material: string;
  quantity: number;
  resourceId: string;
  scheduledStart: string;
  scheduledFinish: string;
}

/**
 * Single canonical rendering of Lot Execution Health: same icon/tone/label/tooltip
 * everywhere it appears. All classification happens in assessLotExecutionHealth —
 * this component only renders the already-computed projection.
 */
export function LotHealthIndicator({ health, context, compact = false }: { health: LotHealthProjection; context?: LotHealthContext; compact?: boolean }) {
  const icon = lotHealthIcon[health.status];
  const label = lotHealthLabel[health.status];
  const tone = lotHealthTone[health.status];
  const facts = [
    context ? `Lot ${context.lotLabel} · ${context.material} · ${context.quantity} peças` : null,
    health.cycleTimeSecondsPerPiece !== null ? `Engineering Cycle Time ${health.cycleTimeSecondsPerPiece}s/peça` : null,
    health.productionDurationSeconds !== null ? `Duração de produção ${Math.round(health.productionDurationSeconds / 60)} min` : null,
    context ? `Scheduled Start ${context.scheduledStart} · Scheduled Finish ${context.scheduledFinish}` : null,
    context ? `Resource ${context.resourceId}` : null,
    health.startedLate && health.startDeviationMinutes !== null ? `Início atrasado +${health.startDeviationMinutes} min` : null,
    health.expectedQuantityNow !== null && health.gapQuantity !== null ? `Esperado agora ${health.expectedQuantityNow} · Gap ${health.gapQuantity}` : null,
    health.projectedFinish !== null ? `Projeção de término ${health.projectedFinish}` : null,
  ].filter((part): part is string => part !== null);
  const tip = [`Execution Health: ${label}`, ...facts].join(' · ');
  return (
    <span className={styles.indicator} data-tone={tone} data-compact={compact || undefined} tabIndex={0} data-tip={tip} role="group" aria-label={`Execution Health: ${label} — ${tip}`}>
      <span aria-hidden="true">{icon}</span>
      {!compact ? <b>{label}</b> : null}
    </span>
  );
}
