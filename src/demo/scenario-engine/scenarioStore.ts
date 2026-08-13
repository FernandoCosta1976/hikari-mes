import { create } from 'zustand';
import type { ScenarioDefinition } from '../../domain/scenario/ScenarioDefinition';

interface ScenarioState {
  definition: ScenarioDefinition | null;
  initialized: boolean;
}

interface ScenarioActions {
  initializeScenario: (definition: ScenarioDefinition) => void;
  resetScenario: () => void;
}

type ScenarioStore = ScenarioState & ScenarioActions;

const initialState: ScenarioState = { definition: null, initialized: false };

export const useScenarioStore = create<ScenarioStore>()((set) => ({
  ...initialState,
  initializeScenario: (definition) => set({ definition, initialized: true }),
  resetScenario: () => set(initialState),
}));

export const selectScenarioDefinition = (state: ScenarioStore) => state.definition;
export const selectScenarioInitialized = (state: ScenarioStore) => state.initialized;
