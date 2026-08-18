import { describe, expect, it } from 'vitest';
import { buildOperationalStatusByLotId } from './operationalStatusResolution';
import type { Lot } from '../../domain/production-scheduling/models';
import type { ProductionExecutionRecord } from '../../domain/production-execution/models';
import type { LotReadinessAssessment } from '../../domain/production-readiness/models';

const lot = (overrides: Partial<Lot> = {}): Lot => ({
  id: 'lot-sd-508',
  lotNumber: '508',
  materialId: '44C-E5421-W0',
  quantity: 100,
  scheduledStart: '2026-07-10T08:00:00-03:00',
  scheduledFinish: '2026-07-10T09:00:00-03:00',
  workCenterId: 'FUNDICAO-DC',
  destination: 'ASSEMBLY',
  productionOrderId: 'po-1',
  scheduledResourceId: 'DC01',
  materialAttention: false,
  state: 'SCHEDULED',
  ...overrides,
});

const execution = (overrides: Partial<ProductionExecutionRecord> = {}): ProductionExecutionRecord => ({
  lotId: 'lot-sd-508',
  productionOrderId: 'po-1',
  resourceId: 'DC01',
  scheduleVersionId: 'sv-1',
  plannedQuantity: 100,
  scheduledStart: '2026-07-10T08:00:00-03:00',
  status: 'NOT_STARTED',
  pauses: [],
  transitions: [],
  demonstrative: true,
  dataOrigin: 'DEMONSTRATIVE_EXECUTION',
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED',
  ...overrides,
});

const readiness = (status: LotReadinessAssessment['status']): LotReadinessAssessment => ({
  lotId: 'lot-sd-508',
  status,
  summary: 'demonstrativo',
  resources: [],
  assessedAt: '2026-07-10T09:15:00-03:00',
  demonstrative: true,
});

describe('Capability 07 — Effective Readiness/Release mirrors the store and Plano Lot Context (Section 38)', () => {
  const currentTime = '2026-07-10T09:15:00-03:00';

  it('a Lot with no persisted Release and READY readiness resolves live to READY_FOR_RELEASE, never a stale PLANNED', () => {
    const statusByLotId = buildOperationalStatusByLotId({
      lots: [lot()],
      executionsByLot: { 'lot-sd-508': execution() },
      releasesByLot: {},
      readinessAssessments: [readiness('READY')],
      preparationConfirmedByLotId: {},
      organizationsByLotId: {},
      confirmedQuantityByLotId: {},
      activeScheduleVersionId: 'v08',
      currentTime,
    });
    expect(statusByLotId['lot-sd-508'].status).toBe('READY_FOR_RELEASE');
  });

  it('Confirmar Preparação forces the effective readiness to READY even when the raw fixture says ATTENTION', () => {
    const statusByLotId = buildOperationalStatusByLotId({
      lots: [lot()],
      executionsByLot: { 'lot-sd-508': execution() },
      releasesByLot: {},
      readinessAssessments: [readiness('ATTENTION')],
      preparationConfirmedByLotId: { 'lot-sd-508': true },
      organizationsByLotId: {},
      confirmedQuantityByLotId: {},
      activeScheduleVersionId: 'v08',
      currentTime,
    });
    expect(statusByLotId['lot-sd-508'].status).toBe('READY_FOR_RELEASE');
  });

  it('BLOCKED readiness with no persisted Release resolves to BLOCKED', () => {
    const statusByLotId = buildOperationalStatusByLotId({
      lots: [lot()],
      executionsByLot: { 'lot-sd-508': execution() },
      releasesByLot: {},
      readinessAssessments: [readiness('BLOCKED')],
      preparationConfirmedByLotId: {},
      organizationsByLotId: {},
      confirmedQuantityByLotId: {},
      activeScheduleVersionId: 'v08',
      currentTime,
    });
    expect(statusByLotId['lot-sd-508'].status).toBe('BLOCKED');
  });

  it('a persisted Release record always wins over a live re-derivation', () => {
    const statusByLotId = buildOperationalStatusByLotId({
      lots: [lot()],
      executionsByLot: { 'lot-sd-508': execution() },
      releasesByLot: { 'lot-sd-508': { lotId: 'lot-sd-508', productionOrderId: 'po-1', resourceId: 'DC01', scheduleVersionId: 'sv-1', status: 'RELEASED', readiness: 'READY', reason: 'demonstrativo', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' } },
      readinessAssessments: [readiness('BLOCKED')],
      preparationConfirmedByLotId: {},
      organizationsByLotId: {},
      confirmedQuantityByLotId: {},
      activeScheduleVersionId: 'v08',
      currentTime,
    });
    expect(statusByLotId['lot-sd-508'].status).toBe('WAITING_START');
  });

  it('a Lot with no execution fact at all is simply absent from the map — never a fabricated status', () => {
    const statusByLotId = buildOperationalStatusByLotId({
      lots: [lot()],
      executionsByLot: {},
      releasesByLot: {},
      readinessAssessments: [readiness('READY')],
      preparationConfirmedByLotId: {},
      organizationsByLotId: {},
      confirmedQuantityByLotId: {},
      activeScheduleVersionId: 'v08',
      currentTime,
    });
    expect(statusByLotId['lot-sd-508']).toBeUndefined();
  });
});
