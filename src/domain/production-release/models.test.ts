import { describe, expect, it } from 'vitest';
import { assessDemonstrativeRelease, releaseAutomatically, releaseDemonstratively, revokeRelease, type ProductionReleaseContext } from './models';

const context = (readiness: ProductionReleaseContext['readiness']): ProductionReleaseContext => ({
  lotId: 'lot-sd-407',
  productionOrderId: 'po-source-derived-1b2-e5411-w0',
  resourceId: 'DC01',
  scheduleVersionId: 'v01',
  scheduledStart: '2026-07-09T10:10:00-03:00',
  scheduledFinish: '2026-07-09T11:20:00-03:00',
  readiness,
});

/** Capability 04 — Section 26 domain-level invariants. */
describe('production-release domain (Capability 04)', () => {
  it('1/2. a READY, organized Lot starts as READY_FOR_RELEASE, never as RELEASED — Ready != Released', () => {
    const assessment = assessDemonstrativeRelease(context('READY'));
    expect(assessment.status).toBe('READY_FOR_RELEASE');
    expect(assessment.status).not.toBe('RELEASED');
  });

  it('3. RELEASED only happens through the explicit releaseDemonstratively action, never as a side effect of assessment', () => {
    const assessment = assessDemonstrativeRelease(context('READY'));
    expect(assessment.status).toBe('READY_FOR_RELEASE');
    const released = releaseDemonstratively(assessment, '2026-07-09T17:23:00-03:00');
    expect(released.status).toBe('RELEASED');
  });

  it('4. releasedAt is exactly the deterministic timestamp passed in — never Date.now()', () => {
    const assessment = assessDemonstrativeRelease(context('READY'));
    const released = releaseDemonstratively(assessment, '2026-07-09T17:23:00-03:00');
    expect(released.releasedAt).toBe('2026-07-09T17:23:00-03:00');
  });

  it('5. releasedBy falls back to the governed demonstrative supervisor persona when none is provided', () => {
    const assessment = assessDemonstrativeRelease(context('READY'));
    const released = releaseDemonstratively(assessment, '2026-07-09T17:23:00-03:00');
    expect(released.releasedBy).toBe('Supervisor da Fundição · demonstrativo');
  });

  it('6. a BLOCKED Lot cannot be released — releaseDemonstratively is a no-op on a non-READY_FOR_RELEASE record', () => {
    const blocked = assessDemonstrativeRelease(context('BLOCKED'));
    expect(blocked.status).toBe('BLOCKED_FOR_RELEASE');
    const attempt = releaseDemonstratively(blocked, '2026-07-09T17:23:00-03:00');
    expect(attempt.status).toBe('BLOCKED_FOR_RELEASE');
    expect(attempt.releasedAt).toBeUndefined();
  });

  it('7. an ATTENTION Lot is explicitly RELEASE_ATTENTION — never silently folded into Ready or Blocked', () => {
    const attention = assessDemonstrativeRelease(context('ATTENTION'));
    expect(attention.status).toBe('RELEASE_ATTENTION');
    expect(attention.status).not.toBe('READY_FOR_RELEASE');
    expect(attention.status).not.toBe('BLOCKED_FOR_RELEASE');
    // Also not releasable directly — the operator must review conditions first (Section 7).
    expect(releaseDemonstratively(attention, '2026-07-09T17:23:00-03:00').status).toBe('RELEASE_ATTENTION');
  });

  it('8. Release never changes the Resource carried on the record', () => {
    const assessment = assessDemonstrativeRelease(context('READY'));
    const released = releaseDemonstratively(assessment, '2026-07-09T17:23:00-03:00');
    expect(released.resourceId).toBe('DC01');
    expect(released.resourceId).toBe(assessment.resourceId);
  });

  it('9/10/11/12. ProductionReleaseRecord never carries Scheduled/Actual time, Produced Quantity or OEE fields — Release cannot fabricate Execution facts by construction', () => {
    const assessment = assessDemonstrativeRelease(context('READY'));
    const released = releaseDemonstratively(assessment, '2026-07-09T17:23:00-03:00');
    const keys = Object.keys(released);
    for (const forbidden of ['scheduledStart', 'scheduledFinish', 'actualStart', 'actualFinish', 'producedQuantity', 'areaOee']) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it('automatic release (governed rule only) also never fabricates a start time and stays deterministic', () => {
    const assessment = assessDemonstrativeRelease(context('READY'));
    const released = releaseAutomatically(assessment, '2026-07-09T17:23:00-03:00');
    expect(released.status).toBe('RELEASED');
    expect(released.releaseType).toBe('AUTOMATIC');
    expect(released.releasedAt).toBe('2026-07-09T17:23:00-03:00');
  });

  it('revocation is blocked once execution has started, even if the record is still RELEASED', () => {
    const assessment = assessDemonstrativeRelease(context('READY'));
    const released = releaseDemonstratively(assessment, '2026-07-09T17:23:00-03:00');
    const attemptWhileRunning = revokeRelease(released, '2026-07-09T18:00:00-03:00', 'Supervisor da Fundição · demonstrativo', 'PLAN_CHANGE', true);
    expect(attemptWhileRunning.status).toBe('RELEASED');
    const revoked = revokeRelease(released, '2026-07-09T18:00:00-03:00', 'Supervisor da Fundição · demonstrativo', 'PLAN_CHANGE', false);
    expect(revoked.status).toBe('RELEASE_REVOKED');
  });
});
