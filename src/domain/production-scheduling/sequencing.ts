import type { Lot } from './models';
import type { FoundryResourceId } from '../resource/models';
import { requiresSetup } from './setups';

/**
 * Avaliar Cenário — What-If Operational Sequencing (definitive fix). Moving
 * a Lot no longer just relocates it to the same time slot on a new
 * Resource (the old `simulateResourceMove` behavior, which produced
 * conflicts instead of resolving them). It means REPRIORITIZATION: the
 * Lot's own duration (`scheduledFinish - scheduledStart`) is preserved, but
 * its start/finish are recomputed from its new position in the sequence,
 * and every subsequent Lot on the Origin and Destination Resource cascades
 * automatically — never left with a manual gap or an overlap.
 */

/** `anchorLotId: null` inserts at the front of the Resource's sequence; otherwise inserts immediately after that Lot. */
export type SequenceMoveTarget =
  | { kind: 'SAME_RESOURCE'; anchorLotId: string | null }
  | { kind: 'CROSS_RESOURCE'; resourceId: FoundryResourceId; anchorLotId: string | null };

export interface SequencedTiming {
  scheduledResourceId: FoundryResourceId;
  scheduledStart: string;
  scheduledFinish: string;
}

export interface SequenceMoveResult {
  feasible: true;
  movedLotId: string;
  originResourceId: FoundryResourceId;
  destinationResourceId: FoundryResourceId;
  /** Every Lot whose timing changed from baseline, moved Lot included, keyed by Lot id. */
  scheduleByLotId: Readonly<Record<string, SequencedTiming>>;
  /** Lots that shifted as a cascade consequence — excludes the moved Lot itself. */
  affectedLotIds: readonly string[];
  originalStart: string;
  originalFinish: string;
  newStart: string;
  newFinish: string;
  baselineSetupCount: number;
  simulatedSetupCount: number;
  netSetupDeltaCount: number;
  originLastFinishBaseline: string;
  originLastFinishSimulated: string;
  destinationLastFinishBaseline: string;
  destinationLastFinishSimulated: string;
  /** Positive = the Resource's own last requirement finishes later than baseline. */
  originClosingDeltaMinutes: number;
  destinationClosingDeltaMinutes: number;
}

export interface SequenceMoveInfeasible {
  feasible: false;
  reason: 'LOT_NOT_FOUND' | 'LOT_LOCKED' | 'ANCHOR_LOCKED_ORDER_VIOLATION' | 'OVERLAP';
}

const iso = (ms: number) => new Date(ms).toISOString();
const timingChanged = (timing: SequencedTiming, lot: Lot) => Date.parse(timing.scheduledStart) !== Date.parse(lot.scheduledStart) || Date.parse(timing.scheduledFinish) !== Date.parse(lot.scheduledFinish) || timing.scheduledResourceId !== lot.scheduledResourceId;
const lastFinish = (lots: readonly Lot[]) => lots.reduce((latest, lot) => Date.parse(lot.scheduledFinish) > Date.parse(latest) ? lot.scheduledFinish : latest, lots[0]?.scheduledFinish ?? '');
const countSetups = (ordered: readonly Lot[]) => ordered.slice(1).filter((lot, index) => requiresSetup(ordered[index], lot)).length;

/**
 * Recomputes one Resource's sequence in cascade. Locked Lots (already
 * Running/Completed — Section 14/15/16, "Historical Actual is immutable")
 * never move: they keep their exact baseline timing and act as fixed
 * checkpoints the cascade must route strictly forward from. Movable Lots
 * inherit their own duration and slot in one after another, with a Setup
 * gap only when the component actually changes (Section 6).
 */
function resequence(orderedLots: readonly Lot[], lockedLotIds: ReadonlySet<string>, setupMinutes: number, resourceAnchorStartMs: number): Map<string, SequencedTiming> {
  const result = new Map<string, SequencedTiming>();
  let cursor: number | null = null;
  let previous: Lot | null = null;
  for (const lot of orderedLots) {
    if (lockedLotIds.has(lot.id)) {
      result.set(lot.id, { scheduledResourceId: lot.scheduledResourceId, scheduledStart: lot.scheduledStart, scheduledFinish: lot.scheduledFinish });
      cursor = Date.parse(lot.scheduledFinish);
      previous = lot;
      continue;
    }
    // Whichever Lot ends up first advances to the Resource's earliest known start — removing a Lot from the front must not leave a permanent artificial gap (Section 13).
    if (cursor === null) cursor = resourceAnchorStartMs;
    else if (previous && requiresSetup(previous, lot)) cursor += setupMinutes * 60_000;
    const durationMs = Date.parse(lot.scheduledFinish) - Date.parse(lot.scheduledStart);
    const start: number = cursor;
    const finish: number = start + durationMs;
    result.set(lot.id, { scheduledResourceId: lot.scheduledResourceId, scheduledStart: iso(start), scheduledFinish: iso(finish) });
    cursor = finish;
    previous = lot;
  }
  return result;
}

/**
 * The FULL invariant, not just "no overlap" — a movable Lot that lands
 * immediately before a locked checkpoint must still leave that checkpoint's
 * own required Setup gap (locked Lots keep their fixed time unconditionally
 * in `resequence`, so a violation there has to be caught here). Checked
 * pairwise across every Resource in true chronological order.
 */
function violatesSequenceInvariant(orderedLots: readonly Lot[], timings: ReadonlyMap<string, SequencedTiming>, setupMinutes: number): boolean {
  const withTiming = orderedLots.map((lot) => ({ lot, timing: timings.get(lot.id)! }));
  const chronological = [...withTiming].sort((a, b) => Date.parse(a.timing.scheduledStart) - Date.parse(b.timing.scheduledStart));
  return chronological.slice(1).some(({ lot, timing }, index) => {
    const previous = chronological[index];
    const requiredGapMs = (requiresSetup(previous.lot, lot) ? setupMinutes : 0) * 60_000;
    return Date.parse(timing.scheduledStart) < Date.parse(previous.timing.scheduledFinish) + requiredGapMs;
  });
}

/** The cascade must not silently reorder a Resource's real chronology — a Lot inserted "before" a locked checkpoint whose own anchor time actually falls later is a conflict, not a valid sequence. */
function ordersMatchChronology(intendedOrder: readonly Lot[], timings: ReadonlyMap<string, SequencedTiming>): boolean {
  const chronological = [...intendedOrder].sort((a, b) => Date.parse(timings.get(a.id)!.scheduledStart) - Date.parse(timings.get(b.id)!.scheduledStart));
  return chronological.map((lot) => lot.id).join() === intendedOrder.map((lot) => lot.id).join();
}

export function simulateSequenceMove(
  lots: readonly Lot[],
  movedLotId: string,
  target: SequenceMoveTarget,
  lockedLotIds: ReadonlySet<string> = new Set(),
  setupMinutes = 30,
): SequenceMoveResult | SequenceMoveInfeasible {
  const moved = lots.find((lot) => lot.id === movedLotId);
  if (!moved) return { feasible: false, reason: 'LOT_NOT_FOUND' };
  if (lockedLotIds.has(movedLotId)) return { feasible: false, reason: 'LOT_LOCKED' };

  const originResourceId = moved.scheduledResourceId;
  const destinationResourceId = target.kind === 'CROSS_RESOURCE' ? target.resourceId : originResourceId;
  const sameResource = originResourceId === destinationResourceId;

  const originalOrigin = lots.filter((lot) => lot.scheduledResourceId === originResourceId).sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart));
  const originalDestination = sameResource ? originalOrigin : lots.filter((lot) => lot.scheduledResourceId === destinationResourceId).sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart));
  const baselineSetupCount = sameResource ? countSetups(originalOrigin) : countSetups(originalOrigin) + countSetups(originalDestination);
  const originLastFinishBaseline = lastFinish(originalOrigin);
  const destinationLastFinishBaseline = lastFinish(originalDestination);

  // Build the new destination order: everyone currently there minus the moved Lot, re-inserted after the anchor.
  // The moved Lot is normalized onto the destination Resource here so Setup detection (same-Resource, different-component) reasons about where it WILL be, not where it came from.
  const movedOnDestination: Lot = { ...moved, scheduledResourceId: destinationResourceId };
  const destinationWithoutMoved = originalDestination.filter((lot) => lot.id !== movedLotId);
  const anchorIndex = target.anchorLotId === null ? -1 : destinationWithoutMoved.findIndex((lot) => lot.id === target.anchorLotId);
  if (target.anchorLotId !== null && anchorIndex === -1) return { feasible: false, reason: 'LOT_NOT_FOUND' };
  const newDestinationOrder = [...destinationWithoutMoved.slice(0, anchorIndex + 1), movedOnDestination, ...destinationWithoutMoved.slice(anchorIndex + 1)];

  // A locked Lot's relative order among the OTHER locked Lots on this Resource can never be disturbed by a drop.
  const lockedOrderOf = (ordered: readonly Lot[]) => ordered.filter((lot) => lockedLotIds.has(lot.id)).map((lot) => lot.id);
  if (lockedOrderOf(newDestinationOrder).join() !== lockedOrderOf(originalDestination).join()) return { feasible: false, reason: 'ANCHOR_LOCKED_ORDER_VIOLATION' };

  const destinationAnchorMs = originalDestination.length ? Math.min(...originalDestination.map((lot) => Date.parse(lot.scheduledStart))) : Date.parse(moved.scheduledStart);
  const destinationTimings = resequence(newDestinationOrder, lockedLotIds, setupMinutes, destinationAnchorMs);
  if (violatesSequenceInvariant(newDestinationOrder, destinationTimings, setupMinutes) || !ordersMatchChronology(newDestinationOrder, destinationTimings)) return { feasible: false, reason: 'OVERLAP' };

  const scheduleByLotId: Record<string, SequencedTiming> = {};
  const affectedLotIds: string[] = [];
  for (const lot of newDestinationOrder) {
    const timing = destinationTimings.get(lot.id)!;
    if (timingChanged(timing, lot)) {
      scheduleByLotId[lot.id] = timing;
      if (lot.id !== movedLotId) affectedLotIds.push(lot.id);
    }
  }

  let newOriginOrder = originalOrigin;
  if (!sameResource) {
    newOriginOrder = originalOrigin.filter((lot) => lot.id !== movedLotId);
    const originAnchorMs = newOriginOrder.length ? Math.min(...originalOrigin.map((lot) => Date.parse(lot.scheduledStart))) : Date.parse(moved.scheduledStart);
    const originTimings = resequence(newOriginOrder, lockedLotIds, setupMinutes, originAnchorMs);
    if (violatesSequenceInvariant(newOriginOrder, originTimings, setupMinutes) || !ordersMatchChronology(newOriginOrder, originTimings)) return { feasible: false, reason: 'OVERLAP' };
    for (const lot of newOriginOrder) {
      const timing = originTimings.get(lot.id)!;
      if (timingChanged(timing, lot)) {
        scheduleByLotId[lot.id] = timing;
        affectedLotIds.push(lot.id);
      }
    }
  }

  const originLastFinishSimulated = sameResource ? lastFinish(newDestinationOrder) : (newOriginOrder.length ? lastFinish(newOriginOrder.map((lot) => ({ ...lot, ...scheduleByLotId[lot.id] }))) : originLastFinishBaseline);
  const destinationLastFinishSimulated = lastFinish(newDestinationOrder.map((lot) => ({ ...lot, ...scheduleByLotId[lot.id] })));
  const movedTiming = destinationTimings.get(movedLotId)!;

  return {
    feasible: true,
    movedLotId,
    originResourceId,
    destinationResourceId,
    scheduleByLotId,
    affectedLotIds,
    originalStart: moved.scheduledStart,
    originalFinish: moved.scheduledFinish,
    newStart: movedTiming.scheduledStart,
    newFinish: movedTiming.scheduledFinish,
    baselineSetupCount,
    simulatedSetupCount: sameResource ? countSetups(newDestinationOrder) : countSetups(newDestinationOrder) + countSetups(originalOrigin.filter((lot) => lot.id !== movedLotId)),
    netSetupDeltaCount: (sameResource ? countSetups(newDestinationOrder) : countSetups(newDestinationOrder) + countSetups(originalOrigin.filter((lot) => lot.id !== movedLotId))) - baselineSetupCount,
    originLastFinishBaseline,
    originLastFinishSimulated,
    destinationLastFinishBaseline,
    destinationLastFinishSimulated,
    originClosingDeltaMinutes: Math.round((Date.parse(originLastFinishSimulated) - Date.parse(originLastFinishBaseline)) / 60_000),
    destinationClosingDeltaMinutes: Math.round((Date.parse(destinationLastFinishSimulated) - Date.parse(destinationLastFinishBaseline)) / 60_000),
  };
}
