import type { FoundryResourceId } from '../../domain/resource/models';

/**
 * "Quem executou?" (Section 10/11) — demonstrative actors only, never real
 * people. Fixed association per Resource so the scene doesn't need an
 * operator picker/login: whichever Requirement a Resource is running, the
 * same demonstrative Operator is credited, matching how a real shift usually
 * staffs one machine per operator.
 */
export interface DemonstrativeOperator {
  operatorId: string;
  displayName: string;
}

const operatorByResource: Readonly<Record<FoundryResourceId, DemonstrativeOperator>> = {
  DC01: { operatorId: 'operator-01', displayName: 'Operador 01 · demonstrativo' },
  DC02: { operatorId: 'operator-02', displayName: 'Operador 02 · demonstrativo' },
  DC03: { operatorId: 'operator-03', displayName: 'Operador 03 · demonstrativo' },
  DC04: { operatorId: 'operator-01', displayName: 'Operador 01 · demonstrativo' },
  DC05: { operatorId: 'operator-02', displayName: 'Operador 02 · demonstrativo' },
};

export function demonstrativeOperatorForResource(resourceId: string): DemonstrativeOperator {
  return operatorByResource[resourceId as FoundryResourceId] ?? { operatorId: 'operator-01', displayName: 'Operador 01 · demonstrativo' };
}
