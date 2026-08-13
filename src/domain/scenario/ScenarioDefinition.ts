import type { ProductionSchedulingDefinition } from '../production-scheduling/models';

export interface ScenarioDefinition {
  id: string;
  name: string;
  productiveAreaId: string;
  demonstrative: true;
  productionScheduling: ProductionSchedulingDefinition;
}
