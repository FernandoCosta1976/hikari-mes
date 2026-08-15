import { assessDemonstrativeRelease, releaseDemonstratively } from './models';

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
