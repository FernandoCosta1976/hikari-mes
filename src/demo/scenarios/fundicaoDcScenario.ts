import type { ScenarioDefinition } from '../../domain/scenario/ScenarioDefinition';

export const fundicaoDcScenario = {
  id: 'fundicao-dc',
  name: 'Fundição DC — Fundação demonstrativa',
  productiveAreaId: 'fundicao-dc',
  demonstrative: true,
} as const satisfies ScenarioDefinition;
