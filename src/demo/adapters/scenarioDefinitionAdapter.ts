import type { ScenarioDefinition } from '../../domain/scenario/ScenarioDefinition';
import { fundicaoDcScenario } from '../scenarios/fundicaoDcScenario';

const scenarios: readonly ScenarioDefinition[] = [fundicaoDcScenario];

export const scenarioDefinitionAdapter = {
  findById(scenarioId: string): ScenarioDefinition | undefined {
    return scenarios.find((scenario) => scenario.id === scenarioId);
  },
};
