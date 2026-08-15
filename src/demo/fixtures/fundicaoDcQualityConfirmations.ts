import type { QualityConfirmation } from '../../domain/production-quality/models';

export const fundicaoDcQualityConfirmationsFixture: readonly QualityConfirmation[] = [
  { lotId: 'lot-265', resourceId: 'DC01', producedQuantity: 72, goodQuantity: 68, rejectQuantity: 4, reworkQuantity: 0, confirmedAt: '2025-05-15T17:20:00-03:00', confirmedBy: 'Operador da Fundição · demonstrativo', lossReason: 'SCRAP', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-264', resourceId: 'DC02', producedQuantity: 50, goodQuantity: 49, rejectQuantity: 1, reworkQuantity: 0, confirmedAt: '2025-05-15T11:12:00-03:00', confirmedBy: 'Operador da Fundição · demonstrativo', lossReason: 'DIMENSIONAL', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-266', resourceId: 'DC03', producedQuantity: 41, goodQuantity: 35, rejectQuantity: 0, reworkQuantity: 6, confirmedAt: '2025-05-15T17:05:00-03:00', confirmedBy: 'Operador da Fundição · demonstrativo', lossReason: 'PROCESS_DEFECT', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-268', resourceId: 'DC04', producedQuantity: 35, goodQuantity: 28, rejectQuantity: 7, reworkQuantity: 0, confirmedAt: '2025-05-15T17:20:00-03:00', confirmedBy: 'Operador da Fundição · demonstrativo', lossReason: 'SURFACE', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
];
