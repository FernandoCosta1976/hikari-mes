import { describe, expect, it } from 'vitest';
import { canCompleteExecution, completeExecution, pauseExecution, resumeExecution, startExecution, type ProductionExecutionRecord } from './models';

const notStarted: ProductionExecutionRecord = { lotId: 'lot-sd-509', productionOrderId: 'po-a', resourceId: 'DC01', scheduleVersionId: 'v01', plannedQuantity: 100, scheduledStart: '2026-07-10T08:00:00-03:00', status: 'NOT_STARTED', pauses: [], transitions: [], demonstrative: true, dataOrigin: 'SOURCE_DERIVED_PLAN', ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' };

describe('Capability 05 — Start (Section 7/8/12)', () => {
  it('Released + Not Started → Start allowed', () => {
    const started = startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo');
    expect(started.status).toBe('IN_PROGRESS');
  });

  it('Not Released → Start forbidden (covers NOT_RELEASED/READY_FOR_RELEASE/RELEASE_ATTENTION/BLOCKED — the caller collapses all non-RELEASED statuses to released=false)', () => {
    expect(startExecution(notStarted, false, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo')).toBe(notStarted);
  });

  it('Start → RUNNING', () => {
    expect(startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo').status).toBe('IN_PROGRESS');
  });

  it('Start creates actualStart at the given (Session Clock) instant', () => {
    expect(startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo').actualStart).toBe('2026-07-10T08:15:00-03:00');
  });

  it('Start registers the operator (displayName and operatorId)', () => {
    const started = startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo', 'operator-01');
    expect(started.executedBy).toBe('Operador 01 · demonstrativo');
    expect(started.operatorId).toBe('operator-01');
  });

  it('Start preserves scheduled times, component, quantity — none of those live on the Execution record\'s own inputs and Start never overwrites plannedQuantity/scheduledStart', () => {
    const started = startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo');
    expect(started.scheduledStart).toBe(notStarted.scheduledStart);
    expect(started.plannedQuantity).toBe(100);
  });

  it('Start sets actualResource (resourceId) and plannedResourceId separately — Execution never changes which Resource is programmed', () => {
    const started = startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo', 'operator-01', 'DC01');
    expect(started.resourceId).toBe('DC01');
    expect(started.plannedResourceId).toBe('DC01');
  });

  it('Start logs a STARTED transition', () => {
    const started = startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo');
    expect(started.transitions).toHaveLength(1);
    expect(started.transitions[0]).toMatchObject({ kind: 'STARTED', at: '2026-07-10T08:15:00-03:00' });
  });

  it('Start is a no-op on an already-started record', () => {
    const started = startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo');
    expect(startExecution(started, true, '2026-07-10T08:30:00-03:00', 'Operador 01 · demonstrativo')).toBe(started);
  });
});

describe('Capability 05 — Pause/Resume (Section 13/14/15)', () => {
  const started = startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo');

  it('Running → Pause is allowed', () => {
    expect(pauseExecution(started, '2026-07-10T08:30:00-03:00', 'MACHINE_ADJUSTMENT', 'Operador 01 · demonstrativo').status).toBe('PAUSED');
  });

  it('Pause → PAUSED, records reason and a PAUSED transition', () => {
    const paused = pauseExecution(started, '2026-07-10T08:30:00-03:00', 'MACHINE_ADJUSTMENT', 'Operador 01 · demonstrativo');
    expect(paused.status).toBe('PAUSED');
    expect(paused.pauses.at(-1)).toMatchObject({ pausedAt: '2026-07-10T08:30:00-03:00', reason: 'MACHINE_ADJUSTMENT' });
    expect(paused.transitions.at(-1)).toMatchObject({ kind: 'PAUSED' });
  });

  it('Execution Pause is never automatically an OEE Downtime Classification — the pause fact carries no OEE dimension of its own', () => {
    const paused = pauseExecution(started, '2026-07-10T08:30:00-03:00', 'MACHINE_ADJUSTMENT', 'Operador 01 · demonstrativo');
    expect(paused.pauses.at(-1)).not.toHaveProperty('oeeClassification');
  });

  it('Paused → Resume is allowed', () => {
    const paused = pauseExecution(started, '2026-07-10T08:30:00-03:00', 'MACHINE_ADJUSTMENT', 'Operador 01 · demonstrativo');
    expect(resumeExecution(paused, '2026-07-10T08:45:00-03:00', 'Operador 01 · demonstrativo').status).toBe('IN_PROGRESS');
  });

  it('Resume → RUNNING, closes the pause window and logs a RESUMED transition', () => {
    const paused = pauseExecution(started, '2026-07-10T08:30:00-03:00', 'MACHINE_ADJUSTMENT', 'Operador 01 · demonstrativo');
    const resumed = resumeExecution(paused, '2026-07-10T08:45:00-03:00', 'Operador 01 · demonstrativo');
    expect(resumed.status).toBe('IN_PROGRESS');
    expect(resumed.pauses.at(-1)?.resumedAt).toBe('2026-07-10T08:45:00-03:00');
    expect(resumed.transitions.at(-1)).toMatchObject({ kind: 'RESUMED' });
  });

  it('Pause duration is correct — resumedAt minus pausedAt', () => {
    const paused = pauseExecution(started, '2026-07-10T08:30:00-03:00', 'MACHINE_ADJUSTMENT', 'Operador 01 · demonstrativo');
    const resumed = resumeExecution(paused, '2026-07-10T08:45:00-03:00', 'Operador 01 · demonstrativo');
    const pause = resumed.pauses.at(-1)!;
    expect((Date.parse(pause.resumedAt!) - Date.parse(pause.pausedAt)) / 60_000).toBe(15);
  });

  it('Pause on a NOT_STARTED or already-PAUSED record is a no-op', () => {
    expect(pauseExecution(notStarted, '2026-07-10T08:30:00-03:00', 'MACHINE_ADJUSTMENT', 'Operador 01 · demonstrativo')).toBe(notStarted);
    const paused = pauseExecution(started, '2026-07-10T08:30:00-03:00', 'MACHINE_ADJUSTMENT', 'Operador 01 · demonstrativo');
    expect(pauseExecution(paused, '2026-07-10T08:40:00-03:00', 'MACHINE_ADJUSTMENT', 'Operador 01 · demonstrativo')).toBe(paused);
  });

  it('Resume on a NOT_STARTED or already-RUNNING record is a no-op', () => {
    expect(resumeExecution(notStarted, '2026-07-10T08:30:00-03:00', 'Operador 01 · demonstrativo')).toBe(notStarted);
    expect(resumeExecution(started, '2026-07-10T08:30:00-03:00', 'Operador 01 · demonstrativo')).toBe(started);
  });
});

describe('Capability 06 — Complete depends on Production Confirmation (Section 18)', () => {
  const started = startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo');

  it('Complete blocked while confirmed produced quantity is below Planned Quantity', () => {
    expect(canCompleteExecution(started, 80)).toBe(false);
    expect(completeExecution(started, 80, '2026-07-10T09:05:00-03:00', 'Operador 01 · demonstrativo')).toBe(started);
  });

  it('Complete allowed once confirmed produced quantity reaches (or, defensively, exceeds) Planned Quantity', () => {
    expect(canCompleteExecution(started, 100)).toBe(true);
    expect(canCompleteExecution(started, 101)).toBe(true);
  });

  it('Complete → COMPLETED, sets actualFinish, logs a COMPLETED transition — never touches quantity, which lives in Production Confirmation', () => {
    const completed = completeExecution(started, 100, '2026-07-10T09:05:00-03:00', 'Operador 01 · demonstrativo');
    expect(completed).toMatchObject({ status: 'COMPLETED', actualFinish: '2026-07-10T09:05:00-03:00', plannedQuantity: 100 });
    expect(completed.transitions.at(-1)).toMatchObject({ kind: 'COMPLETED' });
  });

  it('Complete on a NOT_STARTED or PAUSED record is a no-op regardless of confirmed quantity', () => {
    expect(completeExecution(notStarted, 100, '2026-07-10T10:00:00-03:00', 'Operador 01 · demonstrativo')).toBe(notStarted);
    const paused = pauseExecution(started, '2026-07-10T08:30:00-03:00', 'MACHINE_ADJUSTMENT', 'Operador 01 · demonstrativo');
    expect(completeExecution(paused, 100, '2026-07-10T10:00:00-03:00', 'Operador 01 · demonstrativo')).toBe(paused);
  });

  it('Historical Completed is immutable — Start/Pause/Resume/Complete are all no-ops on an already-COMPLETED record', () => {
    const completed = completeExecution(started, 100, '2026-07-10T09:05:00-03:00', 'Operador 01 · demonstrativo');
    expect(startExecution(completed, true, '2026-07-10T10:00:00-03:00', 'Operador 01 · demonstrativo')).toBe(completed);
    expect(pauseExecution(completed, '2026-07-10T10:00:00-03:00', 'MACHINE_ADJUSTMENT', 'Operador 01 · demonstrativo')).toBe(completed);
    expect(resumeExecution(completed, '2026-07-10T10:00:00-03:00', 'Operador 01 · demonstrativo')).toBe(completed);
    expect(completeExecution(completed, 100, '2026-07-10T10:00:00-03:00', 'Operador 01 · demonstrativo')).toBe(completed);
  });
});

describe('Capability 05 — temporal-consistency invariants (Section 36)', () => {
  it('actualStart is never before the release instant — Start only ever runs with released=true, and the caller only sets released=true once the Session Clock has already reached the release instant', () => {
    const releasedAt = '2026-07-10T08:00:00-03:00';
    const started = startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo');
    expect(Date.parse(started.actualStart!)).toBeGreaterThanOrEqual(Date.parse(releasedAt));
  });

  it('completedAt is never before actualStart', () => {
    const started = startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo');
    const completed = completeExecution(started, 100, '2026-07-10T09:05:00-03:00', 'Operador 01 · demonstrativo');
    expect(Date.parse(completed.actualFinish!)).toBeGreaterThanOrEqual(Date.parse(completed.actualStart!));
  });

  it('a resume is never before its own pause', () => {
    const started = startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo');
    const paused = pauseExecution(started, '2026-07-10T08:30:00-03:00', 'MACHINE_ADJUSTMENT', 'Operador 01 · demonstrativo');
    const resumed = resumeExecution(paused, '2026-07-10T08:45:00-03:00', 'Operador 01 · demonstrativo');
    const pause = resumed.pauses.at(-1)!;
    expect(Date.parse(pause.resumedAt!)).toBeGreaterThanOrEqual(Date.parse(pause.pausedAt));
  });

  it('successive pause intervals never overlap — each new pause starts at or after the previous one resumed', () => {
    const started = startExecution(notStarted, true, '2026-07-10T08:15:00-03:00', 'Operador 01 · demonstrativo');
    const paused1 = pauseExecution(started, '2026-07-10T08:30:00-03:00', 'MACHINE_ADJUSTMENT', 'Operador 01 · demonstrativo');
    const resumed1 = resumeExecution(paused1, '2026-07-10T08:45:00-03:00', 'Operador 01 · demonstrativo');
    const paused2 = pauseExecution(resumed1, '2026-07-10T09:00:00-03:00', 'MATERIAL_SHORTAGE', 'Operador 01 · demonstrativo');
    const resumed2 = resumeExecution(paused2, '2026-07-10T09:10:00-03:00', 'Operador 01 · demonstrativo');
    expect(resumed2.pauses).toHaveLength(2);
    const [first, second] = resumed2.pauses;
    expect(Date.parse(second.pausedAt)).toBeGreaterThanOrEqual(Date.parse(first.resumedAt!));
  });
});
