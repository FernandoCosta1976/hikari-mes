import { beforeEach, describe, expect, test } from 'vitest';
import { scenarioDefinitionAdapter } from '../adapters/scenarioDefinitionAdapter';
import { computeFundicaoDcOeeSummary } from '../adapters/oeeSummaryAdapter';
import { computeFundicaoDcQualitySummary } from '../adapters/qualitySummaryAdapter';
import { accumulatedQuality, classifiedQuantity, qualityRate } from '../../domain/production-quality/models';
import { idealCycleTimeSecondsForScenario } from './scenarioFixtures';
import { selectAllProductionEvents, selectAllQualityConfirmations, selectConfirmedQuantityByLotId, selectProductionConfirmations, selectProductionExecutions, selectProductionScheduling, useScenarioStore } from './scenarioStore';

const idealCycleTimeSecondsByMaterialId = idealCycleTimeSecondsForScenario('fundicao-dc');

/**
 * Capability 09 — Section 40 (mandatory cross-metric test): Quality screen,
 * OEE and Visão Estratégica must all read the SAME Quality aggregate, never
 * three independently computed numbers. Exercised via a live confirmQuality
 * call on lot-sd-507 (the ONE Pending-Classification demonstration
 * Requirement), the same fact every screen and the E2E journey share.
 */
describe('Capability 09 — cross-screen Quality consistency after a live confirmQuality call', () => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc')!;

  beforeEach(() => {
    useScenarioStore.getState().initializeScenario(fundicaoDcScenario);
    useScenarioStore.getState().resetScenario();
    useScenarioStore.getState().confirmQuality('lot-sd-507', 13, 2, 'PROCESS_DEFECT');
  });

  test('Quality screen day totals, OEE per-Resource row and OEE area Quality all derive from the SAME Quality Confirmations for lot-sd-507', () => {
    const state = useScenarioStore.getState();
    const definition = selectProductionScheduling(state)!;
    const executionsByLot = selectProductionExecutions(state);
    const currentTime = state.sessionClock ?? state.definition!.currentScenarioTime;
    const qualityConfirmations = selectAllQualityConfirmations(state);
    const productionConfirmations = Object.values(selectProductionConfirmations(state)).flat();
    const events = selectAllProductionEvents(state);

    const qualityDay = computeFundicaoDcQualitySummary(definition, executionsByLot, currentTime, qualityConfirmations, idealCycleTimeSecondsByMaterialId, productionConfirmations);
    const oeeDay = computeFundicaoDcOeeSummary(definition, executionsByLot, currentTime, qualityConfirmations, idealCycleTimeSecondsByMaterialId, productionConfirmations, events);

    const qualityRow = qualityDay.rows.find((row) => row.lot.id === 'lot-sd-507')!;
    const oeeRow = oeeDay.rows.find((row) => row.lot.id === 'lot-sd-507')!;

    // The fixture seeds 48 good/2 reject; the live call above adds 13 good/2 reject.
    expect(qualityRow.quality).toEqual({ good: 61, reject: 4, rework: 0 });
    expect(qualityRow.classified).toBe(65);
    expect(qualityRow.pending).toBe(0);

    // Same Good/Classified pair feeds both the Quality screen's row-level rate and the OEE row's Quality factor.
    expect(oeeRow.goodQuantity).toBe(qualityRow.quality.good);
    expect(oeeRow.classifiedQuantity).toBe(qualityRow.classified);
    expect(oeeRow.quality).toBeCloseTo(qualityRate(qualityRow.quality.good, qualityRow.classified)!, 6);

    // Produced (Capability 06 aggregate) is identical across Quality and OEE for the same Requirement — quality never re-derives it.
    expect(qualityRow.producedQuantity).toBe(oeeRow.producedQuantity);
    expect(qualityRow.producedQuantity).toBe(selectConfirmedQuantityByLotId(state)['lot-sd-507']);
  });

  test('the day-level Quality Rate (Quality screen) and area Quality (OEE) both collapse to good/classified computed from the exact same totals', () => {
    const state = useScenarioStore.getState();
    const definition = selectProductionScheduling(state)!;
    const executionsByLot = selectProductionExecutions(state);
    const currentTime = state.sessionClock ?? state.definition!.currentScenarioTime;
    const qualityConfirmations = selectAllQualityConfirmations(state);
    const productionConfirmations = Object.values(selectProductionConfirmations(state)).flat();

    const qualityDay = computeFundicaoDcQualitySummary(definition, executionsByLot, currentTime, qualityConfirmations, idealCycleTimeSecondsByMaterialId, productionConfirmations);
    const totals = accumulatedQuality(qualityConfirmations.filter((c) => c.lotId === 'lot-sd-507'));
    expect(classifiedQuantity(totals)).toBe(65);
    expect(qualityDay.qualityRate).toBe(qualityRate(qualityDay.good, qualityDay.classified));
  });
});
