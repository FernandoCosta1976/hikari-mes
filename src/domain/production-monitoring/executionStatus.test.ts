import { describe, expect, it } from 'vitest';
import { buildRequirementSnapshots, requirementStatus, summarizeDay } from './executionStatus';
import type { ProductionExecutionRecord } from '../production-execution/models';
import type { Lot } from '../production-scheduling/models';

const baseLot: Lot = { id: 'lot-x', lotNumber: '1', materialId: 'm', quantity: 100, scheduledStart: '2026-07-10T10:00:00-03:00', scheduledFinish: '2026-07-10T11:10:00-03:00', workCenterId: 'wc', destination: 'ASSEMBLY', productionOrderId: 'po', scheduledResourceId: 'DC01', materialAttention: false, state: 'SCHEDULED' };
const baseExecution: ProductionExecutionRecord = { lotId: 'lot-x', productionOrderId: 'po', resourceId: 'DC01', scheduleVersionId: 'v1', plannedQuantity: 100, producedQuantity: 0, scheduledStart: baseLot.scheduledStart, status: 'NOT_STARTED', pauses: [], transitions: [], demonstrative: true, dataOrigin: 'SOURCE_DERIVED_PLAN', ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' };

describe('requirementStatus (Scheduled State != Execution State != Requirement State)', () => {
  it('COMPLETED execution is always COMPLETED regardless of clock', () => {
    expect(requirementStatus({ ...baseExecution, status: 'COMPLETED', actualStart: '...', actualFinish: '...' }, baseLot, '2026-07-10T09:00:00-03:00')).toBe('COMPLETED');
  });
  it('IN_PROGRESS before its scheduled finish is RUNNING', () => {
    expect(requirementStatus({ ...baseExecution, status: 'IN_PROGRESS', actualStart: '2026-07-10T10:02:00-03:00' }, baseLot, '2026-07-10T10:30:00-03:00')).toBe('RUNNING');
  });
  it('IN_PROGRESS past its scheduled finish is DELAYED, not silently still RUNNING', () => {
    expect(requirementStatus({ ...baseExecution, status: 'IN_PROGRESS', actualStart: '2026-07-10T10:02:00-03:00' }, baseLot, '2026-07-10T11:30:00-03:00')).toBe('DELAYED');
  });
  it('NOT_STARTED before its scheduled start is SCHEDULED (A executar) — not NOT_STARTED yet', () => {
    expect(requirementStatus(baseExecution, baseLot, '2026-07-10T09:00:00-03:00')).toBe('SCHEDULED');
  });
  it('NOT_STARTED after its scheduled start has passed is NOT_STARTED — never fabricated as DELAYED or as zero produced', () => {
    expect(requirementStatus(baseExecution, baseLot, '2026-07-10T10:23:00-03:00')).toBe('NOT_STARTED');
  });
});

/**
 * Property-style dataset covering the full state space in one pass — not
 * tied to any Scenario/dataset (the Acompanhamento screen has none of its
 * own, per Section 14; this exercises the domain algorithm directly with
 * bespoke synthetic Lots).
 */
const lot = (id: string, resourceId: Lot['scheduledResourceId'], start: string, finish: string, quantity = 100): Lot =>
  ({ ...baseLot, id, lotNumber: id, scheduledResourceId: resourceId, scheduledStart: `2026-07-10T${start}:00-03:00`, scheduledFinish: `2026-07-10T${finish}:00-03:00`, quantity });
const execution = (lotId: string, resourceId: string, overrides: Partial<ProductionExecutionRecord> = {}): ProductionExecutionRecord =>
  ({ ...baseExecution, lotId, resourceId, scheduledStart: '2026-07-10T00:00:00-03:00', ...overrides });
const at = (time: string) => `2026-07-10T${time}:00-03:00`;

const lots: readonly Lot[] = [
  lot('lot-t-completed', 'DC01', '08:00', '09:00'),
  lot('lot-t-delayed', 'DC01', '09:30', '10:30'),
  lot('lot-t-propagated', 'DC01', '13:00', '14:00'),
  lot('lot-t-healthy-scheduled', 'DC02', '13:00', '14:00'),
  lot('lot-t-not-started', 'DC04', '10:00', '11:00'),
  lot('lot-t-running', 'DC05', '11:30', '12:30'),
];
const executionsByLotId: Record<string, ProductionExecutionRecord> = {
  'lot-t-completed': execution('lot-t-completed', 'DC01', { status: 'COMPLETED', actualStart: at('08:00'), actualFinish: at('09:00'), producedQuantity: 100 }),
  'lot-t-delayed': execution('lot-t-delayed', 'DC01', { status: 'IN_PROGRESS', actualStart: at('09:50'), producedQuantity: 40 }),
  'lot-t-propagated': execution('lot-t-propagated', 'DC01'),
  'lot-t-healthy-scheduled': execution('lot-t-healthy-scheduled', 'DC02'),
  'lot-t-not-started': execution('lot-t-not-started', 'DC04'),
  'lot-t-running': execution('lot-t-running', 'DC05', { status: 'IN_PROGRESS', actualStart: at('11:32'), producedQuantity: 40 }),
};
const currentTime = at('12:00');

describe('property dataset at Scenario Clock 12:00 — full state space in one deterministic pass', () => {
  const snapshots = buildRequirementSnapshots(lots, executionsByLotId, currentTime);

  it('produces one snapshot per real requirement', () => {
    expect(snapshots).toHaveLength(6);
  });

  it('shows simultaneous diversity — every one of the five minimal states appears', () => {
    const statuses = new Set(snapshots.map((snapshot) => snapshot.status));
    expect(statuses).toEqual(new Set(['COMPLETED', 'RUNNING', 'DELAYED', 'NOT_STARTED', 'SCHEDULED']));
  });

  it('DC05 has a healthy RUNNING lot within its scheduled window', () => {
    const running = snapshots.find((snapshot) => snapshot.lot.id === 'lot-t-running')!;
    expect(running.status).toBe('RUNNING');
    expect(running.execution.producedQuantity).toBe(40);
    expect(running.projectedFinish).toBe(new Date(Date.parse(at('12:32'))).toISOString());
    expect(running.projection).toBe('ON_TIME'); // +2min is healthy pace, not risk
  });

  it('DC01 is DELAYED past its scheduled finish because it started late, and the delay is visible in the projection', () => {
    const delayed = snapshots.find((snapshot) => snapshot.lot.id === 'lot-t-delayed')!;
    expect(delayed.status).toBe('DELAYED');
    expect(delayed.varianceMinutes).toBe(20);
    expect(delayed.projectedFinish).toBe(new Date(Date.parse(at('10:50'))).toISOString());
    expect(delayed.projection).toBe('AT_RISK'); // DELAYED is always AT_RISK, unconditionally
  });

  it('DC04 has a requirement whose scheduled start has passed with no appointment — NOT_STARTED, never a fabricated zero', () => {
    const notStarted = snapshots.find((snapshot) => snapshot.lot.id === 'lot-t-not-started')!;
    expect(notStarted.status).toBe('NOT_STARTED');
    expect(notStarted.execution.producedQuantity).toBe(0);
    expect(notStarted.execution.actualStart).toBeUndefined();
    expect(notStarted.projection).toBe('AT_RISK');
  });

  it('DC01 propagates its delayed lot forward to the next SCHEDULED lot on the same Resource only', () => {
    const next = snapshots.find((snapshot) => snapshot.lot.id === 'lot-t-propagated')!;
    expect(next.status).toBe('SCHEDULED');
    expect(next.projectedFinish).toBe(new Date(Date.parse(at('14:20'))).toISOString());
    expect(next.projection).toBe('AT_RISK'); // +20min inherited exceeds tolerance
  });

  it('a Resource with no known delay keeps its next SCHEDULED lot ON_TIME', () => {
    const next = snapshots.find((snapshot) => snapshot.lot.id === 'lot-t-healthy-scheduled')!;
    expect(next.status).toBe('SCHEDULED');
    expect(next.projection).toBe('ON_TIME');
  });

  it('day totals: planned, actual, running and remaining reconcile deterministically', () => {
    const totals = summarizeDay(snapshots);
    expect(totals.plannedQuantity).toBe(600);
    expect(totals.actualQuantity).toBe(100);
    expect(totals.runningQuantity).toBe(80);
    expect(totals.remainingQuantity).toBe(420);
    expect(totals.atRiskLotIds).toContain('lot-t-delayed');
    expect(totals.atRiskLotIds).toContain('lot-t-not-started');
    expect(totals.atRiskLotIds).toContain('lot-t-propagated');
  });

  it('a healthy +2min variance does not register as at-risk — only meaningful delays do', () => {
    const totals = summarizeDay(snapshots);
    expect(totals.atRiskLotIds).toEqual(['lot-t-delayed', 'lot-t-propagated', 'lot-t-not-started']);
  });
});
