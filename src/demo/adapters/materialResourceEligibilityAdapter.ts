import type { MaterialResourceEligibilityProjection } from '../../domain/material-resource-eligibility/models';
import type { DemoMaterialResourceEligibilityRecord } from '../fixtures/fundicaoDcMaterialResourceEligibility';

export function materialResourceEligibilityAdapter(
  records: readonly DemoMaterialResourceEligibilityRecord[],
): readonly MaterialResourceEligibilityProjection[] {
  return records.map((record) => ({
    materialId: record.materialId,
    eligibleResourceIds: [...record.eligibleResourceIds],
    classification: 'DEMO_SIMULATED',
  }));
}
