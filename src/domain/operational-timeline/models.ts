import type { ProductionExecutionRecord } from '../production-execution/models';
import type { Lot, Shift } from '../production-scheduling/models';
import { requiresSetup } from '../production-scheduling/setups';
import { breakWindow } from '../production-scheduling/shifts';

/**
 * HIKARI MES — Unified Operational Timeline (single-source Plano
 * Original/Plano Atualizado/Realizado/Projetado). Every screen representing
 * Resource × Time × Production Requirement (Plano, Preparação,
 * Acompanhamento, Aderência, Eventos, Qualidade) must read THIS projection —
 * never reconstruct its own. See docs/prototype/implementation/
 * OPERATIONAL-TIMELINE-UNIFICATION.md for the full rationale.
 */
export type TimelineRequirementStatus = 'COMPLETED' | 'RUNNING' | 'DELAYED' | 'NOT_STARTED' | 'SCHEDULED';

/**
 * The single demonstrative tolerance already governed across the prototype
 * (production-status/AT_RISK_TOLERANCE_MINUTES, production-adherence/
 * START_TOLERANCE_MINUTES, production-execution/lotHealth START_LATE_
 * TOLERANCE_MINUTES all use 10, not 5) — preserved here rather than
 * introducing a second, competing tolerance value.
 */
export const TIMELINE_TOLERANCE_MINUTES = 10;

export interface OperationalTimelineEntry {
  requirementId: string;
  resourceId: Lot['scheduledResourceId'];
  materialId: string;
  quantity: number;
  /** Plano Original — immutable, exactly as received (Section 4). */
  originalStart: string;
  originalFinish: string;
  /** Plano Atualizado — best operational plan given everything that already happened (Section 5). Equals actual/projected once known. */
  currentStart: string;
  currentFinish: string;
  actualStart?: string;
  actualFinish?: string;
  /** Projetado — only meaningful while RUNNING/DELAYED and not yet finished. */
  projectedFinish?: string;
  status: TimelineRequirementStatus;
  /** True when Plano Atualizado differs from Plano Original beyond tolerance — drives the "Atualizado pela execução" UI signal (Section 22). */
  replanned: boolean;
  /** Current/Actual/Projected Finish vs. Original Finish, in minutes — positive is late, negative is early. */
  varianceMinutes: number;
}

export function timelineRequirementStatus(execution: ProductionExecutionRecord, lot: Pick<Lot, 'scheduledStart' | 'scheduledFinish'>, currentTime: string): TimelineRequirementStatus {
  if (execution.status === 'COMPLETED') return 'COMPLETED';
  if (execution.status === 'IN_PROGRESS' || execution.status === 'PAUSED') {
    return Date.parse(currentTime) > Date.parse(lot.scheduledFinish) ? 'DELAYED' : 'RUNNING';
  }
  return Date.parse(currentTime) > Date.parse(lot.scheduledStart) ? 'NOT_STARTED' : 'SCHEDULED';
}

/** Pushes a candidate [start, start+duration) window past any Planned Shift Break it overlaps (Section 13) — never simply sums minutes across a break. */
function nudgePastBreaks(startMs: number, durationMs: number, shifts: readonly Shift[], businessDate: string): number {
  let candidate = startMs;
  for (let guard = 0; guard < 6; guard += 1) {
    const hit = shifts.flatMap((shift) => shift.breaks.map((plannedBreak) => breakWindow(businessDate, plannedBreak))).find((window) => candidate < Date.parse(window.finish) && Date.parse(window.start) < candidate + durationMs);
    if (!hit) return candidate;
    candidate = Date.parse(hit.finish);
  }
  return candidate;
}

/**
 * The cascade engine (Section 6/7/8/39/40). Walks each Resource's queue in
 * ORIGINAL Scheduled order (never reordered, Section 35) and threads a
 * running "chain finish" — the effective finish of whatever precedes a
 * future Requirement in the Current Plan — forward. A predecessor finishing
 * later delays the successor; finishing earlier advances it (Section 7);
 * finishing within tolerance leaves the successor exactly on its Original
 * slot (Section 8/11) so noise never reads as a replan. COMPLETED and
 * RUNNING/PAUSED Requirements keep an immutable Actual Start — only their
 * Current Finish (= Actual Finish, or Projected Finish while still running)
 * can differ from the Original (Section 40).
 */
export function buildOperationalTimeline(
  lots: readonly Lot[],
  executionsByLotId: Readonly<Record<string, ProductionExecutionRecord>>,
  currentTime: string,
  shifts: readonly Shift[] = [],
  downtimeMinutesByLotId: Readonly<Record<string, number>> = {},
  setupDurationMinutes = 30,
): readonly OperationalTimelineEntry[] {
  const byResource = new Map<string, Lot[]>();
  for (const lot of lots) {
    const list = byResource.get(lot.scheduledResourceId) ?? [];
    list.push(lot);
    byResource.set(lot.scheduledResourceId, list);
  }
  const entries = new Map<string, OperationalTimelineEntry>();
  const toleranceMs = TIMELINE_TOLERANCE_MINUTES * 60_000;

  for (const resourceLots of byResource.values()) {
    const ordered = [...resourceLots].sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart));
    let chainFinishMs: number | null = null;
    let previousLot: Lot | null = null;

    for (const lot of ordered) {
      const execution = executionsByLotId[lot.id];
      if (!execution) continue;
      const originalStartMs = Date.parse(lot.scheduledStart);
      const originalFinishMs = Date.parse(lot.scheduledFinish);
      const nominalDurationMs = originalFinishMs - originalStartMs;
      const status = timelineRequirementStatus(execution, lot, currentTime);

      let currentStartMs: number;
      let currentFinishMs: number;
      let projectedFinish: string | undefined;

      if (status === 'COMPLETED') {
        currentStartMs = Date.parse(execution.actualStart ?? lot.scheduledStart);
        currentFinishMs = Date.parse(execution.actualFinish ?? lot.scheduledFinish);
      } else if (status === 'RUNNING' || status === 'DELAYED') {
        const actualStartMs = Date.parse(execution.actualStart ?? lot.scheduledStart);
        const downtimeMs = (downtimeMinutesByLotId[lot.id] ?? 0) * 60_000;
        currentStartMs = actualStartMs;
        currentFinishMs = actualStartMs + nominalDurationMs + downtimeMs;
        projectedFinish = new Date(currentFinishMs).toISOString();
      } else {
        // NOT_STARTED / SCHEDULED — the only statuses whose Current Start is itself recalculated.
        // The tolerance below governs the `replanned` DISPLAY flag only (Section 8/11) — it must
        // never snap Current Start back to Original when the predecessor (possibly still RUNNING,
        // its own finish not yet certain) has not actually freed the Resource by then: doing so
        // previously produced a real overlap between a RUNNING Requirement and its own successor.
        if (chainFinishMs === null) {
          currentStartMs = originalStartMs;
        } else {
          const setupMs = previousLot && requiresSetup(previousLot, lot) ? setupDurationMinutes * 60_000 : 0;
          const candidateStartMs = chainFinishMs + setupMs;
          currentStartMs = nudgePastBreaks(candidateStartMs, nominalDurationMs, shifts, lot.scheduledStart.slice(0, 10));
        }
        currentFinishMs = currentStartMs + nominalDurationMs;
      }

      chainFinishMs = currentFinishMs;
      previousLot = lot;

      const varianceMinutes = Math.round((currentFinishMs - originalFinishMs) / 60_000);
      const replanned = Math.abs(currentStartMs - originalStartMs) > toleranceMs || Math.abs(currentFinishMs - originalFinishMs) > toleranceMs;

      entries.set(lot.id, {
        requirementId: lot.id,
        resourceId: lot.scheduledResourceId,
        materialId: lot.materialId,
        quantity: lot.quantity,
        originalStart: lot.scheduledStart,
        originalFinish: lot.scheduledFinish,
        currentStart: new Date(currentStartMs).toISOString(),
        currentFinish: new Date(currentFinishMs).toISOString(),
        actualStart: execution.actualStart,
        actualFinish: execution.actualFinish,
        projectedFinish,
        status,
        replanned,
        varianceMinutes,
      });
    }
  }

  return lots.map((lot) => entries.get(lot.id)).filter((entry): entry is OperationalTimelineEntry => entry !== undefined);
}
