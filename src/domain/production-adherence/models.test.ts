import { describe, expect, it } from 'vitest';
import { fundicaoDcProductionExecutionFixture } from '../../demo/fixtures/fundicaoDcProductionExecution';
import { fundicaoDcScenario } from '../../demo/scenarios/fundicaoDcScenario';
import { adherenceSummary, assessDeviation, assessSequenceImpact, byOperationalRelevance, nextLotOnResource, type DeviationClassification } from './models';

const lots = fundicaoDcScenario.productionScheduling.lots;
const currentTime = fundicaoDcScenario.currentScenarioTime;
const executionByLot = Object.fromEntries(fundicaoDcProductionExecutionFixture.map((execution) => [execution.lotId, execution]));
const lot = (id: string) => lots.find((item) => item.id === id)!;

describe('assessDeviation', () => {
  it('classifies DC01 (started 4 min after schedule) as ON_PLAN', () => {
    expect(assessDeviation(executionByLot['lot-265'], lot('lot-265'), currentTime).classification).toBe('ON_PLAN');
  });
  it('classifies DC02 (completed, started 3 min after schedule) as ON_PLAN', () => {
    expect(assessDeviation(executionByLot['lot-264'], lot('lot-264'), currentTime).classification).toBe('ON_PLAN');
  });
  it('classifies DC03 (paused/active event) as STOPPED', () => {
    expect(assessDeviation(executionByLot['lot-266'], lot('lot-266'), currentTime).classification).toBe('STOPPED');
  });
  it('classifies DC04 (started 140 min ahead of schedule) as EARLY with -140', () => {
    const result = assessDeviation(executionByLot['lot-268'], lot('lot-268'), currentTime);
    expect(result.classification).toBe('EARLY');
    expect(result.startDeviationMinutes).toBe(-140);
  });
  it('classifies DC05 (not yet due) as ON_PLAN', () => {
    expect(assessDeviation(executionByLot['lot-271'], lot('lot-271'), currentTime).classification).toBe('ON_PLAN');
  });
});

describe('adherenceSummary', () => {
  it('counts Lots on plan out of total analyzed', () => {
    expect(adherenceSummary(['ON_PLAN', 'ON_PLAN', 'STOPPED', 'EARLY', 'ON_PLAN'])).toEqual({ onPlan: 3, total: 5, ratio: 0.6 });
  });
});

describe('byOperationalRelevance', () => {
  it('ranks STOPPED before LATE, AT_RISK, EARLY and ON_PLAN', () => {
    const order: DeviationClassification[] = ['ON_PLAN', 'EARLY', 'AT_RISK', 'STOPPED', 'LATE'];
    expect(order.sort(byOperationalRelevance)).toEqual(['STOPPED', 'LATE', 'AT_RISK', 'EARLY', 'ON_PLAN']);
  });
});

describe('nextLotOnResource', () => {
  it('finds the next scheduled Lot on the same Resource', () => {
    expect(nextLotOnResource(lots, 'DC01', lot('lot-265').scheduledStart)?.id).toBe('lot-270');
  });
});

describe('assessSequenceImpact', () => {
  it('marks the next Lot on the blocked Resource as AT_RISK when the current Lot is STOPPED', () => {
    const impact = assessSequenceImpact(lots, lot('lot-266'), 'STOPPED');
    expect(impact?.classification).toBe('AT_RISK');
    expect(impact?.impactedLot.scheduledResourceId).toBe('DC03');
  });
  it('does not compute impact for ON_PLAN or EARLY Lots', () => {
    expect(assessSequenceImpact(lots, lot('lot-268'), 'EARLY')).toBeNull();
    expect(assessSequenceImpact(lots, lot('lot-265'), 'ON_PLAN')).toBeNull();
  });
});
