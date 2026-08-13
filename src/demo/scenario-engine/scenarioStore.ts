import { create } from 'zustand';
import type { DemandDestination, ProductionSchedulingDefinition } from '../../domain/production-scheduling/models';
import type { ScenarioDefinition } from '../../domain/scenario/ScenarioDefinition';

export type Wf001ScenarioId =
  | 'SCN-WF001-01' | 'SCN-WF001-02' | 'SCN-WF001-03' | 'SCN-WF001-04'
  | 'SCN-WF001-05' | 'SCN-WF001-06' | 'SCN-WF001-07' | 'SCN-WF001-08';

interface ScenarioState {
  definition: ScenarioDefinition | null;
  productionScheduling: ProductionSchedulingDefinition | null;
  initialized: boolean;
  selectedDateOffset: 0 | 1 | 2 | 3;
  selectedDestination: DemandDestination | 'ALL';
  activeScheduleVersionId: string;
  comparisonScheduleVersionId: string | null;
  activeWf001ScenarioId: Wf001ScenarioId;
  resetRevision: number;
}

interface ScenarioActions {
  initializeScenario: (definition: ScenarioDefinition) => void;
  selectDateOffset: (offset: ScenarioState['selectedDateOffset']) => void;
  filterByDestination: (destination: ScenarioState['selectedDestination']) => void;
  compareWithPreviousVersion: () => void;
  closeVersionComparison: () => void;
  activateWf001Scenario: (scenarioId: Wf001ScenarioId) => void;
  resetScenario: () => void;
}

export type ScenarioStore = ScenarioState & ScenarioActions;

const baseline = (definition: ScenarioDefinition | null, revision: number): ScenarioState => ({
  definition,
  productionScheduling: definition?.productionScheduling ?? null,
  initialized: definition !== null,
  selectedDateOffset: 0,
  selectedDestination: 'ALL',
  activeScheduleVersionId: 'v08',
  comparisonScheduleVersionId: null,
  activeWf001ScenarioId: 'SCN-WF001-01',
  resetRevision: revision,
});

export const useScenarioStore = create<ScenarioStore>()((set, get) => ({
  ...baseline(null, 0),
  initializeScenario: (definition) => set((state) => state.definition?.id === definition.id ? state : baseline(definition, state.resetRevision)),
  selectDateOffset: (selectedDateOffset) => set({ selectedDateOffset }),
  filterByDestination: (selectedDestination) => set({ selectedDestination }),
  compareWithPreviousVersion: () => set({ comparisonScheduleVersionId: 'v07', activeWf001ScenarioId: 'SCN-WF001-07' }),
  closeVersionComparison: () => set({ comparisonScheduleVersionId: null }),
  activateWf001Scenario: (activeWf001ScenarioId) => set({
    activeWf001ScenarioId,
    comparisonScheduleVersionId: activeWf001ScenarioId === 'SCN-WF001-07' ? 'v07' : null,
  }),
  resetScenario: () => set(baseline(get().definition, get().resetRevision + 1)),
}));

export const selectScenarioDefinition = (state: ScenarioStore) => state.definition;
export const selectScenarioInitialized = (state: ScenarioStore) => state.initialized;
export const selectProductionScheduling = (state: ScenarioStore) => state.productionScheduling;
export const selectScheduleControls = (state: ScenarioStore) => ({
  selectedDateOffset: state.selectedDateOffset,
  selectedDestination: state.selectedDestination,
  activeScheduleVersionId: state.activeScheduleVersionId,
  comparisonScheduleVersionId: state.comparisonScheduleVersionId,
  activeWf001ScenarioId: state.activeWf001ScenarioId,
  resetRevision: state.resetRevision,
});
