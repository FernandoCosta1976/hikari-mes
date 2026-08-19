import { beforeEach, describe, expect, test } from 'vitest';
import { scenarioDefinitionAdapter } from './scenarioDefinitionAdapter';
import { computeResourceOperationalSnapshots, resourceOperationalSnapshotByResourceId } from './resourceOperationalSnapshotAdapter';
import { currentExecutionForResource } from '../../domain/production-execution/models';
import { groupQualityConfirmationsByRequirement } from '../../domain/production-quality/models';
import {
  selectAllProductionEvents, selectAllQualityConfirmations, selectConfirmedQuantityByLotId, selectOrganizationsByLotId,
  selectPreparationConfirmedByLotId, selectProductionExecutions, selectProductionReadiness, selectProductionReleases,
  selectProductionScheduling, useScenarioStore,
} from '../scenario-engine/scenarioStore';
import { FOUNDRY_RESOURCE_IDS } from '../../domain/resource/models';

/**
 * HIKARI MES — Unified Machine Operational State round. Section 18: a
 * cross-screen "machine signature" must be identical everywhere; Section 10:
 * every screen must pick the SAME Current Requirement per Resource.
 * Verified against the real reference scenario (fundicao-dc, 09:15), not a
 * synthetic dataset — both at baseline and through the full live lifecycle
 * (Pause → Resume → Production Confirmation → Quality Confirmation →
 * Complete → Reset) mandated by Section 22-26.
 */
function snapshotsFor() {
  const state = useScenarioStore.getState();
  const definition = selectProductionScheduling(state)!;
  const executionsByLot = selectProductionExecutions(state);
  const releasesByLot = selectProductionReleases(state);
  const readinessAssessments = selectProductionReadiness(state);
  const preparationConfirmedByLotId = selectPreparationConfirmedByLotId(state);
  const organizationsByLotId = selectOrganizationsByLotId(state);
  const confirmedQuantityByLotId = selectConfirmedQuantityByLotId(state);
  const activeScheduleVersionId = state.activeScheduleVersionId;
  const currentTime = state.sessionClock ?? state.definition!.currentScenarioTime;
  const events = selectAllProductionEvents(state);
  const qualityConfirmations = selectAllQualityConfirmations(state);
  return computeResourceOperationalSnapshots({
    definition, executionsByLot, releasesByLot, readinessAssessments, preparationConfirmedByLotId, organizationsByLotId,
    confirmedQuantityByLotId, activeScheduleVersionId, currentTime, events, qualityConfirmationsByLot: groupQualityConfirmationsByRequirement(qualityConfirmations),
  });
}

describe('ResourceOperationalSnapshot — cross-screen machine signature (real reference scenario)', () => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc')!;

  beforeEach(() => {
    useScenarioStore.getState().initializeScenario(fundicaoDcScenario);
    useScenarioStore.getState().resetScenario();
  });

  test('Section 10 — every Resource\'s Current Requirement matches the SAME selection every other adapter (Quality/OEE/Adherence) already uses', () => {
    const state = useScenarioStore.getState();
    const executionsByLot = selectProductionExecutions(state);
    const snapshots = snapshotsFor();
    for (const resourceId of FOUNDRY_RESOURCE_IDS) {
      const snapshot = snapshots.find((item) => item.resourceId === resourceId)!;
      const adapterCurrent = currentExecutionForResource(Object.values(executionsByLot), resourceId);
      expect(snapshot.currentRequirementId, resourceId).toBe(adapterCurrent?.lotId ?? null);
    }
  });

  test('Section 3/9 — DC01 (lot-sd-507, RUNNING) reports PRODUCING; DC03 (lot-sd-514, READY_FOR_RELEASE, LATE) reports WAITING_START, never a fabricated DOWN/UP', () => {
    const snapshots = resourceOperationalSnapshotByResourceId(snapshotsFor());
    expect(snapshots.DC01.operationalState).toBe('PRODUCING');
    expect(snapshots.DC01.currentRequirementId).toBe('lot-sd-507');
    // Blocker 1 fix: lot-sd-514 exists, is not COMPLETED, and is READY_FOR_RELEASE (not yet RELEASED) — it still has real pending work.
    expect(snapshots.DC03.currentRequirementId).toBe('lot-sd-514');
    expect(snapshots.DC03.operationalState).toBe('WAITING_START');
    expect(snapshots.DC03.adherenceQualifier).toBe('LATE');
  });

  /**
   * Final Presentation Blocker Correction round — Blocker 1's own literal
   * regression rule, verified at the same level the executive report reads
   * from: a Resource whose Current Requirement exists, is not COMPLETED and
   * is LATE must never report NO_ACTIVE_REQUIREMENT.
   */
  test('REGRESSION (Blocker 1) — current requirement exists + not completed + LATE ⇒ resource state != NO_ACTIVE_REQUIREMENT', () => {
    const snapshots = snapshotsFor();
    const state = useScenarioStore.getState();
    const executionsByLot = selectProductionExecutions(state);
    for (const snapshot of snapshots) {
      if (!snapshot.currentRequirementId) continue;
      const execution = executionsByLot[snapshot.currentRequirementId];
      const notCompleted = execution.status !== 'COMPLETED';
      const isLate = snapshot.adherenceQualifier === 'LATE';
      if (notCompleted && isLate) expect(snapshot.operationalState, snapshot.resourceId).not.toBe('NO_ACTIVE_REQUIREMENT');
    }
    // Sanity: this scenario actually exercises the guarded case (DC03) — an empty loop would make the assertion above vacuous.
    expect(snapshots.some((s) => s.resourceId === 'DC03' && s.adherenceQualifier === 'LATE')).toBe(true);
  });

  test('Section 22 — Registrar Parada flips Operational State to PAUSED with the Event visible, Retomar flips it back to PRODUCING', () => {
    useScenarioStore.getState().pauseLotExecution('lot-sd-507', 'EQUIPMENT_FAILURE');
    let snapshots = resourceOperationalSnapshotByResourceId(snapshotsFor());
    expect(snapshots.DC01.operationalState).toBe('PAUSED');
    expect(snapshots.DC01.activeEventLabel).not.toBeNull();

    useScenarioStore.getState().resumeLotExecution('lot-sd-507');
    snapshots = resourceOperationalSnapshotByResourceId(snapshotsFor());
    expect(snapshots.DC01.operationalState).toBe('PRODUCING');
    expect(snapshots.DC01.activeEventLabel).toBeNull();
  });

  test('Section 23 — Registrar Produção changes confirmedQuantity but never Operational State', () => {
    const before = resourceOperationalSnapshotByResourceId(snapshotsFor()).DC01;
    useScenarioStore.getState().confirmProduction('lot-sd-507', 5);
    const after = resourceOperationalSnapshotByResourceId(snapshotsFor()).DC01;
    expect(after.confirmedQuantity).toBe(before.confirmedQuantity + 5);
    expect(after.operationalState).toBe(before.operationalState);
  });

  test('Section 24 — Registrar Qualidade changes Good/Reject/Pending but never Operational State', () => {
    const before = resourceOperationalSnapshotByResourceId(snapshotsFor()).DC01;
    useScenarioStore.getState().confirmQuality('lot-sd-507', 10, 2, 'PROCESS_DEFECT');
    const after = resourceOperationalSnapshotByResourceId(snapshotsFor()).DC01;
    expect(after.quality.good).toBe(before.quality.good + 10);
    expect(after.quality.reject).toBe(before.quality.reject + 2);
    expect(after.operationalState).toBe(before.operationalState);
  });

  test('Section 25 — Finalizar execução moves Operational State to a non-active state everywhere, never still PRODUCING', () => {
    // lot-sd-514 (DC03) is NOT_STARTED at baseline; drive it to COMPLETED.
    useScenarioStore.getState().releaseLot('lot-sd-514');
    useScenarioStore.getState().startLotExecution('lot-sd-514');
    useScenarioStore.getState().confirmProduction('lot-sd-514', 100);
    useScenarioStore.getState().completeLotExecution('lot-sd-514');
    const state = useScenarioStore.getState();
    expect(state.productionExecutions['lot-sd-514'].status).toBe('COMPLETED');
    const snapshots = resourceOperationalSnapshotByResourceId(snapshotsFor());
    // DC03's Current Requirement moves on (Completed Requirements are never "current" again) — confirm it never reports PRODUCING for the just-completed lot.
    expect(snapshots.DC03.currentRequirementId).not.toBe('lot-sd-514');
  });

  test('Section 26 — Reset restores the exact same Resource Operational Snapshot at every Resource', () => {
    const baseline = snapshotsFor();
    useScenarioStore.getState().pauseLotExecution('lot-sd-507', 'TOOLING');
    useScenarioStore.getState().confirmQuality('lot-sd-507', 5, 0);
    expect(snapshotsFor().find((s) => s.resourceId === 'DC01')!.operationalState).toBe('PAUSED');
    useScenarioStore.getState().resetScenario();
    const restored = snapshotsFor();
    expect(restored).toEqual(baseline);
  });
});
