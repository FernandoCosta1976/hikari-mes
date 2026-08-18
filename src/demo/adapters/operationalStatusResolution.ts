import { resolveDemonstrativeRelease } from './releaseResolution';
import type { LotOrganization } from '../../domain/production-scheduling/organization';
import type { Lot } from '../../domain/production-scheduling/models';
import type { ProductionExecutionRecord } from '../../domain/production-execution/models';
import type { ProductionReleaseRecord, ProductionReleaseStatus } from '../../domain/production-release/models';
import type { LotReadinessAssessment, ReadinessStatus } from '../../domain/production-readiness/models';
import { buildOperationalStatusMap, type ProductionOperationalStatus } from '../../domain/production-status/models';

/**
 * Capability 07 — the ONE place every screen resolves the Effective
 * Readiness/Release for a Lot with no persisted Release decision yet, and
 * builds the shared Operational Status from it. Mirrors exactly what the
 * Scenario Store's own releaseLot/revokeLotRelease actions and the Plano
 * Lot Context modal already compute (Confirmar Preparação forces READY;
 * resolveDemonstrativeRelease derives the live Release status from
 * Readiness) — reused here instead of re-derived per screen, so Section 38
 * cross-screen consistency is structural, not just conventional.
 */
export function buildOperationalStatusByLotId(params: {
  lots: readonly Lot[];
  executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>;
  releasesByLot: Readonly<Record<string, ProductionReleaseRecord>>;
  readinessAssessments: readonly LotReadinessAssessment[];
  preparationConfirmedByLotId: Readonly<Record<string, boolean>>;
  organizationsByLotId: Readonly<Record<string, LotOrganization>>;
  confirmedQuantityByLotId: Readonly<Record<string, number>>;
  projectedFinishByLotId?: Readonly<Record<string, string | undefined>>;
  activeScheduleVersionId: string;
  currentTime: string;
}): Readonly<Record<string, ProductionOperationalStatus>> {
  const { lots, executionsByLot, releasesByLot, readinessAssessments, preparationConfirmedByLotId, organizationsByLotId, confirmedQuantityByLotId, projectedFinishByLotId, activeScheduleVersionId, currentTime } = params;
  const readinessByLotId: Record<string, ReadinessStatus> = Object.fromEntries(readinessAssessments.map((item) => [item.lotId, item.status]));
  const effectiveReleaseStatusByLotId: Record<string, ProductionReleaseStatus> = {};
  for (const lot of lots) {
    const persisted = releasesByLot[lot.id];
    if (persisted) { effectiveReleaseStatusByLotId[lot.id] = persisted.status; continue; }
    const readiness = readinessByLotId[lot.id];
    if (!readiness) continue;
    const resourceId = organizationsByLotId[lot.id]?.operationalResourceId ?? lot.scheduledResourceId;
    const effectiveReadinessStatus: ReadinessStatus = preparationConfirmedByLotId[lot.id] ? 'READY' : readiness;
    const resolved = resolveDemonstrativeRelease({ lotId: lot.id, productionOrderId: lot.productionOrderId, resourceId, scheduleVersionId: activeScheduleVersionId, scheduledStart: lot.scheduledStart, scheduledFinish: lot.scheduledFinish, readiness: effectiveReadinessStatus }, lot.materialId, currentTime);
    effectiveReleaseStatusByLotId[lot.id] = resolved.status;
  }

  const sources = lots
    .map((lot) => {
      const execution = executionsByLot[lot.id];
      if (!execution) return null;
      return {
        lot,
        execution,
        releaseStatus: effectiveReleaseStatusByLotId[lot.id],
        readinessStatus: preparationConfirmedByLotId[lot.id] ? ('READY' as const) : readinessByLotId[lot.id],
        producedQuantity: confirmedQuantityByLotId[lot.id] ?? 0,
        projectedFinish: projectedFinishByLotId?.[lot.id],
      };
    })
    .filter((source): source is NonNullable<typeof source> => source !== null);

  return buildOperationalStatusMap(sources, currentTime);
}
