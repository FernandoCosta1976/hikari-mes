import { create } from 'zustand';
import type { DemandDestination, ProductionSchedulingDefinition } from '../../domain/production-scheduling/models';
import { adoptOrganization as buildOrganization, type LotOrganization } from '../../domain/production-scheduling/organization';
import type { ResourceSimulationImpact } from '../../domain/production-scheduling/resourceSimulation';
import type { ScenarioDefinition } from '../../domain/scenario/ScenarioDefinition';
import { assessDemonstrativeRelease, releaseDemonstratively, type ProductionReleaseRecord } from '../../domain/production-release/models';
import { completeExecution, pauseExecution, resumeExecution, startExecution, updateProducedQuantity, type DemonstrativePauseReason, type ProductionExecutionRecord } from '../../domain/production-execution/models';
import { fundicaoDcProductionExecutionFixture } from '../fixtures/fundicaoDcProductionExecution';

export type Wf001ScenarioId =
  | 'SCN-WF001-01' | 'SCN-WF001-02' | 'SCN-WF001-03' | 'SCN-WF001-04'
  | 'SCN-WF001-05' | 'SCN-WF001-06' | 'SCN-WF001-07' | 'SCN-WF001-08';
export type ScheduleView = '24H' | 'SHIFT_3' | 'SHIFT_1' | 'SHIFT_2';

interface ScenarioState {
  definition: ScenarioDefinition | null;
  productionScheduling: ProductionSchedulingDefinition | null;
  initialized: boolean;
  selectedDateOffset: 0 | 1 | 2 | 3;
  selectedDestination: DemandDestination | 'ALL';
  selectedScheduleView: ScheduleView;
  activeScheduleVersionId: string;
  comparisonScheduleVersionId: string | null;
  activeWf001ScenarioId: Wf001ScenarioId;
  resetRevision: number;
  journeyContext: { origin: 'LOT_CONTEXT' | 'EXCEPTION_SUMMARY'; selectedLotId: string | null; timelineScrollLeft: number; pageScrollY: number; sidebarExpanded: boolean } | null;
  productionReleases: Readonly<Record<string, ProductionReleaseRecord>>;
  productionExecutions: Readonly<Record<string, ProductionExecutionRecord>>;
  organizationsByLotId: Readonly<Record<string, LotOrganization>>;
}

interface ScenarioActions {
  initializeScenario: (definition: ScenarioDefinition) => void;
  selectDateOffset: (offset: ScenarioState['selectedDateOffset']) => void;
  filterByDestination: (destination: ScenarioState['selectedDestination']) => void;
  selectScheduleView: (view: ScheduleView) => void;
  compareWithPreviousVersion: () => void;
  closeVersionComparison: () => void;
  activateWf001Scenario: (scenarioId: Wf001ScenarioId) => void;
  resetScenario: () => void;
  preserveJourneyContext: (context: NonNullable<ScenarioState['journeyContext']>) => void;
  releaseLot: (lotId: string) => void;
  startLotExecution: (lotId: string) => void;
  pauseLotExecution: (lotId: string, reason: DemonstrativePauseReason) => void;
  resumeLotExecution: (lotId: string) => void;
  updateLotProducedQuantity: (lotId: string, quantity: number) => void;
  completeLotExecution: (lotId: string) => void;
  adoptOrganization: (impact: ResourceSimulationImpact, organizedBy: string) => void;
}

export type ScenarioStore = ScenarioState & ScenarioActions;

const baseline = (definition: ScenarioDefinition | null, revision: number): ScenarioState => ({
  definition,
  productionScheduling: definition?.productionScheduling ?? null,
  initialized: definition !== null,
  selectedDateOffset: 0,
  selectedDestination: 'ALL',
  selectedScheduleView: '24H',
  activeScheduleVersionId: 'v08',
  comparisonScheduleVersionId: null,
  activeWf001ScenarioId: 'SCN-WF001-01',
  resetRevision: revision,
  journeyContext: null,
  productionReleases: Object.fromEntries(fundicaoDcProductionExecutionFixture.map((execution) => [execution.lotId, { lotId: execution.lotId, productionOrderId: execution.productionOrderId, resourceId: execution.resourceId, scheduleVersionId: execution.scheduleVersionId, readiness: 'READY', status: 'RELEASED', reason: 'Liberação demonstrativa anterior ao estado inicial da execução.', releasedAt: execution.actualStart ?? '2025-05-15T17:00:00-03:00', releasedBy: 'Supervisor da Fundição · demonstrativo', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' }])),
  productionExecutions: Object.fromEntries(fundicaoDcProductionExecutionFixture.map((record) => [record.lotId, record])),
  organizationsByLotId: {},
});

export const useScenarioStore = create<ScenarioStore>()((set, get) => ({
  ...baseline(null, 0),
  initializeScenario: (definition) => set((state) => state.definition?.id === definition.id ? state : baseline(definition, state.resetRevision)),
  selectDateOffset: (selectedDateOffset) => set({ selectedDateOffset }),
  filterByDestination: (selectedDestination) => set({ selectedDestination }),
  selectScheduleView: (selectedScheduleView) => set({ selectedScheduleView }),
  compareWithPreviousVersion: () => set({ comparisonScheduleVersionId: 'v07', activeWf001ScenarioId: 'SCN-WF001-07' }),
  closeVersionComparison: () => set({ comparisonScheduleVersionId: null }),
  activateWf001Scenario: (activeWf001ScenarioId) => set({
    activeWf001ScenarioId,
    comparisonScheduleVersionId: activeWf001ScenarioId === 'SCN-WF001-07' ? 'v07' : null,
  }),
  resetScenario: () => set(baseline(get().definition, get().resetRevision + 1)),
  preserveJourneyContext: (journeyContext) => set({ journeyContext }),
  releaseLot: (lotId) => set((state) => {
    const lot = state.productionScheduling?.lots.find((item) => item.id === lotId);
    const readiness = state.definition?.productionReadiness.find((item) => item.lotId === lotId);
    if (!lot || !readiness) return state;
    const resourceId = state.organizationsByLotId[lotId]?.operationalResourceId ?? lot.scheduledResourceId;
    const current = state.productionReleases[lotId] ?? assessDemonstrativeRelease({ lotId, productionOrderId: lot.productionOrderId, resourceId, scheduleVersionId: state.activeScheduleVersionId, scheduledStart: lot.scheduledStart, scheduledFinish: lot.scheduledFinish, readiness: readiness.status });
    const released = releaseDemonstratively(current, state.definition?.currentScenarioTime ?? new Date().toISOString());
    return { productionReleases: { ...state.productionReleases, [lotId]: released } };
  }),
  startLotExecution: (lotId) => set((state) => {
    const lot = state.productionScheduling?.lots.find((item) => item.id === lotId); if (!lot) return state;
    const resourceId = state.organizationsByLotId[lotId]?.operationalResourceId ?? lot.scheduledResourceId;
    const current = state.productionExecutions[lotId] ?? { lotId, productionOrderId: lot.productionOrderId, resourceId, scheduleVersionId: state.activeScheduleVersionId, plannedQuantity: lot.quantity, producedQuantity: 0, scheduledStart: lot.scheduledStart, status: 'NOT_STARTED', pauses: [], demonstrative: true } as ProductionExecutionRecord;
    const next = startExecution(current, state.productionReleases[lotId]?.status === 'RELEASED', state.definition?.currentScenarioTime ?? new Date().toISOString());
    return { productionExecutions: { ...state.productionExecutions, [lotId]: next } };
  }),
  adoptOrganization: (impact, organizedBy) => set((state) => ({ organizationsByLotId: { ...state.organizationsByLotId, [impact.lotId]: buildOrganization(impact, state.definition?.currentScenarioTime ?? new Date().toISOString(), organizedBy) } })),
  pauseLotExecution: (lotId, reason) => set((state) => ({ productionExecutions: { ...state.productionExecutions, [lotId]: pauseExecution(state.productionExecutions[lotId], state.definition?.currentScenarioTime ?? new Date().toISOString(), reason) } })),
  resumeLotExecution: (lotId) => set((state) => ({ productionExecutions: { ...state.productionExecutions, [lotId]: resumeExecution(state.productionExecutions[lotId], state.definition?.currentScenarioTime ?? new Date().toISOString()) } })),
  updateLotProducedQuantity: (lotId, quantity) => set((state) => ({ productionExecutions: { ...state.productionExecutions, [lotId]: updateProducedQuantity(state.productionExecutions[lotId], quantity) } })),
  completeLotExecution: (lotId) => set((state) => ({ productionExecutions: { ...state.productionExecutions, [lotId]: completeExecution(state.productionExecutions[lotId], state.definition?.currentScenarioTime ?? new Date().toISOString()) } })),
}));

export const selectScenarioDefinition = (state: ScenarioStore) => state.definition;
export const selectScenarioInitialized = (state: ScenarioStore) => state.initialized;
export const selectProductionScheduling = (state: ScenarioStore) => state.productionScheduling;
const emptyCurrentResourceStates: ScenarioDefinition['currentResourceStates'] = [];
export const selectCurrentResourceStates = (state: ScenarioStore) => state.definition?.currentResourceStates ?? emptyCurrentResourceStates;
const emptyMaterialResourceEligibilities: ScenarioDefinition['materialResourceEligibilities'] = [];
export const selectMaterialResourceEligibilities = (state: ScenarioStore) => state.definition?.materialResourceEligibilities ?? emptyMaterialResourceEligibilities;
const emptyProductionReadiness: ScenarioDefinition['productionReadiness'] = [];
export const selectProductionReadiness = (state: ScenarioStore) => state.definition?.productionReadiness ?? emptyProductionReadiness;
export const selectProductionExecutions = (state: ScenarioStore) => state.productionExecutions;
export const selectOrganizationsByLotId = (state: ScenarioStore) => state.organizationsByLotId;
export const selectScheduleControls = (state: ScenarioStore) => ({
  selectedDateOffset: state.selectedDateOffset,
  selectedDestination: state.selectedDestination,
  selectedScheduleView: state.selectedScheduleView,
  activeScheduleVersionId: state.activeScheduleVersionId,
  comparisonScheduleVersionId: state.comparisonScheduleVersionId,
  activeWf001ScenarioId: state.activeWf001ScenarioId,
  resetRevision: state.resetRevision,
});
