import type { FoundryResourceId } from '../../domain/resource/models';

export interface DemoMaterialResourceEligibilityRecord {
  materialId: string;
  eligibleResourceIds: readonly FoundryResourceId[];
}

export const fundicaoDcMaterialResourceEligibilityFixture: readonly DemoMaterialResourceEligibilityRecord[] = [
  { materialId: 'material-a', eligibleResourceIds: ['DC01', 'DC03', 'DC05'] },
  { materialId: 'material-b', eligibleResourceIds: ['DC02', 'DC03', 'DC05'] },
  { materialId: 'material-c', eligibleResourceIds: ['DC01', 'DC04'] },
];
