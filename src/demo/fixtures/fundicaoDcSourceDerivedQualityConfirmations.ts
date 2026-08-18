import type { QualityConfirmation } from '../../domain/production-quality/models';

const t = (time: string) => `2026-07-10T${time}:00-03:00`;

/**
 * Quality facts for the Completed requirements of the canonical 2026-07-10
 * schedule, reconciled with Execution (producedQuantity here always equals
 * the matching ProductionExecutionRecord.producedQuantity). Running
 * requirements have no confirmation yet — a partial produced count is a
 * fact of Execution, not a closed Quality confirmation.
 */
export const fundicaoDcSourceDerivedQualityConfirmationsFixture: readonly QualityConfirmation[] = [
  { lotId: 'lot-sd-501', resourceId: 'DC01', producedQuantity: 50, goodQuantity: 48, rejectQuantity: 2, reworkQuantity: 0, confirmedAt: t('01:03'), confirmedBy: 'Operador da Fundição · demonstrativo', lossReason: 'SURFACE', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-sd-502', resourceId: 'DC01', producedQuantity: 50, goodQuantity: 50, rejectQuantity: 0, reworkQuantity: 0, confirmedAt: t('02:18'), confirmedBy: 'Operador da Fundição · demonstrativo', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-sd-503', resourceId: 'DC01', producedQuantity: 50, goodQuantity: 49, rejectQuantity: 1, reworkQuantity: 0, confirmedAt: t('03:23'), confirmedBy: 'Operador da Fundição · demonstrativo', lossReason: 'DIMENSIONAL', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-sd-504', resourceId: 'DC01', producedQuantity: 50, goodQuantity: 50, rejectQuantity: 0, reworkQuantity: 0, confirmedAt: t('04:34'), confirmedBy: 'Operador da Fundição · demonstrativo', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-sd-505', resourceId: 'DC01', producedQuantity: 100, goodQuantity: 97, rejectQuantity: 3, reworkQuantity: 0, confirmedAt: t('06:41'), confirmedBy: 'Operador da Fundição · demonstrativo', lossReason: 'PROCESS_DEFECT', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-sd-506', resourceId: 'DC01', producedQuantity: 100, goodQuantity: 95, rejectQuantity: 5, reworkQuantity: 0, confirmedAt: t('08:31'), confirmedBy: 'Operador da Fundição · demonstrativo', lossReason: 'PROCESS_DEFECT', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' }, // the unplanned stop's downstream quality cost
  { lotId: 'lot-sd-511', resourceId: 'DC02', producedQuantity: 100, goodQuantity: 100, rejectQuantity: 0, reworkQuantity: 0, confirmedAt: t('07:54'), confirmedBy: 'Operador da Fundição · demonstrativo', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-sd-515', resourceId: 'DC04', producedQuantity: 100, goodQuantity: 98, rejectQuantity: 2, reworkQuantity: 0, confirmedAt: t('07:02'), confirmedBy: 'Operador da Fundição · demonstrativo', lossReason: 'SCRAP', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-sd-516', resourceId: 'DC04', producedQuantity: 100, goodQuantity: 94, rejectQuantity: 6, reworkQuantity: 0, confirmedAt: t('09:14'), confirmedBy: 'Operador da Fundição · demonstrativo', lossReason: 'PROCESS_DEFECT', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' }, // the microstop's downstream quality cost
  { lotId: 'lot-sd-518', resourceId: 'DC05', producedQuantity: 100, goodQuantity: 100, rejectQuantity: 0, reworkQuantity: 0, confirmedAt: t('03:22'), confirmedBy: 'Operador da Fundição · demonstrativo', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-sd-519', resourceId: 'DC05', producedQuantity: 100, goodQuantity: 97, rejectQuantity: 3, reworkQuantity: 0, confirmedAt: t('05:42'), confirmedBy: 'Operador da Fundição · demonstrativo', lossReason: 'SURFACE', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-sd-520', resourceId: 'DC05', producedQuantity: 100, goodQuantity: 100, rejectQuantity: 0, reworkQuantity: 0, confirmedAt: t('08:02'), confirmedBy: 'Operador da Fundição · demonstrativo', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
];
