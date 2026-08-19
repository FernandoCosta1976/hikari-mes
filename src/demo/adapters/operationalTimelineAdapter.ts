import { buildOperationalTimeline, type OperationalTimelineEntry } from '../../domain/operational-timeline/models';
import { oeeClassificationFor, type ProductionEvent } from '../../domain/production-monitoring/models';
import type { ProductionExecutionRecord } from '../../domain/production-execution/models';
import type { ProductionSchedulingDefinition } from '../../domain/production-scheduling/models';
import { productionSchedulingDemoConfiguration } from '../configuration/productionSchedulingDemoConfiguration';

/**
 * HIKARI MES — the ONE Operational Timeline every screen representing
 * Resource × Time × Production Requirement must call (Plano, Preparação,
 * Acompanhamento, Aderência) — never a screen-local reconstruction. Known
 * Unplanned Downtime (Capability 08's governed Production Events) is
 * resolved here, once, so an Evento immediately participates in the same
 * Current Plan/Projected chain every consumer reads.
 */
export function computeOperationalTimeline(
  definition: ProductionSchedulingDefinition,
  executionsByLotId: Readonly<Record<string, ProductionExecutionRecord>>,
  currentTime: string,
  events: readonly ProductionEvent[] = [],
): readonly OperationalTimelineEntry[] {
  const downtimeMinutesByLotId: Record<string, number> = {};
  for (const event of events) {
    if (oeeClassificationFor(event.eventType) !== 'UNPLANNED_DOWNTIME') continue;
    // An Event that precedes the Requirement's own Actual Start already delayed the start
    // itself, which actualStart already reflects — counting it again here would double it.
    const actualStart = executionsByLotId[event.lotId]?.actualStart;
    if (actualStart && Date.parse(event.startedAt) < Date.parse(actualStart)) continue;
    const endedAt = event.endedAt ?? currentTime;
    const minutes = Math.round((Date.parse(endedAt) - Date.parse(event.startedAt)) / 60_000);
    downtimeMinutesByLotId[event.lotId] = (downtimeMinutesByLotId[event.lotId] ?? 0) + minutes;
  }
  return buildOperationalTimeline(definition.lots, executionsByLotId, currentTime, definition.shifts, downtimeMinutesByLotId, productionSchedulingDemoConfiguration.setupDurationMinutes);
}

export function operationalTimelineByRequirementId(entries: readonly OperationalTimelineEntry[]): Readonly<Record<string, OperationalTimelineEntry>> {
  return Object.fromEntries(entries.map((entry) => [entry.requirementId, entry]));
}
