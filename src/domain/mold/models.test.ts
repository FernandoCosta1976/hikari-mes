import { describe, expect, it } from 'vitest';
import { fundicaoDcMoldsFixture } from '../../demo/fixtures/fundicaoDcMolds';
import { classifyMoldLife, moldForResource, mostCriticalMold } from './models';

describe('classifyMoldLife', () => {
  it('classifies demonstrative thresholds: <75% normal, <90% attention, >=90% maintenance recommended', () => {
    expect(classifyMoldLife(0.62)).toBe('NORMAL');
    expect(classifyMoldLife(0.86)).toBe('ATTENTION');
    expect(classifyMoldLife(0.94)).toBe('MAINTENANCE_RECOMMENDED');
  });
});

describe('fundicaoDcMoldsFixture', () => {
  it('provides one Mold per DC01–DC05 with lifeUsedRatio within 0..1', () => {
    expect(fundicaoDcMoldsFixture).toHaveLength(5);
    for (const mold of fundicaoDcMoldsFixture) { expect(mold.lifeUsedRatio).toBeGreaterThanOrEqual(0); expect(mold.lifeUsedRatio).toBeLessThanOrEqual(1); }
  });

  it('finds DC04 Molde M-302 as the most critical (highest life used)', () => {
    const critical = mostCriticalMold(fundicaoDcMoldsFixture);
    expect(critical?.resourceId).toBe('DC04');
    expect(critical?.code).toBe('M-302');
    expect(classifyMoldLife(critical!.lifeUsedRatio)).toBe('MAINTENANCE_RECOMMENDED');
  });

  it('looks up a Mold by Resource', () => {
    expect(moldForResource(fundicaoDcMoldsFixture, 'DC03')?.code).toBe('M-118');
  });
});
