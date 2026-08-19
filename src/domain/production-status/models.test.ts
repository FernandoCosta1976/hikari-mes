import { describe, expect, it } from 'vitest';
import {
  buildOperationalStatus,
  buildOperationalStatusMap,
  buildStatusHistory,
  deriveAdherenceQualifier,
  deriveFlowStatus,
  deriveOperationalStatus,
  deriveResourceOperationalStatus,
  deriveResourceStatusEntries,
  isPendingFinalization,
  isWorkInProcess,
  lastStatusChange,
  summarizeOperationalSnapshot,
} from './models';
import type { ProductionExecutionRecord } from '../production-execution/models';
import type { Lot } from '../production-scheduling/models';

const lot = (overrides: Partial<Lot> = {}): Lot => ({
  id: 'lot-sd-501',
  lotNumber: '501',
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
  lotId: 'lot-sd-501',
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

describe('Capability 07 — Operational Status precedence (Section 5/35)', () => {
  it('COMPLETED execution → operational status COMPLETED', () => {
    expect(deriveOperationalStatus({ executionStatus: 'COMPLETED', releaseStatus: 'RELEASED', readinessStatus: 'READY' })).toBe('COMPLETED');
  });

  it('PAUSED execution → operational status PAUSED', () => {
    expect(deriveOperationalStatus({ executionStatus: 'PAUSED', releaseStatus: 'RELEASED', readinessStatus: 'READY' })).toBe('PAUSED');
  });

  it('IN_PROGRESS execution → operational status RUNNING', () => {
    expect(deriveOperationalStatus({ executionStatus: 'IN_PROGRESS', releaseStatus: 'RELEASED', readinessStatus: 'READY' })).toBe('RUNNING');
  });

  it('RELEASED + NOT_STARTED → WAITING_START', () => {
    expect(deriveOperationalStatus({ executionStatus: 'NOT_STARTED', releaseStatus: 'RELEASED', readinessStatus: 'READY' })).toBe('WAITING_START');
  });

  it('READY_FOR_RELEASE → READY_FOR_RELEASE', () => {
    expect(deriveOperationalStatus({ executionStatus: 'NOT_STARTED', releaseStatus: 'READY_FOR_RELEASE', readinessStatus: 'READY' })).toBe('READY_FOR_RELEASE');
  });

  it('BLOCKED readiness → blocked preparation status', () => {
    expect(deriveOperationalStatus({ executionStatus: 'NOT_STARTED', releaseStatus: 'BLOCKED_FOR_RELEASE', readinessStatus: 'BLOCKED' })).toBe('BLOCKED');
    expect(deriveOperationalStatus({ executionStatus: 'NOT_STARTED', releaseStatus: undefined, readinessStatus: 'BLOCKED' })).toBe('BLOCKED');
  });

  it('ATTENTION/UNKNOWN readiness with no release progress → WAITING_PREPARATION', () => {
    expect(deriveOperationalStatus({ executionStatus: 'NOT_STARTED', releaseStatus: 'RELEASE_ATTENTION', readinessStatus: 'ATTENTION' })).toBe('WAITING_PREPARATION');
    expect(deriveOperationalStatus({ executionStatus: 'NOT_STARTED', releaseStatus: 'NOT_RELEASED', readinessStatus: 'UNKNOWN' })).toBe('WAITING_PREPARATION');
  });

  it('no evidence at all → PLANNED', () => {
    expect(deriveOperationalStatus({ executionStatus: 'NOT_STARTED', releaseStatus: 'NOT_RELEASED', readinessStatus: 'READY' })).toBe('PLANNED');
    expect(deriveOperationalStatus({ executionStatus: 'NOT_STARTED', releaseStatus: undefined, readinessStatus: undefined })).toBe('PLANNED');
  });

  it('quantity 100/100 + RUNNING is never COMPLETED — pending finalization instead', () => {
    expect(deriveOperationalStatus({ executionStatus: 'IN_PROGRESS', releaseStatus: 'RELEASED', readinessStatus: 'READY' })).toBe('RUNNING');
    expect(isPendingFinalization('RUNNING', 100, 100)).toBe(true);
  });

  it('quantity 100/100 + COMPLETED = COMPLETED', () => {
    expect(deriveOperationalStatus({ executionStatus: 'COMPLETED', releaseStatus: 'RELEASED', readinessStatus: 'READY' })).toBe('COMPLETED');
    expect(isPendingFinalization('COMPLETED', 100, 100)).toBe(false);
  });

  it('RUNNING below planned quantity is never pending finalization', () => {
    expect(isPendingFinalization('RUNNING', 74, 100)).toBe(false);
  });
});

describe('Capability 07 — Flow dimension never collapses with Execution/Operational Status (Section 3)', () => {
  it('RUNNING/PAUSED/COMPLETED map to EXECUTION flow', () => {
    expect(deriveFlowStatus('RUNNING')).toBe('EXECUTION');
    expect(deriveFlowStatus('PAUSED')).toBe('EXECUTION');
    expect(deriveFlowStatus('COMPLETED')).toBe('EXECUTION');
  });

  it('READY_FOR_RELEASE/WAITING_START map to RELEASE flow', () => {
    expect(deriveFlowStatus('READY_FOR_RELEASE')).toBe('RELEASE');
    expect(deriveFlowStatus('WAITING_START')).toBe('RELEASE');
  });

  it('PLANNED/WAITING_PREPARATION/BLOCKED map to PREPARATION flow', () => {
    expect(deriveFlowStatus('PLANNED')).toBe('PREPARATION');
    expect(deriveFlowStatus('WAITING_PREPARATION')).toBe('PREPARATION');
    expect(deriveFlowStatus('BLOCKED')).toBe('PREPARATION');
  });
});

describe('Capability 07 — Adherence qualifier combinations (Section 6/36)', () => {
  const currentTime = '2026-07-10T09:15:00-03:00';

  it('RUNNING + ON_TIME — still within scheduled finish', () => {
    expect(deriveAdherenceQualifier({ executionStatus: 'RUNNING', scheduledStart: '2026-07-10T08:00:00-03:00', scheduledFinish: '2026-07-10T10:00:00-03:00', currentTime })).toBe('ON_TIME');
  });

  it('RUNNING + LATE — past scheduled finish while still running', () => {
    expect(deriveAdherenceQualifier({ executionStatus: 'RUNNING', scheduledStart: '2026-07-10T08:00:00-03:00', scheduledFinish: '2026-07-10T09:00:00-03:00', currentTime })).toBe('LATE');
  });

  it('WAITING_START + LATE — scheduled start already passed with no appointment', () => {
    expect(deriveAdherenceQualifier({ executionStatus: 'NOT_STARTED', scheduledStart: '2026-07-10T08:30:00-03:00', scheduledFinish: '2026-07-10T09:30:00-03:00', currentTime })).toBe('LATE');
  });

  it('WAITING_START + ON_TIME — scheduled start still ahead', () => {
    expect(deriveAdherenceQualifier({ executionStatus: 'NOT_STARTED', scheduledStart: '2026-07-10T10:00:00-03:00', scheduledFinish: '2026-07-10T11:00:00-03:00', currentTime })).toBe('ON_TIME');
  });

  it('COMPLETED + EARLY (Adiantado)', () => {
    expect(deriveAdherenceQualifier({ executionStatus: 'COMPLETED', scheduledStart: '2026-07-10T08:00:00-03:00', scheduledFinish: '2026-07-10T09:00:00-03:00', actualFinish: '2026-07-10T08:50:00-03:00', currentTime })).toBe('AHEAD');
  });

  it('COMPLETED + ON_TIME', () => {
    expect(deriveAdherenceQualifier({ executionStatus: 'COMPLETED', scheduledStart: '2026-07-10T08:00:00-03:00', scheduledFinish: '2026-07-10T09:00:00-03:00', actualFinish: '2026-07-10T09:01:00-03:00', currentTime })).toBe('ON_TIME');
  });

  it('COMPLETED + LATE', () => {
    expect(deriveAdherenceQualifier({ executionStatus: 'COMPLETED', scheduledStart: '2026-07-10T08:00:00-03:00', scheduledFinish: '2026-07-10T09:00:00-03:00', actualFinish: '2026-07-10T09:20:00-03:00', currentTime })).toBe('LATE');
  });

  it('RUNNING + AT_RISK — still before scheduled finish but projected finish is meaningfully late', () => {
    expect(deriveAdherenceQualifier({ executionStatus: 'RUNNING', scheduledStart: '2026-07-10T08:00:00-03:00', scheduledFinish: '2026-07-10T10:00:00-03:00', projectedFinish: '2026-07-10T10:20:00-03:00', currentTime })).toBe('AT_RISK');
  });
});

describe('Capability 07 — Resource Operational Status (Section 9/37)', () => {
  it('current RUNNING → PRODUZINDO', () => {
    expect(deriveResourceOperationalStatus('RUNNING')).toBe('PRODUCING');
  });

  it('current PAUSED → EM PAUSA', () => {
    expect(deriveResourceOperationalStatus('PAUSED')).toBe('PAUSED');
  });

  it('released waiting → AGUARDANDO INÍCIO', () => {
    expect(deriveResourceOperationalStatus('WAITING_START')).toBe('WAITING_START');
  });

  it('no current requirement at all → SEM NECESSIDADE ATIVA', () => {
    expect(deriveResourceOperationalStatus(null)).toBe('NO_ACTIVE_REQUIREMENT');
    expect(deriveResourceOperationalStatus('COMPLETED')).toBe('NO_ACTIVE_REQUIREMENT');
  });

  it('blocked requirement → ATENÇÃO', () => {
    expect(deriveResourceOperationalStatus('BLOCKED')).toBe('ATTENTION');
  });

  /**
   * Final Presentation Blocker Correction round — Blocker 1. A Requirement
   * that exists, is not yet COMPLETED, and has not started producing (any
   * pre-execution bucket) still has real pending work — SEM NECESSIDADE
   * ATIVA is prohibited for it, even when it is already LATE. Only a
   * genuinely empty Resource (currentStatus === null) or one whose current
   * Requirement is already COMPLETED with nothing queued may report it.
   */
  it('REGRESSION (Blocker 1): a pending, not-yet-started Requirement never reports SEM NECESSIDADE ATIVA, even when LATE — PLANNED/WAITING_PREPARATION/READY_FOR_RELEASE/WAITING_START all report AGUARDANDO INÍCIO', () => {
    for (const status of ['PLANNED', 'WAITING_PREPARATION', 'READY_FOR_RELEASE', 'WAITING_START'] as const) {
      const resourceStatus = deriveResourceOperationalStatus(status);
      expect(resourceStatus, status).toBe('WAITING_START');
      expect(resourceStatus, status).not.toBe('NO_ACTIVE_REQUIREMENT');
    }
  });
});

describe('Capability 07 — WIP foundation (Section 11/12/13)', () => {
  it('WIP is RUNNING or PAUSED only — never PLANNED, WAITING_START or COMPLETED', () => {
    expect(isWorkInProcess('RUNNING')).toBe(true);
    expect(isWorkInProcess('PAUSED')).toBe(true);
    expect(isWorkInProcess('WAITING_START')).toBe(false);
    expect(isWorkInProcess('COMPLETED')).toBe(false);
    expect(isWorkInProcess('PLANNED')).toBe(false);
  });

  it('Operational Snapshot summary derives real counts, never hardcoded', () => {
    const summary = summarizeOperationalSnapshot([
      { status: 'RUNNING', adherence: 'ON_TIME', producedQuantity: 74 },
      { status: 'RUNNING', adherence: 'LATE', producedQuantity: 40 },
      { status: 'PAUSED', adherence: 'AT_RISK', producedQuantity: 12 },
      { status: 'WAITING_START', adherence: 'LATE', producedQuantity: 0 },
      { status: 'COMPLETED', adherence: 'AHEAD', producedQuantity: 100 },
    ]);
    expect(summary).toEqual({
      totalCount: 5,
      running: 2,
      paused: 1,
      waitingStart: 1,
      completed: 1,
      late: 2,
      atRisk: 1,
      wipRequirementCount: 3,
      wipQuantity: 126,
      demonstrative: true,
    });
  });
});

describe('Capability 07 — Status History reuses existing transitions, not a new store (Section 28/29)', () => {
  it('builds a readable history from execution.transitions', () => {
    const record = execution({
      status: 'PAUSED',
      transitions: [
        { kind: 'RELEASED', at: '2026-07-10T08:32:00-03:00', actor: 'Supervisor', dataOrigin: 'DEMONSTRATIVE_EXECUTION' },
        { kind: 'STARTED', at: '2026-07-10T08:40:00-03:00', actor: 'Operador', dataOrigin: 'DEMONSTRATIVE_EXECUTION' },
        { kind: 'PAUSED', at: '2026-07-10T08:57:00-03:00', actor: 'Operador', dataOrigin: 'DEMONSTRATIVE_EXECUTION' },
      ],
    });
    expect(buildStatusHistory(record)).toEqual([
      { kind: 'RELEASED', at: '2026-07-10T08:32:00-03:00', label: 'Liberado' },
      { kind: 'STARTED', at: '2026-07-10T08:40:00-03:00', label: 'Iniciado' },
      { kind: 'PAUSED', at: '2026-07-10T08:57:00-03:00', label: 'Pausado' },
    ]);
    expect(lastStatusChange(record)).toEqual({ kind: 'PAUSED', at: '2026-07-10T08:57:00-03:00', label: 'Pausado' });
  });
});

describe('Capability 07 — buildOperationalStatus end-to-end (Section 4/18/19)', () => {
  it('RUNNING with confirmed quantity below planned, then Production Confirmation only changes progress not status', () => {
    const record = execution({ status: 'IN_PROGRESS', actualStart: '2026-07-10T08:00:00-03:00' });
    const before = buildOperationalStatus({ lot: lot(), execution: record, releaseStatus: 'RELEASED', readinessStatus: 'READY', producedQuantity: 74, currentTime: '2026-07-10T08:30:00-03:00' });
    expect(before.status).toBe('RUNNING');
    expect(before.pendingFinalization).toBe(false);

    const after = buildOperationalStatus({ lot: lot(), execution: record, releaseStatus: 'RELEASED', readinessStatus: 'READY', producedQuantity: 87, currentTime: '2026-07-10T08:35:00-03:00' });
    expect(after.status).toBe('RUNNING');
    expect(after.pendingFinalization).toBe(false);
  });

  it('reaching planned quantity while RUNNING reads as pending finalization, never COMPLETED', () => {
    const record = execution({ status: 'IN_PROGRESS', actualStart: '2026-07-10T08:00:00-03:00' });
    const status = buildOperationalStatus({ lot: lot(), execution: record, releaseStatus: 'RELEASED', readinessStatus: 'READY', producedQuantity: 100, currentTime: '2026-07-10T08:55:00-03:00' });
    expect(status.status).toBe('RUNNING');
    expect(status.pendingFinalization).toBe(true);
  });

  it('the explicit Complete action (execution COMPLETED) is what yields status COMPLETED', () => {
    const record = execution({ status: 'COMPLETED', actualStart: '2026-07-10T08:00:00-03:00', actualFinish: '2026-07-10T08:58:00-03:00' });
    const status = buildOperationalStatus({ lot: lot(), execution: record, releaseStatus: 'RELEASED', readinessStatus: 'READY', producedQuantity: 100, currentTime: '2026-07-10T09:00:00-03:00' });
    expect(status.status).toBe('COMPLETED');
    expect(status.pendingFinalization).toBe(false);
  });
});

describe('Capability 07 — shared status map and Current/Next Requirement per Resource (Section 15/32/38)', () => {
  const runningLot = lot({ id: 'lot-a', scheduledResourceId: 'DC01', scheduledStart: '2026-07-10T08:00:00-03:00', scheduledFinish: '2026-07-10T09:00:00-03:00' });
  const nextLot = lot({ id: 'lot-b', scheduledResourceId: 'DC01', scheduledStart: '2026-07-10T09:00:00-03:00', scheduledFinish: '2026-07-10T10:00:00-03:00' });
  const idleResourceLot = lot({ id: 'lot-c', scheduledResourceId: 'DC02', scheduledStart: '2026-07-10T07:00:00-03:00', scheduledFinish: '2026-07-10T08:00:00-03:00' });

  const runningExecution = execution({ lotId: 'lot-a', resourceId: 'DC01', status: 'IN_PROGRESS', actualStart: '2026-07-10T08:00:00-03:00' });
  const nextExecution = execution({ lotId: 'lot-b', resourceId: 'DC01', status: 'NOT_STARTED' });
  const completedExecution = execution({ lotId: 'lot-c', resourceId: 'DC02', status: 'COMPLETED', actualStart: '2026-07-10T07:00:00-03:00', actualFinish: '2026-07-10T07:55:00-03:00' });

  const currentTime = '2026-07-10T08:30:00-03:00';
  const statusByLotId = buildOperationalStatusMap([
    { lot: runningLot, execution: runningExecution, releaseStatus: 'RELEASED', readinessStatus: 'READY', producedQuantity: 40 },
    { lot: nextLot, execution: nextExecution, releaseStatus: 'RELEASED', readinessStatus: 'READY', producedQuantity: 0 },
    { lot: idleResourceLot, execution: completedExecution, releaseStatus: 'RELEASED', readinessStatus: 'READY', producedQuantity: 100 },
  ], currentTime);

  it('builds one shared status per Requirement, keyed by lotId', () => {
    expect(statusByLotId['lot-a'].status).toBe('RUNNING');
    expect(statusByLotId['lot-b'].status).toBe('WAITING_START');
    expect(statusByLotId['lot-c'].status).toBe('COMPLETED');
  });

  it('a Resource with a RUNNING Requirement reports it as current, and the next Scheduled one as next', () => {
    const [dc01] = deriveResourceStatusEntries(['DC01'], { DC01: [runningLot, nextLot] }, statusByLotId);
    expect(dc01.current?.lotId).toBe('lot-a');
    expect(dc01.resourceStatus).toBe('PRODUCING');
    expect(dc01.next).toEqual({ lotId: 'lot-b', scheduledStart: '2026-07-10T09:00:00-03:00' });
  });

  it('a Resource whose only Requirement is already COMPLETED has no current Requirement — SEM NECESSIDADE ATIVA', () => {
    const [dc02] = deriveResourceStatusEntries(['DC02'], { DC02: [idleResourceLot] }, statusByLotId);
    expect(dc02.current).toBeNull();
    expect(dc02.next).toBeNull();
    expect(dc02.resourceStatus).toBe('NO_ACTIVE_REQUIREMENT');
  });
});
