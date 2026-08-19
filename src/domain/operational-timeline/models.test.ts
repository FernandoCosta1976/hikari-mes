import { describe, expect, it } from 'vitest';
import type { ProductionExecutionRecord } from '../production-execution/models';
import type { Lot, Shift } from '../production-scheduling/models';
import { buildOperationalTimeline, timelineRequirementStatus, TIMELINE_TOLERANCE_MINUTES } from './models';

const t = (time: string) => `2026-07-10T${time}:00-03:00`;
const iso = (time: string) => new Date(t(time)).toISOString();

const lot = (overrides: Partial<Lot> & Pick<Lot, 'id' | 'scheduledStart' | 'scheduledFinish' | 'scheduledResourceId'>): Lot => ({
  lotNumber: overrides.id, materialId: 'material-x', quantity: 100, workCenterId: 'wc-1', destination: 'ASSEMBLY',
  productionOrderId: `po-${overrides.id}`, materialAttention: false, state: 'SCHEDULED', ...overrides,
});

const execution = (overrides: Partial<ProductionExecutionRecord> & Pick<ProductionExecutionRecord, 'lotId' | 'status'>): ProductionExecutionRecord => ({
  productionOrderId: `po-${overrides.lotId}`, resourceId: 'DC01', scheduleVersionId: 'v01', plannedQuantity: 100,
  scheduledStart: t('07:00'), pauses: [], transitions: [], demonstrative: true, dataOrigin: 'DEMONSTRATIVE_EXECUTION', ruleStatus: 'BUSINESS_VALIDATION_REQUIRED', ...overrides,
});

/** Real shift/break windows from the reference scenario (fundicaoDcScenario.ts) — used ONLY by the break-nudge test; every other test uses no shifts (empty breaks) to isolate cascade/setup/tolerance logic from break interference. */
const shift1: Shift = { id: 'SHIFT_1', name: 'Turno 1', startTime: '07:00', endTime: '15:14', demonstrative: true, breaks: [
  { id: 'coffee-1', name: 'Café 1', startTime: '08:45', endTime: '09:00', demonstrative: true },
  { id: 'meal', name: 'Refeição', startTime: '10:45', endTime: '11:30', demonstrative: true },
] };

describe('buildOperationalTimeline — Section 6/7/8: cascade propagation', () => {
  it('a delay on A propagates to every future Requirement down the tail, in original order (Section 6/38)', () => {
    const lots = [
      lot({ id: 'A', scheduledStart: t('07:00'), scheduledFinish: t('07:20'), scheduledResourceId: 'DC01' }),
      lot({ id: 'B', scheduledStart: t('07:20'), scheduledFinish: t('07:40'), scheduledResourceId: 'DC01' }),
      lot({ id: 'C', scheduledStart: t('07:40'), scheduledFinish: t('08:00'), scheduledResourceId: 'DC01' }),
    ];
    const executions = {
      A: execution({ lotId: 'A', status: 'COMPLETED', actualStart: t('07:00'), actualFinish: t('07:38') }), // +18 min
      B: execution({ lotId: 'B', status: 'NOT_STARTED' }),
      C: execution({ lotId: 'C', status: 'NOT_STARTED' }),
    };
    const entries = buildOperationalTimeline(lots, executions, t('07:38'));
    const byId = Object.fromEntries(entries.map((e) => [e.requirementId, e]));
    expect(byId.A.currentFinish).toBe(iso('07:38'));
    expect(byId.B.currentStart).toBe(iso('07:38'));
    expect(byId.B.currentFinish).toBe(iso('07:58')); // same 20 min nominal duration, shifted +18
    expect(byId.B.replanned).toBe(true);
    expect(byId.C.currentStart).toBe(iso('07:58'));
    expect(byId.C.currentFinish).toBe(iso('08:18'));
    expect(byId.C.varianceMinutes).toBe(18);
  });

  it('a predecessor finishing EARLY advances the successor (Section 7)', () => {
    const lots = [
      lot({ id: 'A', scheduledStart: t('07:00'), scheduledFinish: t('08:00'), scheduledResourceId: 'DC02' }),
      lot({ id: 'B', scheduledStart: t('08:00'), scheduledFinish: t('09:00'), scheduledResourceId: 'DC02' }),
    ];
    const executions = {
      A: execution({ lotId: 'A', resourceId: 'DC02', status: 'COMPLETED', actualStart: t('07:00'), actualFinish: t('07:45') }), // -15 min
      B: execution({ lotId: 'B', resourceId: 'DC02', status: 'NOT_STARTED' }),
    };
    const entries = buildOperationalTimeline(lots, executions, t('07:50'));
    const b = entries.find((e) => e.requirementId === 'B')!;
    expect(b.currentStart).toBe(iso('07:45'));
    expect(b.varianceMinutes).toBe(-15);
  });

  it('a variance within tolerance (10 min) never SHOWS as a replan, but Current Start still tracks the real chain finish — snapping it back to Original would overlap a predecessor that only just freed the Resource (Section 8/11/43)', () => {
    const lots = [
      lot({ id: 'A', scheduledStart: t('07:00'), scheduledFinish: t('08:00'), scheduledResourceId: 'DC03' }),
      lot({ id: 'B', scheduledStart: t('08:00'), scheduledFinish: t('09:00'), scheduledResourceId: 'DC03' }),
    ];
    const executions = {
      A: execution({ lotId: 'A', resourceId: 'DC03', status: 'COMPLETED', actualStart: t('07:00'), actualFinish: t('08:04') }), // +4 min, within tolerance
      B: execution({ lotId: 'B', resourceId: 'DC03', status: 'NOT_STARTED' }),
    };
    const entries = buildOperationalTimeline(lots, executions, t('08:10'));
    const b = entries.find((e) => e.requirementId === 'B')!;
    expect(b.currentStart).toBe(iso('08:04')); // A only actually finished at 08:04 — B cannot start before that
    expect(b.replanned).toBe(false); // still not flagged as a replan — the deviation is cosmetically negligible
    expect(TIMELINE_TOLERANCE_MINUTES).toBe(10);
  });

  it('recovery after a delay reduces the downstream net delta — a smaller delay follows a bigger one (Section 39)', () => {
    const lots = [
      lot({ id: 'A', scheduledStart: t('07:00'), scheduledFinish: t('07:20'), scheduledResourceId: 'DC04' }),
      lot({ id: 'B', scheduledStart: t('07:20'), scheduledFinish: t('07:40'), scheduledResourceId: 'DC04' }),
      lot({ id: 'C', scheduledStart: t('07:40'), scheduledFinish: t('08:00'), scheduledResourceId: 'DC04' }),
    ];
    const executions = {
      A: execution({ lotId: 'A', resourceId: 'DC04', status: 'COMPLETED', actualStart: t('07:00'), actualFinish: t('07:30') }), // +10 vs 20min nominal
      B: execution({ lotId: 'B', resourceId: 'DC04', status: 'COMPLETED', actualStart: t('07:30'), actualFinish: t('07:42') }), // 12min run vs 20min nominal (-8 relative to its own cascaded slot of 07:30-07:50)
      C: execution({ lotId: 'C', resourceId: 'DC04', status: 'NOT_STARTED' }),
    };
    const entries = buildOperationalTimeline(lots, executions, t('07:45'));
    const byId = Object.fromEntries(entries.map((e) => [e.requirementId, e]));
    expect(byId.B.currentFinish).toBe(iso('07:42')); // Actual, immutable once COMPLETED
    // Net vs C's Original Start (07:40): chain finish 07:42 -> +2 min, inside tolerance -> not flagged as replanned, but Current Start still tracks the real chain finish (07:42), never overlapping B.
    expect(byId.C.currentStart).toBe(iso('07:42'));
    expect(byId.C.replanned).toBe(false);
  });

  it('a delay that survives partial recovery still replans the tail beyond tolerance', () => {
    const lots = [
      lot({ id: 'A', scheduledStart: t('07:00'), scheduledFinish: t('07:20'), scheduledResourceId: 'DC04' }),
      lot({ id: 'B', scheduledStart: t('07:20'), scheduledFinish: t('07:40'), scheduledResourceId: 'DC04' }),
      lot({ id: 'C', scheduledStart: t('07:40'), scheduledFinish: t('08:00'), scheduledResourceId: 'DC04' }),
    ];
    const executions = {
      A: execution({ lotId: 'A', resourceId: 'DC04', status: 'COMPLETED', actualStart: t('07:00'), actualFinish: t('07:40') }), // +20 vs 20min nominal
      B: execution({ lotId: 'B', resourceId: 'DC04', status: 'COMPLETED', actualStart: t('07:40'), actualFinish: t('07:52') }), // 12min run vs 20min nominal (-8 recovery)
      C: execution({ lotId: 'C', resourceId: 'DC04', status: 'NOT_STARTED' }),
    };
    const entries = buildOperationalTimeline(lots, executions, t('07:55'));
    const c = entries.find((e) => e.requirementId === 'C')!;
    expect(c.currentStart).toBe(iso('07:52')); // chain finish carried straight through — net +12 vs Original 07:40
    expect(c.replanned).toBe(true);
    expect(c.varianceMinutes).toBe(12);
  });

  it('never reorders same-Resource Requirements, even under a large delay (Section 35)', () => {
    const lots = [
      lot({ id: 'A', scheduledStart: t('07:00'), scheduledFinish: t('08:00'), scheduledResourceId: 'DC05' }),
      lot({ id: 'B', scheduledStart: t('08:00'), scheduledFinish: t('08:30'), scheduledResourceId: 'DC05' }),
    ];
    const executions = {
      A: execution({ lotId: 'A', resourceId: 'DC05', status: 'COMPLETED', actualStart: t('07:00'), actualFinish: t('09:00') }), // +60
      B: execution({ lotId: 'B', resourceId: 'DC05', status: 'NOT_STARTED' }),
    };
    const entries = buildOperationalTimeline(lots, executions, t('09:05'));
    expect(entries.map((e) => e.requirementId)).toEqual(['A', 'B']);
    expect(entries.find((e) => e.requirementId === 'B')!.currentStart).toBe(iso('09:00'));
  });
});

describe('buildOperationalTimeline — setup and break-aware placement (Section 12/13)', () => {
  it('inserts Setup duration into the Current Start when the successor is a different component (Section 12)', () => {
    const lots = [
      lot({ id: 'A', scheduledStart: t('07:00'), scheduledFinish: t('07:20'), scheduledResourceId: 'DC01', materialId: 'material-x' }),
      lot({ id: 'B', scheduledStart: t('07:20'), scheduledFinish: t('07:40'), scheduledResourceId: 'DC01', materialId: 'material-y' }),
    ];
    const executions = {
      A: execution({ lotId: 'A', status: 'COMPLETED', actualStart: t('07:00'), actualFinish: t('07:40') }), // +20
      B: execution({ lotId: 'B', status: 'NOT_STARTED' }),
    };
    const entries = buildOperationalTimeline(lots, executions, t('07:45'), [], {}, 30);
    const b = entries.find((e) => e.requirementId === 'B')!;
    expect(b.currentStart).toBe(iso('08:10')); // 07:40 + 30min setup
  });

  it('does not insert Setup when the successor is the SAME component', () => {
    const lots = [
      lot({ id: 'A', scheduledStart: t('07:00'), scheduledFinish: t('07:20'), scheduledResourceId: 'DC02', materialId: 'material-x' }),
      lot({ id: 'B', scheduledStart: t('07:20'), scheduledFinish: t('07:40'), scheduledResourceId: 'DC02', materialId: 'material-x' }),
    ];
    const executions = {
      A: execution({ lotId: 'A', resourceId: 'DC02', status: 'COMPLETED', actualStart: t('07:00'), actualFinish: t('07:40') }), // +20
      B: execution({ lotId: 'B', resourceId: 'DC02', status: 'NOT_STARTED' }),
    };
    const entries = buildOperationalTimeline(lots, executions, t('07:45'), [], {}, 30);
    expect(entries.find((e) => e.requirementId === 'B')!.currentStart).toBe(iso('07:40'));
  });

  it("pushes a Current Start that would land inside a Planned Shift Break to the break's end (Section 13)", () => {
    const lots = [
      lot({ id: 'A', scheduledStart: t('08:00'), scheduledFinish: t('08:40'), scheduledResourceId: 'DC03' }),
      lot({ id: 'B', scheduledStart: t('08:40'), scheduledFinish: t('09:20'), scheduledResourceId: 'DC03' }),
    ];
    const executions = {
      A: execution({ lotId: 'A', resourceId: 'DC03', status: 'COMPLETED', actualStart: t('08:00'), actualFinish: t('08:55') }), // +15, past tolerance, candidate lands inside the 08:45-09:00 break
      B: execution({ lotId: 'B', resourceId: 'DC03', status: 'NOT_STARTED' }),
    };
    const entries = buildOperationalTimeline(lots, executions, t('08:58'), [shift1]);
    expect(entries.find((e) => e.requirementId === 'B')!.currentStart).toBe(iso('09:00'));
  });
});

describe('buildOperationalTimeline — immutability (Section 40)', () => {
  it('a RUNNING Requirement keeps Actual Start immutable — only Current/Projected Finish move, driven by known downtime', () => {
    const lots = [lot({ id: 'A', scheduledStart: t('07:00'), scheduledFinish: t('08:00'), scheduledResourceId: 'DC01' })];
    const executions = { A: execution({ lotId: 'A', status: 'IN_PROGRESS', actualStart: t('07:10') }) };
    const entries = buildOperationalTimeline(lots, executions, t('07:40'), [], { A: 12 });
    const a = entries[0];
    expect(a.status).toBe('RUNNING');
    expect(a.currentStart).toBe(iso('07:10'));
    expect(a.currentFinish).toBe(a.projectedFinish);
    expect(a.currentFinish).toBe(iso('08:22')); // 07:10 + 60min nominal + 12min known downtime
  });

  it('a COMPLETED Requirement is historical — Original and Actual never change regardless of cascade inputs', () => {
    const lots = [lot({ id: 'A', scheduledStart: t('07:00'), scheduledFinish: t('08:00'), scheduledResourceId: 'DC01' })];
    const executions = { A: execution({ lotId: 'A', status: 'COMPLETED', actualStart: t('07:05'), actualFinish: t('08:05') }) };
    const entries = buildOperationalTimeline(lots, executions, t('09:00'));
    const a = entries[0];
    expect(a.originalStart).toBe(t('07:00'));
    expect(a.originalFinish).toBe(t('08:00'));
    expect(a.currentStart).toBe(iso('07:05'));
    expect(a.currentFinish).toBe(iso('08:05'));
  });
});

describe('timelineRequirementStatus', () => {
  it('classifies every documented status', () => {
    const l = lot({ id: 'A', scheduledStart: t('07:00'), scheduledFinish: t('08:00'), scheduledResourceId: 'DC01' });
    expect(timelineRequirementStatus(execution({ lotId: 'A', status: 'COMPLETED' }), l, t('09:00'))).toBe('COMPLETED');
    expect(timelineRequirementStatus(execution({ lotId: 'A', status: 'IN_PROGRESS' }), l, t('07:30'))).toBe('RUNNING');
    expect(timelineRequirementStatus(execution({ lotId: 'A', status: 'IN_PROGRESS' }), l, t('08:30'))).toBe('DELAYED');
    expect(timelineRequirementStatus(execution({ lotId: 'A', status: 'NOT_STARTED' }), l, t('07:30'))).toBe('NOT_STARTED');
    expect(timelineRequirementStatus(execution({ lotId: 'A', status: 'NOT_STARTED' }), l, t('06:30'))).toBe('SCHEDULED');
  });
});
