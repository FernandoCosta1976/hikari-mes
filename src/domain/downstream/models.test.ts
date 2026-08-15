import { describe, expect, it } from 'vitest';
import { fundicaoDcUsinagemHealthFixture } from '../../demo/fixtures/fundicaoDcDownstreamHealth';
import { classifyDownstreamStatus } from './models';

describe('classifyDownstreamStatus', () => {
  it('is PROTECTED when projected coverage meets or exceeds the target', () => {
    expect(classifyDownstreamStatus(2.5, 2.5)).toBe('PROTECTED');
    expect(classifyDownstreamStatus(3, 2.5)).toBe('PROTECTED');
  });
  it('is ATTENTION when projected coverage is below target but at or above 70%', () => {
    expect(classifyDownstreamStatus(2.2, 2.5)).toBe('ATTENTION');
  });
  it('is RISK when projected coverage falls below 70% of target', () => {
    expect(classifyDownstreamStatus(1, 2.5)).toBe('RISK');
  });
});

describe('fundicaoDcUsinagemHealthFixture', () => {
  it('reports Usinagem in ATTENTION, tying the critical Material back to the existing DC03/Lot 266 fact', () => {
    expect(fundicaoDcUsinagemHealthFixture.status).toBe('ATTENTION');
    expect(fundicaoDcUsinagemHealthFixture.nextExpectedLotId).toBe('lot-266');
    expect(fundicaoDcUsinagemHealthFixture.currentCoverageHours).toBeLessThan(fundicaoDcUsinagemHealthFixture.targetCoverageHours);
  });
});
