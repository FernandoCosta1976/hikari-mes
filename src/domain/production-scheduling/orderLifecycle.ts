import type { ProductionExecutionRecord } from '../production-execution/models';
import type { ReadinessStatus } from '../production-readiness/models';

/**
 * Operational lifecycle of the Order/Lot — distinct from Readiness, Release,
 * Organization and Lot Health, which are separate, independently governed
 * facts about the same Lot (see section 29 of the demonstrative brief).
 */
export type OrderLifecycleStatus = 'BACKLOG' | 'EM_PREPARACAO' | 'PREPARADA' | 'PRODUZINDO' | 'PAUSADA' | 'PRODUZIDA';

export const orderLifecycleLabel: Record<OrderLifecycleStatus, string> = {
  BACKLOG: 'No backlog',
  EM_PREPARACAO: 'Em preparação',
  PREPARADA: 'Preparada',
  PRODUZINDO: 'Produzindo',
  PAUSADA: 'Pausada',
  PRODUZIDA: 'Produzida',
};

export const ORDER_LIFECYCLE_SEQUENCE: readonly OrderLifecycleStatus[] = ['BACKLOG', 'EM_PREPARACAO', 'PREPARADA', 'PRODUZINDO', 'PRODUZIDA'];

/**
 * Derived from the same governed facts (Readiness, Execution) that already
 * exist — not a new source of truth. A manual "preparação concluída"
 * confirmation is the only new, demonstrative input.
 */
export function deriveOrderLifecycleStatus(readiness: ReadinessStatus | undefined, execution: ProductionExecutionRecord | undefined, preparationConfirmed: boolean): OrderLifecycleStatus {
  if (execution?.status === 'COMPLETED') return 'PRODUZIDA';
  if (execution?.status === 'PAUSED') return 'PAUSADA';
  if (execution?.status === 'IN_PROGRESS') return 'PRODUZINDO';
  if (readiness === undefined) return 'BACKLOG';
  if (preparationConfirmed || readiness === 'READY') return 'PREPARADA';
  return 'EM_PREPARACAO';
}

export function orderLifecycleStepIndex(status: OrderLifecycleStatus): number {
  if (status === 'PAUSADA') return ORDER_LIFECYCLE_SEQUENCE.indexOf('PRODUZINDO');
  return ORDER_LIFECYCLE_SEQUENCE.indexOf(status);
}
