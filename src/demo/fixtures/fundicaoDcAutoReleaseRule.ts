import type { FoundryResourceId } from '../../domain/resource/models';

/**
 * REGRA DEMONSTRATIVA — VALIDAÇÃO DE NEGÓCIO NECESSÁRIA.
 * Fixed Material→Resource pairing that HIKARI auto-releases when Readiness
 * is READY and the pairing matches the Lot's scheduled Resource. Narrow and
 * explicit on purpose — not a general inference engine.
 */
export const fundicaoDcAutoReleaseRuleFixture: Readonly<Partial<Record<string, FoundryResourceId>>> = {
  'material-b': 'DC02',
};
