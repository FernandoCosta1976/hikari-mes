import { classifyDownstreamStatus, type DownstreamAreaHealth } from '../../domain/downstream/models';

const currentCoverageHours = 1.8;
const targetCoverageHours = 2.5;
const projectedCoverageHours = 2.2;

/** DC03 · lot-sd-514 (1S4-E5411-W0) is the same NOT_STARTED requirement already tracked since CAP-06/07 — Usinagem's next delivery depends on it starting. */
export const fundicaoDcSourceDerivedUsinagemHealthFixture: DownstreamAreaHealth = {
  area: 'Usinagem',
  status: classifyDownstreamStatus(projectedCoverageHours, targetCoverageHours),
  currentCoverageHours,
  targetCoverageHours,
  projectedCoverageHours,
  criticalMaterial: '1S4-E5411-W0',
  nextExpectedLotId: 'lot-sd-514',
  demonstrative: true,
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED',
};
