import { classifyDownstreamStatus, type DownstreamAreaHealth } from '../../domain/downstream/models';

const currentCoverageHours = 1.8;
const targetCoverageHours = 2.5;
const projectedCoverageHours = 2.2;

/** DC03 · Lot 266 (Material B) is the same STOPPED fact already tracked since CAP-06/07 — the Fundição's next Material B delivery to Usinagem depends on it resuming. */
export const fundicaoDcUsinagemHealthFixture: DownstreamAreaHealth = {
  area: 'Usinagem',
  status: classifyDownstreamStatus(projectedCoverageHours, targetCoverageHours),
  currentCoverageHours,
  targetCoverageHours,
  projectedCoverageHours,
  criticalMaterial: 'Material B',
  nextExpectedLotId: 'lot-266',
  demonstrative: true,
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED',
};
