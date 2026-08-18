import { create } from 'zustand';
import type { DemandDestination, ProductionSchedulingDefinition } from '../../domain/production-scheduling/models';
import { adoptOrganization as buildOrganization, type LotOrganization } from '../../domain/production-scheduling/organization';
import type { ResourceReassignment } from '../../domain/production-scheduling/organization';
import type { ScenarioDefinition } from '../../domain/scenario/ScenarioDefinition';
import { assessDemonstrativeRelease, releaseDemonstratively, revokeRelease, type ProductionReleaseRecord, type RevocationReason } from '../../domain/production-release/models';
import { canCompleteExecution, completeExecution, pauseExecution, resumeExecution, startExecution, type DemonstrativePauseReason, type ProductionExecutionRecord } from '../../domain/production-execution/models';
import { accumulatedProducedQuantity, buildProductionConfirmation, confirmedQuantityByLot, groupConfirmationsByRequirement, validateConfirmationIncrement, type ConfirmationRejection, type ProductionConfirmation } from '../../domain/production-confirmation/models';
import { closeEvent, groupEventsByLot, openEvent, pauseReasonToEventType, type ProductionEvent } from '../../domain/production-monitoring/models';
import { resolveDemonstrativeRelease } from '../adapters/releaseResolution';
import { demonstrativeOperatorForResource } from '../fixtures/demonstrativeOperators';
import { fundicaoDcProductionConfirmationsFixture } from '../fixtures/fundicaoDcProductionConfirmations';
import { fundicaoDcProductionExecutionFixture } from '../fixtures/fundicaoDcProductionExecution';
import { fundicaoDcSourceDerivedProductionConfirmationsFixture } from '../fixtures/fundicaoDcSourceDerivedProductionConfirmations';
import { fundicaoDcSourceDerivedProductionExecutionFixture } from '../fixtures/fundicaoDcSourceDerivedProductionExecution';
import { eventsForScenario } from './scenarioFixtures';
import { sourceDerivedTraceabilityByLotId } from '../scenarios/fundicaoDcSourceDerivedScenario';

/**
 * Session Operational Clock (Section 9) — every Capability 05 action reads
 * and advances THIS instead of the wall clock or the Scenario's own fixed
 * currentScenarioTime. Baseline is always the reference Scenario Clock
 * (2026-07-10T09:15 for fundicao-dc); Reset restores it exactly. Advancing
 * only happens deterministically, in fixed steps, from explicit user actions
 * — never from real elapsed time.
 */
const SESSION_CLOCK_STEP_MINUTES = 15;
function advanceClock(iso: string, minutes: number): string {
  return new Date(Date.parse(iso) + minutes * 60_000).toISOString();
}
/**
 * Defensive-only fallback (Section 31 audit — zero wall-clock dependence):
 * every action below already reads `state.definition?.currentScenarioTime`
 * first, which is always set once a Scenario has loaded — this constant is
 * unreachable in practice, but pins the type to a fixed demonstrative
 * instant instead of `new Date()` so no code path can ever read the real
 * wall clock, even before initialization.
 */
const UNINITIALIZED_SCENARIO_FALLBACK_TIME = '2026-07-10T09:15:00-03:00';

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
/** Bumped for Capability 08's productionEvents slice — any persisted decisions from before it must fall back to the fixture baseline instead of missing the new field. */
const SCENARIO_SCHEMA_VERSION = 3;

interface PersistedScenarioDecisions {
  schemaVersion: number;
  productionReleases: Record<string, ProductionReleaseRecord>;
  productionExecutions: Record<string, ProductionExecutionRecord>;
  productionConfirmations: Record<string, readonly ProductionConfirmation[]>;
  productionEvents: Record<string, readonly ProductionEvent[]>;
  organizationsByLotId: Record<string, LotOrganization>;
  preparationConfirmedByLotId: Record<string, boolean>;
  postponedLotIds: Record<string, { targetLabel: string; postponedAt: string }>;
  scenarioModified: boolean;
  sessionClock: string | null;
}

function isPersistedScenarioDecisions(value: unknown): value is PersistedScenarioDecisions {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return record.schemaVersion === SCENARIO_SCHEMA_VERSION
    && typeof record.productionReleases === 'object' && record.productionReleases !== null
    && typeof record.productionExecutions === 'object' && record.productionExecutions !== null
    && typeof record.productionConfirmations === 'object' && record.productionConfirmations !== null
    && typeof record.productionEvents === 'object' && record.productionEvents !== null
    && typeof record.organizationsByLotId === 'object' && record.organizationsByLotId !== null
    && typeof record.preparationConfirmedByLotId === 'object' && record.preparationConfirmedByLotId !== null
    && typeof record.postponedLotIds === 'object' && record.postponedLotIds !== null
    && (record.sessionClock === null || typeof record.sessionClock === 'string');
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
    productionConfirmations: state.productionConfirmations,
    productionEvents: state.productionEvents,
    organizationsByLotId: state.organizationsByLotId,
    preparationConfirmedByLotId: state.preparationConfirmedByLotId,
    postponedLotIds: state.postponedLotIds,
    scenarioModified: state.scenarioModified,
    sessionClock: state.sessionClock,
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
  /** Capability 06 — Production Confirmation, grouped by Requirement. Each Requirement's confirmed produced quantity is always SUM(this array), never a field on Execution. */
  productionConfirmations: Readonly<Record<string, readonly ProductionConfirmation[]>>;
  /** Capability 08 — Production Events, grouped by Requirement. The ONLY Event source — seeded facts and live Registrar-parada/Retomar events live in the SAME array, never a separate store (Section 24). */
  productionEvents: Readonly<Record<string, readonly ProductionEvent[]>>;
  organizationsByLotId: Readonly<Record<string, LotOrganization>>;
  preparationConfirmedByLotId: Readonly<Record<string, boolean>>;
  postponedLotIds: Readonly<Record<string, { targetLabel: string; postponedAt: string }>>;
  scenarioModified: boolean;
  /** Section 9 — Session Operational Clock, null before any Scenario has loaded. */
  sessionClock: string | null;
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
  pauseLotExecution: (lotId: string, reason: DemonstrativePauseReason, observation?: string) => void;
  resumeLotExecution: (lotId: string) => void;
  confirmProduction: (lotId: string, increment: number) => void;
  completeLotExecution: (lotId: string) => void;
  adoptOrganization: (impact: ResourceReassignment, organizedBy: string) => void;
}

export type ScenarioStore = ScenarioState & ScenarioActions;

/** Apontamento inicial de execução por cenário — cada cenário traz seu próprio "estado atual" por máquina. */
const executionSeedFor = (definition: ScenarioDefinition | null) => definition?.id === 'fundicao-dc' ? fundicaoDcSourceDerivedProductionExecutionFixture : definition?.id === 'fundicao-dc-legacy' ? fundicaoDcProductionExecutionFixture : [];
/** Seed Production Confirmations per cenário — Capability 06's migration of the historical producedQuantity facts (Section 19). */
const confirmationSeedFor = (definition: ScenarioDefinition | null) => definition?.id === 'fundicao-dc' ? fundicaoDcSourceDerivedProductionConfirmationsFixture : definition?.id === 'fundicao-dc-legacy' ? fundicaoDcProductionConfirmationsFixture : [];

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
    // Cada requirement do dataset de referência já tem seu próprio apontamento de execução (Section 14) — pré-liberar os
    // ainda NOT_STARTED apagaria a decisão de Liberação demonstrativa (Capability 04) que essas telas existem para
    // exercitar. O cenário legado mantém o comportamento anterior (todo apontamento pré-liberado).
    productionReleases: persisted?.productionReleases ?? Object.fromEntries((definition?.id === 'fundicao-dc' ? executionSeed.filter((execution) => execution.status !== 'NOT_STARTED') : executionSeed).map((execution) => [execution.lotId, { lotId: execution.lotId, productionOrderId: execution.productionOrderId, resourceId: execution.resourceId, scheduleVersionId: execution.scheduleVersionId, readiness: 'READY', status: 'RELEASED', reason: 'Liberação demonstrativa anterior ao estado inicial da execução.', releasedAt: execution.actualStart ?? definition?.currentScenarioTime ?? '2025-05-15T17:00:00-03:00', releasedBy: 'Supervisor da Fundição · demonstrativo', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' }])),
    productionExecutions: persisted?.productionExecutions ?? Object.fromEntries(executionSeed.map((record) => [record.lotId, record])),
    productionConfirmations: persisted?.productionConfirmations ?? groupConfirmationsByRequirement(confirmationSeedFor(definition)),
    productionEvents: persisted?.productionEvents ?? groupEventsByLot(eventsForScenario(definition?.id)),
    organizationsByLotId: persisted?.organizationsByLotId ?? {},
    preparationConfirmedByLotId: persisted?.preparationConfirmedByLotId ?? {},
    postponedLotIds: persisted?.postponedLotIds ?? {},
    scenarioModified: persisted?.scenarioModified ?? false,
    sessionClock: persisted?.sessionClock ?? definition?.currentScenarioTime ?? null,
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
    const released = releaseDemonstratively(current, state.definition?.currentScenarioTime ?? UNINITIALIZED_SCENARIO_FALLBACK_TIME);
    return { productionReleases: { ...state.productionReleases, [lotId]: released }, scenarioModified: true };
  }),
  startLotExecution: (lotId) => set((state) => {
    const lot = state.productionScheduling?.lots.find((item) => item.id === lotId); if (!lot) return state;
    const resourceId = state.organizationsByLotId[lotId]?.operationalResourceId ?? lot.scheduledResourceId;
    const current = state.productionExecutions[lotId] ?? { lotId, productionOrderId: lot.productionOrderId, resourceId, scheduleVersionId: state.activeScheduleVersionId, plannedQuantity: lot.quantity, producedQuantity: 0, scheduledStart: lot.scheduledStart, status: 'NOT_STARTED', pauses: [], transitions: [], demonstrative: true, dataOrigin: 'DEMONSTRATIVE_EXECUTION', ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' } as ProductionExecutionRecord;
    const at = state.sessionClock ?? state.definition?.currentScenarioTime ?? UNINITIALIZED_SCENARIO_FALLBACK_TIME;
    const operator = demonstrativeOperatorForResource(resourceId);
    const next = startExecution(current, state.productionReleases[lotId]?.status === 'RELEASED', at, operator.displayName, operator.operatorId, lot.scheduledResourceId);
    if (next === current) return state;
    return { productionExecutions: { ...state.productionExecutions, [lotId]: next }, scenarioModified: true };
  }),
  adoptOrganization: (impact, organizedBy) => set((state) => ({ organizationsByLotId: { ...state.organizationsByLotId, [impact.lotId]: buildOrganization(impact, state.definition?.currentScenarioTime ?? UNINITIALIZED_SCENARIO_FALLBACK_TIME, organizedBy) }, scenarioModified: true })),
  revokeLotRelease: (lotId, reason) => set((state) => {
    const lot = state.productionScheduling?.lots.find((item) => item.id === lotId);
    const readiness = state.definition?.productionReadiness.find((item) => item.lotId === lotId);
    if (!lot || !readiness) return state;
    const currentTime = state.definition?.currentScenarioTime ?? UNINITIALIZED_SCENARIO_FALLBACK_TIME;
    const resourceId = state.organizationsByLotId[lotId]?.operationalResourceId ?? lot.scheduledResourceId;
    const effectiveReadinessStatus = state.preparationConfirmedByLotId[lotId] ? 'READY' : readiness.status;
    const current = state.productionReleases[lotId] ?? resolveDemonstrativeRelease({ lotId, productionOrderId: lot.productionOrderId, resourceId, scheduleVersionId: state.activeScheduleVersionId, scheduledStart: lot.scheduledStart, scheduledFinish: lot.scheduledFinish, readiness: effectiveReadinessStatus }, lot.materialId, currentTime);
    const started = (state.productionExecutions[lotId]?.status ?? 'NOT_STARTED') !== 'NOT_STARTED';
    const revoked = revokeRelease(current, currentTime, 'Supervisor da Fundição · demonstrativo', reason, started);
    return { productionReleases: { ...state.productionReleases, [lotId]: revoked }, scenarioModified: true };
  }),
  confirmPreparation: (lotId) => set((state) => ({ preparationConfirmedByLotId: { ...state.preparationConfirmedByLotId, [lotId]: true }, scenarioModified: true })),
  postponeLot: (lotId, targetLabel) => set((state) => ({ postponedLotIds: { ...state.postponedLotIds, [lotId]: { targetLabel, postponedAt: state.definition?.currentScenarioTime ?? UNINITIALIZED_SCENARIO_FALLBACK_TIME } }, scenarioModified: true })),
  /**
   * Capability 08 — Registrar Parada (Section 5/6): Pause is now the SAME
   * action that both stops Execution and opens the governed Production
   * Event — a single Session Clock instant, a single Resource/Operator,
   * never two divergent facts for the same moment.
   */
  pauseLotExecution: (lotId, reason, observation) => set((state) => {
    const existing = state.productionExecutions[lotId]; if (!existing) return state;
    const at = advanceClock(state.sessionClock ?? state.definition?.currentScenarioTime ?? UNINITIALIZED_SCENARIO_FALLBACK_TIME, SESSION_CLOCK_STEP_MINUTES);
    const operator = demonstrativeOperatorForResource(existing.resourceId);
    const next = pauseExecution(existing, at, reason, operator.displayName);
    if (next === existing) return state;
    const event = openEvent({ eventId: `${lotId}-event-${(state.productionEvents[lotId] ?? []).length + 1}`, resourceId: existing.resourceId, lotId, executionId: lotId, eventType: pauseReasonToEventType(reason), startedAt: at, operator: operator.displayName, observation, dataOrigin: 'USER_SIMULATION' });
    return { productionExecutions: { ...state.productionExecutions, [lotId]: next }, productionEvents: { ...state.productionEvents, [lotId]: [...(state.productionEvents[lotId] ?? []), event] }, sessionClock: at, scenarioModified: true };
  }),
  /** Retomar Produção (Section 7): closes the SAME open Event this Requirement's Pause created — never asks for the reason again. */
  resumeLotExecution: (lotId) => set((state) => {
    const existing = state.productionExecutions[lotId]; if (!existing) return state;
    const at = advanceClock(state.sessionClock ?? state.definition?.currentScenarioTime ?? UNINITIALIZED_SCENARIO_FALLBACK_TIME, SESSION_CLOCK_STEP_MINUTES);
    const operator = demonstrativeOperatorForResource(existing.resourceId);
    const next = resumeExecution(existing, at, operator.displayName);
    if (next === existing) return state;
    const lotEvents = state.productionEvents[lotId] ?? [];
    const activeIndex = lotEvents.findIndex((event) => event.status === 'ACTIVE');
    const nextEvents = activeIndex === -1 ? lotEvents : lotEvents.map((event, index) => index === activeIndex ? closeEvent(event, at) : event);
    return { productionExecutions: { ...state.productionExecutions, [lotId]: next }, productionEvents: { ...state.productionEvents, [lotId]: nextEvents }, sessionClock: at, scenarioModified: true };
  }),
  /**
   * Capability 06 — Registrar Produção (Section 4/5/31): each confirmation
   * carries its OWN increment, appended (never overwriting the accumulated
   * total), and reuses the CURRENT Session Clock unchanged — confirming
   * production is not, by itself, an operational-time-advancing action.
   */
  confirmProduction: (lotId, increment) => set((state) => {
    const execution = state.productionExecutions[lotId];
    const lot = state.productionScheduling?.lots.find((item) => item.id === lotId);
    if (!execution || !lot) return state;
    const existing = state.productionConfirmations[lotId] ?? [];
    const accumulated = accumulatedProducedQuantity(existing);
    const rejection: ConfirmationRejection | null = validateConfirmationIncrement({ executionStatus: execution.status, increment, plannedQuantity: execution.plannedQuantity, accumulated });
    if (rejection) return state;
    const at = state.sessionClock ?? state.definition?.currentScenarioTime ?? UNINITIALIZED_SCENARIO_FALLBACK_TIME;
    const material = state.productionScheduling?.materials.find((item) => item.id === lot.materialId);
    const traceability = sourceDerivedTraceabilityByLotId[lotId];
    const confirmation = buildProductionConfirmation({
      id: `${lotId}-confirmation-${existing.length + 1}`,
      requirementId: lotId,
      resourceId: execution.resourceId,
      operatorId: execution.operatorId,
      componentId: material?.code ?? lot.materialId,
      sourceLineCLot: traceability ? String(traceability.sourceLot) : undefined,
      confirmedAt: at,
      increment,
      dataOrigin: 'USER_SIMULATION',
    });
    return { productionConfirmations: { ...state.productionConfirmations, [lotId]: [...existing, confirmation] }, scenarioModified: true };
  }),
  completeLotExecution: (lotId) => set((state) => {
    const existing = state.productionExecutions[lotId]; const lot = state.productionScheduling?.lots.find((item) => item.id === lotId);
    if (!existing || !lot) return state;
    const confirmedProducedQuantity = accumulatedProducedQuantity(state.productionConfirmations[lotId] ?? []);
    if (!canCompleteExecution(existing, confirmedProducedQuantity)) return state;
    const at = advanceClock(state.sessionClock ?? state.definition?.currentScenarioTime ?? UNINITIALIZED_SCENARIO_FALLBACK_TIME, SESSION_CLOCK_STEP_MINUTES);
    const operator = demonstrativeOperatorForResource(existing.resourceId);
    const next = completeExecution(existing, confirmedProducedQuantity, at, operator.displayName);
    if (next === existing) return state;
    return { productionExecutions: { ...state.productionExecutions, [lotId]: next }, sessionClock: at, scenarioModified: true };
  }),
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
export const selectProductionConfirmations = (state: ScenarioStore) => state.productionConfirmations;
/**
 * Total Count per Requirement, derived live from the Scenario Store — the
 * single reference source (Section 19/20). Memoized on the `productionConfirmations`
 * reference itself (which Zustand only ever replaces via `set`, never mutates
 * in place) — recomputing a fresh object on every read would give React a
 * "changed" reference on every render and loop forever.
 */
let cachedConfirmationsByLot: ScenarioState['productionConfirmations'] | null = null;
let cachedConfirmedQuantityByLotId: Readonly<Record<string, number>> = {};
export const selectConfirmedQuantityByLotId = (state: ScenarioStore) => {
  if (state.productionConfirmations !== cachedConfirmationsByLot) {
    cachedConfirmationsByLot = state.productionConfirmations;
    cachedConfirmedQuantityByLotId = confirmedQuantityByLot(state.productionConfirmations);
  }
  return cachedConfirmedQuantityByLotId;
};
export const selectProductionEvents = (state: ScenarioStore) => state.productionEvents;
/**
 * Flattened Event list — the SAME source Acompanhamento, Aderência, OEE and
 * Visão Estratégica all read (Section 24), memoized on the `productionEvents`
 * reference itself (Zustand only ever replaces it via `set`, never mutates
 * in place) so a fresh flattened array isn't produced on every render.
 */
let cachedEventsByLot: ScenarioState['productionEvents'] | null = null;
let cachedFlatEvents: readonly ProductionEvent[] = [];
export const selectAllProductionEvents = (state: ScenarioStore) => {
  if (state.productionEvents !== cachedEventsByLot) {
    cachedEventsByLot = state.productionEvents;
    cachedFlatEvents = Object.values(state.productionEvents).flat();
  }
  return cachedFlatEvents;
};
export const selectOrganizationsByLotId = (state: ScenarioStore) => state.organizationsByLotId;
export const selectProductionReleases = (state: ScenarioStore) => state.productionReleases;
export const selectPreparationConfirmedByLotId = (state: ScenarioStore) => state.preparationConfirmedByLotId;
export const selectPostponedLotIds = (state: ScenarioStore) => state.postponedLotIds;
export const selectScenarioModified = (state: ScenarioStore) => state.scenarioModified;
export const selectSessionClock = (state: ScenarioStore) => state.sessionClock;
export const selectScheduleControls = (state: ScenarioStore) => ({
  selectedDateOffset: state.selectedDateOffset,
  selectedDestination: state.selectedDestination,
  selectedScheduleView: state.selectedScheduleView,
  activeScheduleVersionId: state.activeScheduleVersionId,
  comparisonScheduleVersionId: state.comparisonScheduleVersionId,
  activeWf001ScenarioId: state.activeWf001ScenarioId,
  resetRevision: state.resetRevision,
});
