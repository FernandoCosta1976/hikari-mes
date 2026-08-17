import type { ScenarioDefinition } from '../../domain/scenario/ScenarioDefinition';
import { fundicaoDcCurrentResourceStateFixture } from '../fixtures/fundicaoDcCurrentResourceState';
import { fundicaoDcMaterialResourceEligibilityFixture } from '../fixtures/fundicaoDcMaterialResourceEligibility';
import { fundicaoDcScenario } from '../scenarios/fundicaoDcScenario';
import { fundicaoDcSourceDerivedScenario } from '../scenarios/fundicaoDcSourceDerivedScenario';
import { fundicaoDcSourceDerivedCurrentResourceStateFixture } from '../fixtures/fundicaoDcSourceDerivedCurrentResourceState';
import { fundicaoDcSourceDerivedMaterialResourceEligibilityFixture } from '../fixtures/fundicaoDcSourceDerivedMaterialResourceEligibility';
import { fundicaoDcSourceDerivedProductionReadinessFixture } from '../fixtures/fundicaoDcSourceDerivedProductionReadiness';
import { currentResourceStateAdapter } from './currentResourceStateAdapter';
import { materialResourceEligibilityAdapter } from './materialResourceEligibilityAdapter';
import { productionReadinessAdapter } from './productionReadinessAdapter';
import { fundicaoDcProductionReadinessFixture } from '../fixtures/fundicaoDcProductionReadiness';

const materialResourceEligibilities = materialResourceEligibilityAdapter(fundicaoDcMaterialResourceEligibilityFixture);
const sourceDerivedMaterialResourceEligibilities = materialResourceEligibilityAdapter(fundicaoDcSourceDerivedMaterialResourceEligibilityFixture);

const scenarios: readonly ScenarioDefinition[] = [{
  ...fundicaoDcScenario,
  currentResourceStates: currentResourceStateAdapter(fundicaoDcCurrentResourceStateFixture),
  materialResourceEligibilities,
  productionReadiness: productionReadinessAdapter(fundicaoDcProductionReadinessFixture, fundicaoDcScenario.productionScheduling, materialResourceEligibilities),
}, {
  ...fundicaoDcSourceDerivedScenario,
  currentResourceStates: currentResourceStateAdapter(fundicaoDcSourceDerivedCurrentResourceStateFixture),
  materialResourceEligibilities: sourceDerivedMaterialResourceEligibilities,
  productionReadiness: productionReadinessAdapter(fundicaoDcSourceDerivedProductionReadinessFixture, fundicaoDcSourceDerivedScenario.productionScheduling, sourceDerivedMaterialResourceEligibilities),
}];

export const scenarioDefinitionAdapter = {
  findById(scenarioId: string): ScenarioDefinition | undefined {
    return scenarios.find((scenario) => scenario.id === scenarioId);
  },
};
