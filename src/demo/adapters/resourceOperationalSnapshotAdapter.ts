import { buildOperationalStatusByLotId } from './operationalStatusResolution';
import { accumulatedQuality, classifiedQuantity, pendingClassification, type ProductionQualityConfirmation, type QualityTotals } from '../../domain/production-quality/models';
import { eventTypeLabel, type ProductionEvent } from '../../domain/production-monitoring/models';
import type { ProductionExecutionRecord } from '../../domain/production-execution/models';
import type { LotOrganization } from '../../domain/production-scheduling/organization';
import type { ProductionSchedulingDefinition } from '../../domain/production-scheduling/models';
import type { ProductionReleaseRecord } from '../../domain/production-release/models';
import type { LotReadinessAssessment } from '../../domain/production-readiness/models';
import { deriveResourceStatusEntries, resourceOperationalStatusLabel, type AdherenceQualifier, type ResourceOperationalStatus } from '../../domain/production-status/models';
import { FOUNDRY_RESOURCE_IDS, type FoundryResourceId } from '../../domain/resource/models';

/**
 * HIKARI MES — the ONE Resource Operational Snapshot every executive screen
 * (Acompanhamento, Aderência, Qualidade & Desempenho, OEE, Visão
 * Estratégica) must read for "what is this machine doing right now" —
 * built directly from Capability 07's shared precedence engine
 * (`buildOperationalStatusByLotId` + `deriveResourceStatusEntries`), never
 * re-derived from OEE or Quality facts. OEE and Quality are DERIVED
 * indicators layered on top of this snapshot, never a source for it
 * (Section 7/8 of the round brief).
 */
export interface ResourceOperationalSnapshot {
  resourceId: FoundryResourceId;
  currentRequirementId: string | null;
  currentComponentCode: string | null;
  /** Section 2.A — Operational State: PRODUZINDO/EM PAUSA/AGUARDANDO INÍCIO/SEM NECESSIDADE ATIVA/ATENÇÃO. */
  operationalState: ResourceOperationalStatus;
  operationalStateLabel: string;
  /** Section 2.B — Plan/Adherence Qualifier, a SEPARATE dimension, never merged into operationalState. */
  adherenceQualifier: AdherenceQualifier | null;
  plannedQuantity: number | null;
  confirmedQuantity: number;
  /** Section 2.C — Event State. */
  activeEventLabel: string | null;
  activeEventId: string | null;
  /** Section 2.D — Quality Context, from the SAME Quality Confirmations every other screen reads. */
  quality: QualityTotals;
  classified: number;
  pending: number;
  nextRequirementId: string | null;
}

export function computeResourceOperationalSnapshots(params: {
  definition: ProductionSchedulingDefinition;
  executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>;
  releasesByLot: Readonly<Record<string, ProductionReleaseRecord>>;
  readinessAssessments: readonly LotReadinessAssessment[];
  preparationConfirmedByLotId: Readonly<Record<string, boolean>>;
  organizationsByLotId: Readonly<Record<string, LotOrganization>>;
  confirmedQuantityByLotId: Readonly<Record<string, number>>;
  activeScheduleVersionId: string;
  currentTime: string;
  events: readonly ProductionEvent[];
  qualityConfirmationsByLot: Readonly<Record<string, readonly ProductionQualityConfirmation[]>>;
}): readonly ResourceOperationalSnapshot[] {
  const { definition, executionsByLot, releasesByLot, readinessAssessments, preparationConfirmedByLotId, organizationsByLotId, confirmedQuantityByLotId, activeScheduleVersionId, currentTime, events, qualityConfirmationsByLot } = params;

  const statusByLotId = buildOperationalStatusByLotId({
    lots: definition.lots, executionsByLot, releasesByLot, readinessAssessments, preparationConfirmedByLotId, organizationsByLotId,
    confirmedQuantityByLotId, activeScheduleVersionId, currentTime,
  });
  const lotsOrderedByResource: Record<string, typeof definition.lots[number][]> = {};
  for (const resourceId of FOUNDRY_RESOURCE_IDS) lotsOrderedByResource[resourceId] = [...definition.lots].filter((lot) => lot.scheduledResourceId === resourceId).sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart));
  const resourceStatusEntries = deriveResourceStatusEntries(FOUNDRY_RESOURCE_IDS, lotsOrderedByResource, statusByLotId);

  return resourceStatusEntries.map((entry) => {
    const currentLotId = entry.current?.lotId ?? null;
    const currentLot = currentLotId ? definition.lots.find((lot) => lot.id === currentLotId) : undefined;
    const material = currentLot ? definition.materials.find((item) => item.id === currentLot.materialId) : undefined;
    const activeEvent = currentLotId ? events.find((event) => event.lotId === currentLotId && event.status === 'ACTIVE') : undefined;
    const confirmations = currentLotId ? (qualityConfirmationsByLot[currentLotId] ?? []) : [];
    const quality = accumulatedQuality(confirmations);
    const classified = classifiedQuantity(quality);
    const confirmedQuantity = currentLotId ? (confirmedQuantityByLotId[currentLotId] ?? 0) : 0;
    return {
      resourceId: entry.resourceId as FoundryResourceId,
      currentRequirementId: currentLotId,
      currentComponentCode: material?.code ?? null,
      operationalState: entry.resourceStatus,
      operationalStateLabel: resourceOperationalStatusLabel[entry.resourceStatus],
      adherenceQualifier: entry.current?.adherence ?? null,
      plannedQuantity: currentLot?.quantity ?? null,
      confirmedQuantity,
      activeEventLabel: activeEvent ? eventTypeLabel[activeEvent.eventType] : null,
      activeEventId: activeEvent?.eventId ?? null,
      quality,
      classified,
      pending: pendingClassification(confirmedQuantity, classified),
      nextRequirementId: entry.next?.lotId ?? null,
    };
  });
}

export function resourceOperationalSnapshotByResourceId(snapshots: readonly ResourceOperationalSnapshot[]): Readonly<Record<string, ResourceOperationalSnapshot>> {
  return Object.fromEntries(snapshots.map((snapshot) => [snapshot.resourceId, snapshot]));
}
