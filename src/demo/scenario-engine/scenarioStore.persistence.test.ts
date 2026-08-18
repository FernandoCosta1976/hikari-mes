import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { scenarioDefinitionAdapter } from '../adapters/scenarioDefinitionAdapter';
import { SCENARIO_STORAGE_KEY, selectScenarioModified, useScenarioStore } from './scenarioStore';

// Only the official/canonical scenario ('fundicao-dc') persists decisions to
// localStorage — the legacy fixture scenario never rehydrates from storage.
const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc')!;

/** Simulates a fresh browser boot: in-memory state is gone, localStorage is not. */
function reboot() {
  useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false });
  useScenarioStore.getState().initializeScenario(fundicaoDcScenario);
}

beforeEach(() => {
  window.localStorage.clear();
  reboot();
  useScenarioStore.getState().resetScenario();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('scenario persistence — serialize / hydrate', () => {
  it('writes decisions to localStorage under the versioned key after a mutating action', () => {
    useScenarioStore.getState().confirmPreparation('lot-sd-502');
    const raw = window.localStorage.getItem(SCENARIO_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.preparationConfirmedByLotId['lot-sd-502']).toBe(true);
  });

  it('rehydrates preparation, release, organization, postponement and execution facts after a simulated reload', () => {
    useScenarioStore.getState().confirmPreparation('lot-sd-502');
    useScenarioStore.getState().releaseLot('lot-sd-501');
    useScenarioStore.getState().adoptOrganization({ lotId: 'lot-sd-502', originalResourceId: 'DC01', simulatedResourceId: 'DC03' }, 'Planejador da Fundição · demonstrativo');
    useScenarioStore.getState().postponeLot('lot-sd-503', 'Turno 3');
    useScenarioStore.getState().releaseLot('lot-sd-508');
    useScenarioStore.getState().startLotExecution('lot-sd-508');

    reboot();

    const state = useScenarioStore.getState();
    expect(state.preparationConfirmedByLotId['lot-sd-502']).toBe(true);
    expect(state.productionReleases['lot-sd-501']?.status).toBe('RELEASED');
    expect(state.organizationsByLotId['lot-sd-502']?.operationalResourceId).toBe('DC03');
    expect(state.organizationsByLotId['lot-sd-502']?.programmedResourceId).toBe('DC01');
    expect(state.postponedLotIds['lot-sd-503']?.targetLabel).toBe('Turno 3');
    expect(state.productionExecutions['lot-sd-508']?.status).toBe('IN_PROGRESS');
    expect(selectScenarioModified(state)).toBe(true);
  });

  it('keeps Programmed and Operational Resource distinguishable across a reload (baseline is never lost)', () => {
    useScenarioStore.getState().adoptOrganization({ lotId: 'lot-sd-502', originalResourceId: 'DC01', simulatedResourceId: 'DC03' }, 'Planejador da Fundição · demonstrativo');
    reboot();
    const organization = useScenarioStore.getState().organizationsByLotId['lot-sd-502'];
    expect(organization?.programmedResourceId).toBe('DC01');
    expect(organization?.operationalResourceId).toBe('DC03');
  });
});

describe('scenario persistence — schema validation and fallback', () => {
  it('ignores a payload with a mismatched schemaVersion and falls back to the fixture baseline', () => {
    window.localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify({ schemaVersion: 999, productionReleases: {}, productionExecutions: {}, organizationsByLotId: {}, preparationConfirmedByLotId: { 'lot-sd-502': true }, postponedLotIds: {}, scenarioModified: true }));
    reboot();
    expect(useScenarioStore.getState().preparationConfirmedByLotId['lot-sd-502']).toBeUndefined();
    expect(selectScenarioModified(useScenarioStore.getState())).toBe(false);
  });

  it('ignores malformed JSON and falls back to the fixture baseline', () => {
    window.localStorage.setItem(SCENARIO_STORAGE_KEY, '{not json');
    reboot();
    expect(useScenarioStore.getState().productionExecutions['lot-sd-510']).toBeDefined();
    expect(selectScenarioModified(useScenarioStore.getState())).toBe(false);
  });

  it('ignores a structurally incomplete payload and falls back to the fixture baseline', () => {
    window.localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, productionReleases: {} }));
    reboot();
    expect(useScenarioStore.getState().productionExecutions['lot-sd-510']).toBeDefined();
  });
});

describe('scenario persistence — reset', () => {
  it('clears storage and restores the fixture baseline, keeping the deterministic clock and shift', () => {
    useScenarioStore.getState().confirmPreparation('lot-sd-502');
    expect(window.localStorage.getItem(SCENARIO_STORAGE_KEY)).not.toBeNull();

    useScenarioStore.getState().resetScenario();

    expect(useScenarioStore.getState().preparationConfirmedByLotId['lot-sd-502']).toBeUndefined();
    expect(selectScenarioModified(useScenarioStore.getState())).toBe(false);
    expect(useScenarioStore.getState().definition?.currentScenarioTime).toBe('2026-07-10T09:15:00-03:00');

    reboot();
    expect(useScenarioStore.getState().preparationConfirmedByLotId['lot-sd-502']).toBeUndefined();
  });
});

describe('scenario persistence — derived data never persisted', () => {
  it('does not write OEE, Adherence %, Quality Rate or Lot Health into storage', () => {
    useScenarioStore.getState().confirmPreparation('lot-sd-502');
    useScenarioStore.getState().releaseLot('lot-sd-501');
    const raw = window.localStorage.getItem(SCENARIO_STORAGE_KEY)!;
    for (const forbidden of ['areaOee', 'qualityRate', 'LotHealth', 'expectedQuantityNow', 'projectedFinish']) {
      expect(raw).not.toContain(forbidden);
    }
    const parsed = JSON.parse(raw);
    expect(Object.keys(parsed).sort()).toEqual(['organizationsByLotId', 'postponedLotIds', 'preparationConfirmedByLotId', 'productionExecutions', 'productionReleases', 'schemaVersion', 'scenarioModified'].sort());
  });
});
