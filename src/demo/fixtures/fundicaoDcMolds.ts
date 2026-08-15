import type { Mold } from '../../domain/mold/models';

export const fundicaoDcMoldsFixture: readonly Mold[] = [
  { id: 'mold-dc01', code: 'M-101', resourceId: 'DC01', materialCompatibility: 'material-a', lifeUsedRatio: 0.62, demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'mold-dc02', code: 'M-205', resourceId: 'DC02', materialCompatibility: 'material-d', lifeUsedRatio: 0.48, demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'mold-dc03', code: 'M-118', resourceId: 'DC03', materialCompatibility: 'material-b', lifeUsedRatio: 0.86, demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'mold-dc04', code: 'M-302', resourceId: 'DC04', materialCompatibility: 'material-c', lifeUsedRatio: 0.94, demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'mold-dc05', code: 'M-411', resourceId: 'DC05', materialCompatibility: 'material-b', lifeUsedRatio: 0.35, demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
];
