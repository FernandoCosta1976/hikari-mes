import { create } from 'zustand';
import type { DemandDestination, ProductionSchedulingDefinition } from '../../domain/production-scheduling/models';
import { adoptOrganization as buildOrganization, type LotOrganization } from '../../domain/production-scheduling/organization';
import type { ResourceReassignment } from '../../domain/production-scheduling/organization';
import type { ScenarioDefinition } from '../../domain/scenario/ScenarioDefinition';
import { assessDemonstrativeRelease, releaseDemonstratively, revokeRelease, type ProductionReleaseRecord, type RevocationReason } from '../../domain/production-release/models';
import { completeExecution, pauseExecution, resumeExecution, startExecution, updateProducedQuantity, type DemonstrativePauseReason, type ProductionExecutionRecord } from '../../domain/production-execution/models';
import { resolveDemonstrativeRelease } from '../adapters/releaseResolution';
import { fundicaoDcProductionExecutionFixture } from '../fixtures/fundicaoDcProductionExecution';
import { fundicaoDcSourceDerivedProductionExecutionFixture } from '../fixtures/fundicaoDcSourceDerivedProductionExecution';

/**
 * Persists only decision FACTS made during the demonstration (Preparação,
 * Liberação/Revogação, Organização/Reprogramação, Execução, Espera) — never
 * derived results (OEE, Aderência %, Quality Rate, Lot Health, Expected
 * Quantity, Projected Finish). Those are recalculated from the facts on
 * every render by the existing adapters/selectors, exactly as before.
 */
/** Each scenario persists under its own key so decisions never leak from one scenario into another. */
export function scenarioStorageKey(scenarioId: string): string {
  return `hikari:demo:${scenarioId}:v1`;
}
export const SCENARIO_STORAGE_KEY = scenarioStorageKey('fundicao-dc');
const SCENARIO_SCHEMA_VERSION = 1;

interface PersistedScenarioDecisions {
  schemaVersion: number;
  productionReleases: Record<string, ProductionReleaseRecord>;
  productionExecutions: Record<string, ProductionExecutionRecord>;
  organizationsByLotId: Record<string, LotOrganization>;
  preparationConfirmedByLotId: Record<string, boolean>;
  postponedLotIds: Record<string, { targetLabel: string; postponedAt: string }>;
  scenarioModified: boolean;
}

function isPersistedScenarioDecisions(value: unknown): value is PersistedScenarioDecisions {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return record.schemaVersion === SCENARIO_SCHEMA_VERSION
    && typeof record.productionReleases === 'object' && record.productionReleases !== null
    && typeof record.productionExecutions === 'object' && record.productionExecutions !== null
    && typeof record.organizationsByLotId === 'object' && record.organizationsByLotId !== null
    && typeof record.preparationConfirmedByLotId === 'object' && record.preparationConfirmedByLotId !== null
    && typeof record.postponedLotIds === 'object' && record.postponedLotIds !== null;
}

function readPersistedScenarioDecisions(scenarioId: string): PersistedScenarioDecisions | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(scenarioStorageKey(scenarioId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isPersistedScenarioDecisions(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function clearPersistedScenarioDecisions(scenarioId: string | undefined): void {
  if (typeof window === 'undefined' || !scenarioId) return;
  try {
    window.localStorage.removeItem(scenarioStorageKey(scenarioId));
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

function writePersistedScenarioDecisions(state: ScenarioState): void {
  if (typeof window === 'undefined' || !state.definition) return;
  const payload: PersistedScenarioDecisions = {
    schemaVersion: SCENARIO_SCHEMA_VERSION,
    productionReleases: state.productionReleases,
    productionExecutions: state.productionExecutions,
    organizationsByLotId: state.organizationsByLotId,
    preparationConfirmedByLotId: state.preparationConfirmedByLotId,
    postponedLotIds: state.postponedLotIds,
    scenarioModified: state.scenarioModified,
  };
  try {
    window.localStorage.setItem(scenarioStorageKey(state.definition.id), JSON.stringify(payload));
  } catch {
    // Storage unavailable (private browsing, quota) — the demo continues in-memory only.
  }
}

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
  preparationConfirmedByLotId: Readonly<Record<string, boolean>>;
  postponedLotIds: Readonly<Record<string, { targetLabel: string; postponedAt: string }>>;
  scenarioModified: boolean;
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
  revokeLotRelease: (lotId: string, reason: RevocationReason) => void;
  confirmPreparation: (lotId: string) => void;
  postponeLot: (lotId: string, targetLabel: string) => void;
  startLotExecution: (lotId: string) => void;
  pauseLotExecution: (lotId: string, reason: DemonstrativePauseReason) => void;
  resumeLotExecution: (lotId: string) => void;
  updateLotProducedQuantity: (lotId: string, quantity: number) => void;
  completeLotExecution: (lotId: string) => void;
  adoptOrganization: (impact: ResourceReassignment, organizedBy: string) => void;
}

export type ScenarioStore = ScenarioState & ScenarioActions;

/** Apontamento inicial de execução por cenário — cada cenário traz seu próprio "estado atual" por máquina. */
const executionSeedFor = (definition: ScenarioDefinition | null) => definition?.id === 'fundicao-dc' ? fundicaoDcSourceDerivedProductionExecutionFixture : definition?.id === 'fundicao-dc-legacy' ? fundicaoDcProductionExecutionFixture : [];

const baseline = (definition: ScenarioDefinition | null, revision: number): ScenarioState => {
  const executionSeed = executionSeedFor(definition);
  // Cada cenário persiste sob a sua própria chave (scenarioStorageKey) — nunca herda
  // decisões salvas de outro cenário.
  const persisted = definition ? readPersistedScenarioDecisions(definition.id) : null;
  return {
    definition,
    productionScheduling: definition?.productionScheduling ?? null,
    initialized: definition !== null,
    selectedDateOffset: 0,
    selectedDestination: 'ALL',
    selectedScheduleView: '24H',
    activeScheduleVersionId: definition?.productionScheduling.scheduleVersions[0]?.id ?? 'v08',
    comparisonScheduleVersionId: null,
    activeWf001ScenarioId: 'SCN-WF001-01',
    resetRevision: revision,
    journeyContext: null,
    productionReleases: persisted?.productionReleases ?? Object.fromEntries(executionSeed.map((execution) => [execution.lotId, { lotId: execution.lotId, productionOrderId: execution.productionOrderId, resourceId: execution.resourceId, scheduleVersionId: execution.scheduleVersionId, readiness: 'READY', status: 'RELEASED', reason: 'Liberação demonstrativa anterior ao estado inicial da execução.', releasedAt: execution.actualStart ?? '2025-05-15T17:00:00-03:00', releasedBy: 'Supervisor da Fundição · demonstrativo', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' }])),
    productionExecutions: persisted?.productionExecutions ?? Object.fromEntries(executionSeed.map((record) => [record.lotId, record])),
    organizationsByLotId: persisted?.organizationsByLotId ?? {},
    preparationConfirmedByLotId: persisted?.preparationConfirmedByLotId ?? {},
    postponedLotIds: persisted?.postponedLotIds ?? {},
    scenarioModified: persisted?.scenarioModified ?? false,
  };
};

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
  resetScenario: () => { clearPersistedScenarioDecisions(get().definition?.id); set(baseline(get().definition, get().resetRevision + 1)); },
  preserveJourneyContext: (journeyContext) => set({ journeyContext }),
  releaseLot: (lotId) => set((state) => {
    const lot = state.productionScheduling?.lots.find((item) => item.id === lotId);
    const readiness = state.definition?.productionReadiness.find((item) => item.lotId === lotId);
    if (!lot || !readiness) return state;
    const resourceId = state.organizationsByLotId[lotId]?.operationalResourceId ?? lot.scheduledResourceId;
    const effectiveReadinessStatus = state.preparationConfirmedByLotId[lotId] ? 'READY' : readiness.status;
    const current = state.productionReleases[lotId] ?? assessDemonstrativeRelease({ lotId, productionOrderId: lot.productionOrderId, resourceId, scheduleVersionId: state.activeScheduleVersionId, scheduledStart: lot.scheduledStart, scheduledFinish: lot.scheduledFinish, readiness: effectiveReadinessStatus });
    const released = releaseDemonstratively(current, state.definition?.currentScenarioTime ?? new Date().toISOString());
    return { productionReleases: { ...state.productionReleases, [lotId]: released }, scenarioModified: true };
  }),
  startLotExecution: (lotId) => set((state) => {
    const lot = state.productionScheduling?.lots.find((item) => item.id === lotId); if (!lot) return state;
    const resourceId = state.organizationsByLotId[lotId]?.operationalResourceId ?? lot.scheduledResourceId;
    const current = state.productionExecutions[lotId] ?? { lotId, productionOrderId: lot.productionOrderId, resourceId, scheduleVersionId: state.activeScheduleVersionId, plannedQuantity: lot.quantity, producedQuantity: 0, scheduledStart: lot.scheduledStart, status: 'NOT_STARTED', pauses: [], demonstrative: true } as ProductionExecutionRecord;
    const next = startExecution(current, state.productionReleases[lotId]?.status === 'RELEASED', state.definition?.currentScenarioTime ?? new Date().toISOString());
    return { productionExecutions: { ...state.productionExecutions, [lotId]: next }, scenarioModified: true };
  }),
  adoptOrganization: (impact, organizedBy) => set((state) => ({ organizationsByLotId: { ...state.organizationsByLotId, [impact.lotId]: buildOrganization(impact, state.definition?.currentScenarioTime ?? new Date().toISOString(), organizedBy) }, scenarioModified: true })),
  revokeLotRelease: (lotId, reason) => set((state) => {
    const lot = state.productionScheduling?.lots.find((item) => item.id === lotId);
    const readiness = state.definition?.productionReadiness.find((item) => item.lotId === lotId);
    if (!lot || !readiness) return state;
    const currentTime = state.definition?.currentScenarioTime ?? new Date().toISOString();
    const resourceId = state.organizationsByLotId[lotId]?.operationalResourceId ?? lot.scheduledResourceId;
    const effectiveReadinessStatus = state.preparationConfirmedByLotId[lotId] ? 'READY' : readiness.status;
    const current = state.productionReleases[lotId] ?? resolveDemonstrativeRelease({ lotId, productionOrderId: lot.productionOrderId, resourceId, scheduleVersionId: state.activeScheduleVersionId, scheduledStart: lot.scheduledStart, scheduledFinish: lot.scheduledFinish, readiness: effectiveReadinessStatus }, lot.materialId, currentTime);
    const started = (state.productionExecutions[lotId]?.status ?? 'NOT_STARTED') !== 'NOT_STARTED';
    const revoked = revokeRelease(current, currentTime, 'Supervisor da Fundição · demonstrativo', reason, started);
    return { productionReleases: { ...state.productionReleases, [lotId]: revoked }, scenarioModified: true };
  }),
  confirmPreparation: (lotId) => set((state) => ({ preparationConfirmedByLotId: { ...state.preparationConfirmedByLotId, [lotId]: true }, scenarioModified: true })),
  postponeLot: (lotId, targetLabel) => set((state) => ({ postponedLotIds: { ...state.postponedLotIds, [lotId]: { targetLabel, postponedAt: state.definition?.currentScenarioTime ?? new Date().toISOString() } }, scenarioModified: true })),
  pauseLotExecution: (lotId, reason) => set((state) => ({ productionExecutions: { ...state.productionExecutions, [lotId]: pauseExecution(state.productionExecutions[lotId], state.definition?.currentScenarioTime ?? new Date().toISOString(), reason) }, scenarioModified: true })),
  resumeLotExecution: (lotId) => set((state) => ({ productionExecutions: { ...state.productionExecutions, [lotId]: resumeExecution(state.productionExecutions[lotId], state.definition?.currentScenarioTime ?? new Date().toISOString()) }, scenarioModified: true })),
  updateLotProducedQuantity: (lotId, quantity) => set((state) => ({ productionExecutions: { ...state.productionExecutions, [lotId]: updateProducedQuantity(state.productionExecutions[lotId], quantity) }, scenarioModified: true })),
  completeLotExecution: (lotId) => set((state) => ({ productionExecutions: { ...state.productionExecutions, [lotId]: completeExecution(state.productionExecutions[lotId], state.definition?.currentScenarioTime ?? new Date().toISOString()) }, scenarioModified: true })),
}));

useScenarioStore.subscribe((state) => { if (state.initialized) writePersistedScenarioDecisions(state); });

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
export const selectProductionReleases = (state: ScenarioStore) => state.productionReleases;
export const selectPreparationConfirmedByLotId = (state: ScenarioStore) => state.preparationConfirmedByLotId;
export const selectPostponedLotIds = (state: ScenarioStore) => state.postponedLotIds;
export const selectScenarioModified = (state: ScenarioStore) => state.scenarioModified;
export const selectScheduleControls = (state: ScenarioStore) => ({
  selectedDateOffset: state.selectedDateOffset,
  selectedDestination: state.selectedDestination,
  selectedScheduleView: state.selectedScheduleView,
  activeScheduleVersionId: state.activeScheduleVersionId,
  comparisonScheduleVersionId: state.comparisonScheduleVersionId,
  activeWf001ScenarioId: state.activeWf001ScenarioId,
  resetRevision: state.resetRevision,
});
