import { describe, expect, it } from 'vitest';
import { buildRequirementSnapshots, requirementStatus, summarizeDay } from './executionStatus';
import { monitoringDowntimeMinutesByLotId, monitoringExecutionsByLotId, monitoringLots, monitoringScenarioClock } from '../../demo/scenarios/fundicaoDcMonitoring1007';
import type { ProductionExecutionRecord } from '../production-execution/models';
import type { Lot } from '../production-scheduling/models';

const baseLot: Lot = { id: 'lot-x', lotNumber: '1', materialId: 'm', quantity: 100, scheduledStart: '2026-07-10T10:00:00-03:00', scheduledFinish: '2026-07-10T11:10:00-03:00', workCenterId: 'wc', destination: 'ASSEMBLY', productionOrderId: 'po', scheduledResourceId: 'DC01', materialAttention: false, state: 'SCHEDULED' };
const baseExecution: ProductionExecutionRecord = { lotId: 'lot-x', productionOrderId: 'po', resourceId: 'DC01', scheduleVersionId: 'v1', plannedQuantity: 100, producedQuantity: 0, scheduledStart: baseLot.scheduledStart, status: 'NOT_STARTED', pauses: [], demonstrative: true };

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

describe('2026-07-10 dataset at Scenario Clock 17:23 (real FOUNDRY_DC requirements only)', () => {
  const snapshots = buildRequirementSnapshots(monitoringLots, monitoringExecutionsByLotId, monitoringScenarioClock, monitoringDowntimeMinutesByLotId);

  it('produces one snapshot per real requirement — 23, matching the canonical dataset for 2026-07-10', () => {
    expect(snapshots).toHaveLength(23);
  });

  it('shows simultaneous diversity across DC01-DC05 — every one of the five minimal states appears', () => {
    const statuses = new Set(snapshots.map((snapshot) => snapshot.status));
    expect(statuses).toEqual(new Set(['COMPLETED', 'RUNNING', 'DELAYED', 'NOT_STARTED', 'SCHEDULED']));
  });

  it('DC01 has a healthy RUNNING lot within its scheduled window', () => {
    const running = snapshots.find((snapshot) => snapshot.lot.id === 'lot-mon-508')!;
    expect(running.status).toBe('RUNNING');
    expect(running.execution.producedQuantity).toBe(30);
    expect(running.projectedFinish).toBe('2026-07-10T21:12:00.000Z'); // 18:12 -03:00
    expect(running.projection).toBe('ON_TIME'); // +2min is healthy pace, not risk
  });

  it('DC03 is DELAYED past its scheduled finish because of the 15-minute unplanned stop, and the delay is visible in the projection', () => {
    const delayed = snapshots.find((snapshot) => snapshot.lot.id === 'lot-mon-514')!;
    expect(delayed.status).toBe('DELAYED');
    expect(delayed.varianceMinutes).toBeGreaterThan(0);
    expect(delayed.projectedFinish).toBe('2026-07-10T20:28:00.000Z'); // 17:28 -03:00
  });

  it('DC04 has a requirement whose scheduled start has passed with no appointment — NOT_STARTED, never a fabricated zero', () => {
    const notStarted = snapshots.find((snapshot) => snapshot.lot.id === 'lot-mon-516')!;
    expect(notStarted.status).toBe('NOT_STARTED');
    expect(notStarted.execution.producedQuantity).toBe(0);
    expect(notStarted.execution.actualStart).toBeUndefined();
    expect(notStarted.projection).toBe('AT_RISK');
  });

  it('DC01 propagates its running lot delay forward to the next SCHEDULED lot on the same Resource only', () => {
    const next = snapshots.find((snapshot) => snapshot.lot.id === 'lot-mon-509')!;
    expect(next.status).toBe('SCHEDULED');
    expect(next.projectedFinish).toBe('2026-07-10T22:57:00.000Z'); // 19:57 -03:00
  });

  it('a Resource with no known delay keeps its next SCHEDULED lot ON_TIME', () => {
    const next = snapshots.find((snapshot) => snapshot.lot.id === 'lot-mon-513')!;
    expect(next.status).toBe('SCHEDULED');
    expect(next.projection).toBe('ON_TIME');
  });

  it('day totals: planned quantity matches the real dataset (2100 pieces across 23 requirements)', () => {
    const totals = summarizeDay(snapshots);
    expect(totals.plannedQuantity).toBe(2100);
    expect(totals.actualQuantity).toBe(1300);
    expect(totals.runningQuantity).toBe(123);
    expect(totals.remainingQuantity).toBe(677);
    expect(totals.atRiskLotIds).toContain('lot-mon-514');
    expect(totals.atRiskLotIds).toContain('lot-mon-516');
  });

  it('a healthy +2min variance does not register as at-risk — only meaningful delays do', () => {
    const totals = summarizeDay(snapshots);
    expect(totals.atRiskLotIds).toEqual(['lot-mon-514', 'lot-mon-516']);
  });
});
