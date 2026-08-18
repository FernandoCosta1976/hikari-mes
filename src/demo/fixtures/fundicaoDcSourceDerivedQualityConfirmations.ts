import type { ProductionQualityConfirmation } from '../../domain/production-quality/models';

const t = (time: string) => `2026-07-10T${time}:00-03:00`;

/**
 * Quality facts for the reference 2026-07-10 schedule. Produced is never
 * repeated here — it is always read from Production Confirmations
 * (Capability 06). Every Completed Requirement below is fully classified
 * (Good + Reject + Rework == its own Production Confirmation total);
 * lot-sd-507 is the ONE demonstrative exception — RUNNING at 65/100
 * produced with only 50 already classified, so the interactive "Registrar
 * qualidade" flow has 15 pending to classify (Section 14.D/15).
 */
export const fundicaoDcSourceDerivedQualityConfirmationsFixture: readonly ProductionQualityConfirmation[] = [
  { id: 'lot-sd-501-quality-seed', lotId: 'lot-sd-501', resourceId: 'DC01', goodQuantity: 48, rejectQuantity: 2, reworkQuantity: 0, reasonCode: 'VISUAL', confirmedAt: t('01:03'), operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'lot-sd-502-quality-seed', lotId: 'lot-sd-502', resourceId: 'DC01', goodQuantity: 50, rejectQuantity: 0, reworkQuantity: 0, confirmedAt: t('02:18'), operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'lot-sd-503-quality-seed', lotId: 'lot-sd-503', resourceId: 'DC01', goodQuantity: 49, rejectQuantity: 1, reworkQuantity: 0, reasonCode: 'DIMENSIONAL', confirmedAt: t('03:23'), operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'lot-sd-504-quality-seed', lotId: 'lot-sd-504', resourceId: 'DC01', goodQuantity: 50, rejectQuantity: 0, reworkQuantity: 0, confirmedAt: t('04:34'), operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'lot-sd-505-quality-seed', lotId: 'lot-sd-505', resourceId: 'DC01', goodQuantity: 97, rejectQuantity: 3, reworkQuantity: 0, reasonCode: 'PROCESS_DEFECT', confirmedAt: t('06:41'), operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'lot-sd-506-quality-seed', lotId: 'lot-sd-506', resourceId: 'DC01', goodQuantity: 95, rejectQuantity: 5, reworkQuantity: 0, reasonCode: 'PROCESS_DEFECT', confirmedAt: t('08:31'), operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' }, // the unplanned stop's downstream quality cost
  // lot-sd-507 — RUNNING, 65/100 produced, only 50 classified so far (Section 14.D/15 demonstration Requirement).
  { id: 'lot-sd-507-quality-seed', lotId: 'lot-sd-507', resourceId: 'DC01', goodQuantity: 48, rejectQuantity: 2, reworkQuantity: 0, reasonCode: 'DIMENSIONAL', confirmedAt: t('09:00'), operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'lot-sd-511-quality-seed', lotId: 'lot-sd-511', resourceId: 'DC02', goodQuantity: 100, rejectQuantity: 0, reworkQuantity: 0, confirmedAt: t('07:54'), operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'lot-sd-515-quality-seed', lotId: 'lot-sd-515', resourceId: 'DC04', goodQuantity: 98, rejectQuantity: 2, reworkQuantity: 0, reasonCode: 'OTHER_DEMONSTRATIVE', confirmedAt: t('07:02'), operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'lot-sd-516-quality-seed', lotId: 'lot-sd-516', resourceId: 'DC04', goodQuantity: 94, rejectQuantity: 6, reworkQuantity: 0, reasonCode: 'PROCESS_DEFECT', confirmedAt: t('09:14'), operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' }, // the microstop's downstream quality cost
  { id: 'lot-sd-518-quality-seed', lotId: 'lot-sd-518', resourceId: 'DC05', goodQuantity: 100, rejectQuantity: 0, reworkQuantity: 0, confirmedAt: t('03:22'), operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'lot-sd-519-quality-seed', lotId: 'lot-sd-519', resourceId: 'DC05', goodQuantity: 97, rejectQuantity: 3, reworkQuantity: 0, reasonCode: 'VISUAL', confirmedAt: t('05:42'), operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'lot-sd-520-quality-seed', lotId: 'lot-sd-520', resourceId: 'DC05', goodQuantity: 100, rejectQuantity: 0, reworkQuantity: 0, confirmedAt: t('08:02'), operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
];
