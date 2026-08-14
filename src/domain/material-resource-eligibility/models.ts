import type { Material } from '../production-scheduling/models';
import type { FoundryResourceId } from '../resource/models';

export interface MaterialResourceEligibilityProjection {
  materialId: Material['id'];
  eligibleResourceIds: readonly FoundryResourceId[];
  classification: 'DEMO_SIMULATED';
}
