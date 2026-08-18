import type { Mold } from '../../domain/mold/models';

/** One demonstrative Mold per Resource, compatible with a real component code actually scheduled on that Resource. */
export const fundicaoDcSourceDerivedMoldsFixture: readonly Mold[] = [
  { id: 'mold-sd-dc01', code: 'M-101', resourceId: 'DC01', materialCompatibility: '44C-E5421-W0', lifeUsedRatio: 0.62, demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'mold-sd-dc02', code: 'M-205', resourceId: 'DC02', materialCompatibility: '1ST-E5111-W0', lifeUsedRatio: 0.48, demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'mold-sd-dc03', code: 'M-118', resourceId: 'DC03', materialCompatibility: '1S4-E5411-W0', lifeUsedRatio: 0.86, demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'mold-sd-dc04', code: 'M-302', resourceId: 'DC04', materialCompatibility: '1ST-E5411-W0', lifeUsedRatio: 0.94, demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'mold-sd-dc05', code: 'M-411', resourceId: 'DC05', materialCompatibility: '44C-E5111-W0', lifeUsedRatio: 0.35, demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
];
