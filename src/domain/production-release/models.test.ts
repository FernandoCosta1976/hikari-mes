import { assessDemonstrativeRelease, releaseAutomatically, releaseDemonstratively, revokeRelease } from './models';

test('keeps Ready distinct from Released and does not start execution', () => {
  const ready = assessDemonstrativeRelease({ lotId: 'lot-251', productionOrderId: 'po-1', resourceId: 'DC01', scheduleVersionId: 'v08', scheduledStart: '2025-05-15T00:30:00-03:00', scheduledFinish: '2025-05-15T02:00:00-03:00', readiness: 'READY' });
  expect(ready.status).toBe('READY_FOR_RELEASE');
  expect(ready).not.toHaveProperty('startedAt');
  const released = releaseDemonstratively(ready, '2025-05-15T00:10:00-03:00');
  expect(released.status).toBe('RELEASED');
  expect(released.releasedAt).toBeDefined();
  expect(released.releasedBy).toContain('Supervisor');
  expect(released.resourceId).toBe('DC01');
  expect(released.scheduleVersionId).toBe('v08');
  expect(released).not.toHaveProperty('startedAt');
});

test('does not release a blocked Lot', () => {
  const blocked = assessDemonstrativeRelease({ lotId: 'lot-267', productionOrderId: 'po-5', resourceId: 'DC03', scheduleVersionId: 'v08', scheduledStart: '2025-05-15T19:00:00-03:00', scheduledFinish: '2025-05-15T20:00:00-03:00', readiness: 'BLOCKED' });
  expect(blocked.status).toBe('BLOCKED_FOR_RELEASE');
  expect(releaseDemonstratively(blocked, '2025-05-15T00:10:00-03:00')).toBe(blocked);
});

test('tags a manual release distinctly from an automatic one', () => {
  const ready = assessDemonstrativeRelease({ lotId: 'lot-258', productionOrderId: 'po-2', resourceId: 'DC02', scheduleVersionId: 'v08', scheduledStart: '2025-05-15T07:45:00-03:00', scheduledFinish: '2025-05-15T09:15:00-03:00', readiness: 'READY' });
  const manual = releaseDemonstratively(ready, '2025-05-15T07:00:00-03:00');
  expect(manual.releaseType).toBe('MANUAL');
  const auto = releaseAutomatically(ready, '2025-05-15T07:00:00-03:00');
  expect(auto.status).toBe('RELEASED');
  expect(auto.releaseType).toBe('AUTOMATIC');
  expect(auto.releasedBy).toContain('Regra automática HIKARI');
});

test('revokes a Released Lot that has not started, and never a started one', () => {
  const ready = assessDemonstrativeRelease({ lotId: 'lot-270', productionOrderId: 'po-3', resourceId: 'DC01', scheduleVersionId: 'v08', scheduledStart: '2025-05-15T18:00:00-03:00', scheduledFinish: '2025-05-15T20:30:00-03:00', readiness: 'READY' });
  const released = releaseDemonstratively(ready, '2025-05-15T17:00:00-03:00');
  const revoked = revokeRelease(released, '2025-05-15T17:23:00-03:00', 'Supervisor da Fundição · demonstrativo', 'PLAN_CHANGE', false);
  expect(revoked.status).toBe('RELEASE_REVOKED');
  expect(revoked.revocationReason).toBe('PLAN_CHANGE');
  const revokeAttemptAfterStart = revokeRelease(released, '2025-05-15T17:23:00-03:00', 'Supervisor da Fundição · demonstrativo', 'PLAN_CHANGE', true);
  expect(revokeAttemptAfterStart).toBe(released);
});
