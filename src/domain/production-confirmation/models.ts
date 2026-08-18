import type { ProductionExecutionStatus } from '../production-execution/models';

/**
 * Capability 06 — Registrar Produção. A Production Confirmation is the fact
 * that a quantity was produced against a Canonical Production Requirement —
 * distinct from Execution Control (Capability 05, Start/Pause/Resume/
 * Complete) and from Quality Disposition (Good/Reject/Rework classification,
 * which stays a separate concern this round — Section 21). Each confirmation
 * carries its OWN increment, never a cumulative total: the Requirement's
 * accumulated produced quantity is always SUM(confirmations), never a field
 * that gets overwritten. EXECUTION GRANULARITY: DEMONSTRATIVE ·
 * BUSINESS_VALIDATION_REQUIRED.
 */
export type ConfirmationDataOrigin = 'DEMONSTRATIVE_CONFIRMATION' | 'USER_SIMULATION';

export interface ProductionConfirmation {
  id: string;
  /** The Canonical Production Requirement (Lot) this confirmation belongs to. */
  requirementId: string;
  /** Same key as requirementId in this demonstrative model — Execution and Confirmation are 1:1 per Requirement. */
  executionId: string;
  /** The Execution's actualResourceId at the moment of confirmation — never Primary/Reserve. */
  resourceId: string;
  operatorId?: string;
  /** Session Operational Clock instant — never Date.now(). */
  confirmedAt: string;
  /** This confirmation's OWN increment — never the cumulative total. */
  producedQuantity: number;
  goodQuantity?: number;
  rejectQuantity?: number;
  reworkQuantity?: number;
  confirmationType: 'PRODUCED';
  dataOrigin: ConfirmationDataOrigin;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
  componentId: string;
  sourceLineCLot?: string;
  demonstrative: true;
}

export function accumulatedProducedQuantity(confirmations: readonly ProductionConfirmation[]): number {
  return confirmations.reduce((sum, confirmation) => sum + confirmation.producedQuantity, 0);
}

/** SUM(confirmations) per Requirement — the single canonical Total Count source (Section 19/20), never execution.producedQuantity. */
export function confirmedQuantityByLot(confirmationsByLot: Readonly<Record<string, readonly ProductionConfirmation[]>>): Readonly<Record<string, number>> {
  return Object.fromEntries(Object.entries(confirmationsByLot).map(([lotId, confirmations]) => [lotId, accumulatedProducedQuantity(confirmations)]));
}

/** Groups a flat confirmation list (e.g. a static seed fixture) by its own Requirement — the shape `confirmedQuantityByLot` and the live Scenario Store both expect. */
export function groupConfirmationsByRequirement(confirmations: readonly ProductionConfirmation[]): Readonly<Record<string, readonly ProductionConfirmation[]>> {
  const byRequirement = new Map<string, ProductionConfirmation[]>();
  for (const confirmation of confirmations) byRequirement.set(confirmation.requirementId, [...(byRequirement.get(confirmation.requirementId) ?? []), confirmation]);
  return Object.fromEntries(byRequirement);
}

export type ConfirmationRejection =
  | { kind: 'REQUIRES_RUNNING' }
  | { kind: 'MUST_BE_INTEGER' }
  | { kind: 'MUST_BE_POSITIVE' }
  | { kind: 'EXCEEDS_PLANNED'; remaining: number };

/**
 * Validation gate (Section 6/7/8/9): only RUNNING requirements accept a
 * confirmation; the increment must be a positive integer; the cumulative
 * total (existing accumulated + this increment) can never exceed Planned
 * Quantity. Zero is never accepted this round — UNKNOWN stays distinct from
 * a confirmed zero (Section 8).
 */
export function validateConfirmationIncrement(params: { executionStatus: ProductionExecutionStatus; increment: number; plannedQuantity: number; accumulated: number }): ConfirmationRejection | null {
  const { executionStatus, increment, plannedQuantity, accumulated } = params;
  if (executionStatus !== 'IN_PROGRESS') return { kind: 'REQUIRES_RUNNING' };
  if (!Number.isInteger(increment)) return { kind: 'MUST_BE_INTEGER' };
  if (increment <= 0) return { kind: 'MUST_BE_POSITIVE' };
  const remaining = plannedQuantity - accumulated;
  if (increment > remaining) return { kind: 'EXCEEDS_PLANNED', remaining };
  return null;
}

export function buildProductionConfirmation(params: { id: string; requirementId: string; resourceId: string; operatorId?: string; componentId: string; sourceLineCLot?: string; confirmedAt: string; increment: number; dataOrigin: ConfirmationDataOrigin }): ProductionConfirmation {
  return {
    id: params.id,
    requirementId: params.requirementId,
    executionId: params.requirementId,
    resourceId: params.resourceId,
    operatorId: params.operatorId,
    confirmedAt: params.confirmedAt,
    producedQuantity: params.increment,
    confirmationType: 'PRODUCED',
    dataOrigin: params.dataOrigin,
    ruleStatus: 'BUSINESS_VALIDATION_REQUIRED',
    componentId: params.componentId,
    sourceLineCLot: params.sourceLineCLot,
    demonstrative: true,
  };
}
