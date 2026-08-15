import type { ProductionSchedulingDefinition } from '../production-scheduling/models';
import type { CurrentResourceStateProjection } from '../current-resource-state/models';
import type { MaterialResourceEligibilityProjection } from '../material-resource-eligibility/models';
import type { LotReadinessAssessment } from '../production-readiness/models';

export interface ScenarioDefinition {
  id: string;
  name: string;
  productiveAreaId: string;
  demonstrative: true;
  currentScenarioTime: string;
  productionScheduling: ProductionSchedulingDefinition;
  currentResourceStates: readonly CurrentResourceStateProjection[];
  materialResourceEligibilities: readonly MaterialResourceEligibilityProjection[];
  productionReadiness: readonly LotReadinessAssessment[];
}
