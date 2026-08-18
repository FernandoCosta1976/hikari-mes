import { describe, expect, it } from 'vitest';
import { fundicaoDcSourceDerivedProductionExecutionFixture } from './fundicaoDcSourceDerivedProductionExecution';

const BASELINE_CLOCK = Date.parse('2026-07-10T09:15:00-03:00');

describe('Capability 05 — canonical dataset temporal-consistency invariants (Section 36)', () => {
  it('no historical COMPLETED record finishes after the 09:15 baseline snapshot', () => {
    for (const record of fundicaoDcSourceDerivedProductionExecutionFixture) {
      if (record.status !== 'COMPLETED') continue;
      expect(Date.parse(record.actualFinish!)).toBeLessThanOrEqual(BASELINE_CLOCK);
    }
  });

  it('actualFinish is never before actualStart', () => {
    for (const record of fundicaoDcSourceDerivedProductionExecutionFixture) {
      if (!record.actualFinish) continue;
      expect(Date.parse(record.actualFinish)).toBeGreaterThanOrEqual(Date.parse(record.actualStart!));
    }
  });

  it('every pause resumes at or after it paused, and stays within the record\'s own actualStart/actualFinish window', () => {
    for (const record of fundicaoDcSourceDerivedProductionExecutionFixture) {
      for (const pause of record.pauses) {
        expect(Date.parse(pause.pausedAt)).toBeGreaterThanOrEqual(Date.parse(record.actualStart!));
        if (pause.resumedAt) expect(Date.parse(pause.resumedAt)).toBeGreaterThanOrEqual(Date.parse(pause.pausedAt));
        if (pause.resumedAt && record.actualFinish) expect(Date.parse(record.actualFinish)).toBeGreaterThanOrEqual(Date.parse(pause.resumedAt));
      }
    }
  });
});
