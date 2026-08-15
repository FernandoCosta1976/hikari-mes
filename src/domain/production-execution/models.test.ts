import { completeExecution, pauseExecution, resumeExecution, startExecution, updateProducedQuantity, type ProductionExecutionRecord } from './models';
const record: ProductionExecutionRecord = { lotId: 'lot-251', productionOrderId: 'po-a', resourceId: 'DC01', scheduleVersionId: 'v08', plannedQuantity: 100, producedQuantity: 0, scheduledStart: '2025-05-15T00:30:00-03:00', status: 'NOT_STARTED', pauses: [], demonstrative: true };
test('only starts released work and keeps quantities independent', () => {
  expect(startExecution(record, false, 'now')).toBe(record);
  const started = startExecution(record, true, 'now');
  expect(started).toMatchObject({ status: 'IN_PROGRESS', actualStart: 'now', producedQuantity: 0, plannedQuantity: 100 });
  expect(updateProducedQuantity(started, 72)).toMatchObject({ producedQuantity: 72, plannedQuantity: 100 });
});
test('pauses, resumes and completes explicitly', () => {
  const started = startExecution(record, true, 'start');
  const paused = pauseExecution(started, 'pause', 'TOOLING');
  expect(paused).toMatchObject({ status: 'PAUSED', pauses: [{ pausedAt: 'pause', reason: 'TOOLING' }] });
  const resumed = resumeExecution(paused, 'resume');
  expect(resumed.pauses[0].resumedAt).toBe('resume');
  const completed = completeExecution(updateProducedQuantity(resumed, 83), 'finish');
  expect(completed).toMatchObject({ status: 'COMPLETED', actualFinish: 'finish', producedQuantity: 83, plannedQuantity: 100 });
});
