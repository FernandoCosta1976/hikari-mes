import type { ScenarioDefinition } from '../../domain/scenario/ScenarioDefinition';
import { fundicaoDcCurrentResourceStateFixture } from '../fixtures/fundicaoDcCurrentResourceState';
import { fundicaoDcMaterialResourceEligibilityFixture } from '../fixtures/fundicaoDcMaterialResourceEligibility';
import { fundicaoDcScenario } from '../scenarios/fundicaoDcScenario';
import { currentResourceStateAdapter } from './currentResourceStateAdapter';
import { materialResourceEligibilityAdapter } from './materialResourceEligibilityAdapter';
import { productionReadinessAdapter } from './productionReadinessAdapter';
import { fundicaoDcProductionReadinessFixture } from '../fixtures/fundicaoDcProductionReadiness';

const materialResourceEligibilities = materialResourceEligibilityAdapter(fundicaoDcMaterialResourceEligibilityFixture);

const scenarios: readonly ScenarioDefinition[] = [{
  ...fundicaoDcScenario,
  currentResourceStates: currentResourceStateAdapter(fundicaoDcCurrentResourceStateFixture),
  materialResourceEligibilities,
  productionReadiness: productionReadinessAdapter(fundicaoDcProductionReadinessFixture, fundicaoDcScenario.productionScheduling, materialResourceEligibilities),
}];

export const scenarioDefinitionAdapter = {
  findById(scenarioId: string): ScenarioDefinition | undefined {
    return scenarios.find((scenario) => scenario.id === scenarioId);
  },
};
