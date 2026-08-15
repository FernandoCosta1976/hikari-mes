import type { ProductionReportEntry } from '../../domain/production-execution/productionReport';

export const fundicaoDcProductionReportsFixture: readonly ProductionReportEntry[] = [
  { lotId: 'lot-265', quantity: 15, reportedAt: '2025-05-15T16:52:00-03:00', origin: 'AUTOMATION', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-265', quantity: 10, reportedAt: '2025-05-15T17:05:00-03:00', origin: 'OPERATOR', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-265', quantity: 12, reportedAt: '2025-05-15T17:18:00-03:00', origin: 'AUTOMATION', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-268', quantity: 10, reportedAt: '2025-05-15T16:20:00-03:00', origin: 'AUTOMATION', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-268', quantity: 15, reportedAt: '2025-05-15T16:45:00-03:00', origin: 'AUTOMATION', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-268', quantity: 10, reportedAt: '2025-05-15T17:10:00-03:00', origin: 'OPERATOR', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-266', quantity: 20, reportedAt: '2025-05-15T15:50:00-03:00', origin: 'AUTOMATION', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-266', quantity: 15, reportedAt: '2025-05-15T16:30:00-03:00', origin: 'AUTOMATION', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
  { lotId: 'lot-266', quantity: 6, reportedAt: '2025-05-15T16:58:00-03:00', origin: 'OPERATOR', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
];
