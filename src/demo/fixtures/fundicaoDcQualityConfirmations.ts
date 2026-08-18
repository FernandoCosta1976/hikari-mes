import type { ProductionQualityConfirmation } from '../../domain/production-quality/models';

/**
 * Every Lot below is already fully classified (Good + Reject + Rework ==
 * its own Production Confirmation total in fundicaoDcProductionConfirmations.ts)
 * — Produced is never repeated here, it is always read from Production
 * Confirmations (Capability 06), never a field on Quality Confirmation.
 */
export const fundicaoDcQualityConfirmationsFixture: readonly ProductionQualityConfirmation[] = [
  { id: 'lot-265-quality-seed', lotId: 'lot-265', resourceId: 'DC01', goodQuantity: 79, rejectQuantity: 4, reworkQuantity: 0, reasonCode: 'OTHER_DEMONSTRATIVE', confirmedAt: '2025-05-15T17:20:00-03:00', operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'lot-264-quality-seed', lotId: 'lot-264', resourceId: 'DC02', goodQuantity: 49, rejectQuantity: 1, reworkQuantity: 0, reasonCode: 'DIMENSIONAL', confirmedAt: '2025-05-15T11:12:00-03:00', operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'lot-266-quality-seed', lotId: 'lot-266', resourceId: 'DC03', goodQuantity: 35, rejectQuantity: 0, reworkQuantity: 6, confirmedAt: '2025-05-15T17:05:00-03:00', operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { id: 'lot-268-quality-seed', lotId: 'lot-268', resourceId: 'DC04', goodQuantity: 28, rejectQuantity: 7, reworkQuantity: 0, reasonCode: 'VISUAL', confirmedAt: '2025-05-15T17:20:00-03:00', operator: 'Operador da Fundição · demonstrativo', dataOrigin: 'DEMONSTRATIVE_QUALITY', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
];
