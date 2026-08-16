import { describe, expect, it } from 'vitest';
import { fundicaoDcIdealCycleTimeSecondsFixture } from '../../demo/fixtures/fundicaoDcIdealCycleTime';
import { fundicaoDcProductionExecutionFixture } from '../../demo/fixtures/fundicaoDcProductionExecution';
import { fundicaoDcScenario } from '../../demo/scenarios/fundicaoDcScenario';
import { assessPerformance } from '../oee/calculations';
import { knownRunTimeMinutes } from '../production-quality/models';
import { assessLotExecutionHealth, byLotHealthAttention, productionDurationSeconds, type LotHealthStatus } from './lotHealth';

const lots = fundicaoDcScenario.productionScheduling.lots;
const currentTime = fundicaoDcScenario.currentScenarioTime;
const executionByLot = Object.fromEntries(fundicaoDcProductionExecutionFixture.map((execution) => [execution.lotId, execution]));
const lot = (id: string) => lots.find((item) => item.id === id)!;
const health = (lotId: string) => { const l = lot(lotId); return assessLotExecutionHealth(executionByLot[lotId], l.scheduledStart, l.scheduledFinish, fundicaoDcIdealCycleTimeSecondsFixture[l.materialId], currentTime); };

describe('productionDurationSeconds', () => {
  it('is quantity times the Engineering Cycle Time, so different Materials produce different durations for the same quantity', () => {
    expect(productionDurationSeconds(100, fundicaoDcIdealCycleTimeSecondsFixture['material-a'])).toBe(7200);
    expect(productionDurationSeconds(100, fundicaoDcIdealCycleTimeSecondsFixture['material-c'])).toBe(11000);
  });
});

describe('assessLotExecutionHealth — demonstrative scenario coverage', () => {
  it('DC05/Lot 271: Scheduled Start already passed with no Actual Start → LATE_NOT_STARTED', () => {
    expect(health('lot-271').status).toBe<LotHealthStatus>('LATE_NOT_STARTED');
  });

  it('DC03/Lot 266: Actual Start +18 min is recorded as a Started Late fact, coexisting with a Behind Plan current health', () => {
    const result = health('lot-266');
    expect(result.startedLate).toBe(true);
    expect(result.startDeviationMinutes).toBe(18);
    expect(result.status).toBe<LotHealthStatus>('BEHIND_PLAN');
  });

  it('DC01/Lot 265: produced below the Cycle-Time-derived expectation, but the projection crosses Scheduled Finish before falling behind → AT_RISK', () => {
    const result = health('lot-265');
    expect(result.status).toBe<LotHealthStatus>('AT_RISK');
    expect(result.projectedFinish).not.toBeNull();
    expect(Date.parse(result.projectedFinish!)).toBeGreaterThan(Date.parse(lot('lot-265').scheduledFinish));
  });

  it('DC04/Lot 268: within tolerance of the expected quantity → ON_TRACK', () => {
    expect(health('lot-268').status).toBe<LotHealthStatus>('ON_TRACK');
  });

  it('DC02/Lot 264: finished execution → COMPLETED', () => {
    expect(health('lot-264').status).toBe<LotHealthStatus>('COMPLETED');
  });
});

describe('OEE / Lot Health Cycle Time invariance', () => {
  it('uses the exact same Engineering Cycle Time fixture that OEE Performance uses, for every tracked Lot (no second Cycle Time source)', () => {
    for (const lotId of ['lot-265', 'lot-264', 'lot-266', 'lot-268']) {
      const l = lot(lotId);
      const execution = executionByLot[lotId];
      const idealCycleTimeSeconds = fundicaoDcIdealCycleTimeSecondsFixture[l.materialId];
      const runTimeMinutes = knownRunTimeMinutes(execution, currentTime);
      const oeePerformance = assessPerformance(idealCycleTimeSeconds, execution.producedQuantity, runTimeMinutes);
      const lotHealthCycleTime = health(lotId).cycleTimeSecondsPerPiece;
      expect(lotHealthCycleTime).toBe(idealCycleTimeSeconds);
      if (oeePerformance !== null) expect(oeePerformance).toBeCloseTo((execution.producedQuantity * idealCycleTimeSeconds) / 60 / runTimeMinutes!, 6);
    }
  });
});

describe('byLotHealthAttention', () => {
  it('ranks LATE_NOT_STARTED and BEHIND_PLAN above AT_RISK and ON_TRACK', () => {
    const order: LotHealthStatus[] = ['ON_TRACK', 'AT_RISK', 'BEHIND_PLAN', 'LATE_NOT_STARTED'];
    expect(order.sort(byLotHealthAttention)).toEqual(['LATE_NOT_STARTED', 'BEHIND_PLAN', 'AT_RISK', 'ON_TRACK']);
  });
});
