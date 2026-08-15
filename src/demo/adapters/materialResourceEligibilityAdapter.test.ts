import { describe, expect, test } from 'vitest';
import { fundicaoDcMaterialResourceEligibilityFixture } from '../fixtures/fundicaoDcMaterialResourceEligibility';
import { materialResourceEligibilityAdapter } from './materialResourceEligibilityAdapter';

describe('materialResourceEligibilityAdapter', () => {
  const projections = materialResourceEligibilityAdapter(fundicaoDcMaterialResourceEligibilityFixture);
  const resourcesFor = (materialId: string) => projections.find((item) => item.materialId === materialId)?.eligibleResourceIds;

  test.each([
    ['material-a', ['DC01', 'DC03', 'DC05']],
    ['material-b', ['DC02', 'DC03', 'DC05']],
    ['material-c', ['DC01', 'DC04']],
    ['material-d', ['DC02', 'DC05']],
    ['material-e', ['DC04']],
  ])('maps the approved demonstrative Resources for %s', (materialId, expected) => {
    expect(resourcesFor(materialId)).toEqual(expected);
  });

  test('does not include ineligible Resources or operational decision fields', () => {
    const materialA = projections.find((item) => item.materialId === 'material-a')!;
    expect(materialA.eligibleResourceIds).not.toContain('DC02');
    expect(materialA).not.toHaveProperty('availability');
    expect(materialA).not.toHaveProperty('recommendedResource');
    expect(materialA).not.toHaveProperty('selectedResource');
    expect(materialA).not.toHaveProperty('ranking');
  });
});
