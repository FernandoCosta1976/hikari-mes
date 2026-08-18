import { describe, expect, it } from 'vitest';
import { simulateSequenceMove, type SequenceMoveResult } from './sequencing';
import { requiresSetup } from './setups';
import { FOUNDRY_RESOURCE_IDS } from '../resource/models';
import { sourceDerivedLots } from '../../demo/scenarios/fundicaoDcSourceDerivedScenario';
import type { Lot } from './models';

/**
 * Mathematical invariant, not UI/label checks (per the "Critical Product
 * Correction" round): for EVERY Resource, walk EVERY consecutive pair in
 * the SIMULATED chronological order and assert
 *   next.start >= previous.finish + (Setup required ? setupMinutes : 0)
 * This is the one property that actually rules out the class of defect
 * that produced the published contradiction (a Lot reported as starting
 * before its own predecessor finished).
 */
function assertNoOverlapAndSetupHonored(lots: readonly Lot[], result: SequenceMoveResult, setupMinutes: number) {
  const timingFor = (lot: Lot) => {
    const simulated = result.scheduleByLotId[lot.id];
    return simulated ? { ...lot, ...simulated } : lot;
  };
  for (const resourceId of FOUNDRY_RESOURCE_IDS) {
    const onResource = lots
      .map(timingFor)
      .filter((lot) => lot.scheduledResourceId === resourceId)
      .sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart));
    for (let index = 1; index < onResource.length; index += 1) {
      const previous = onResource[index - 1];
      const current = onResource[index];
      const requiredGapMs = (requiresSetup(previous, current) ? setupMinutes : 0) * 60_000;
      const actualGapMs = Date.parse(current.scheduledStart) - Date.parse(previous.scheduledFinish);
      expect(actualGapMs, `${resourceId}: ${current.id} starts ${actualGapMs / 60_000}min after ${previous.id} finishes (needs >= ${requiredGapMs / 60_000}min)`).toBeGreaterThanOrEqual(requiredGapMs);
    }
  }
}

const assumeFeasible = (result: ReturnType<typeof simulateSequenceMove>): SequenceMoveResult => {
  if (!result.feasible) throw new Error(`Expected feasible, got infeasible: ${result.reason}`);
  return result;
};

/** Compares instants regardless of ISO string form (the engine emits UTC "Z", fixtures use "-03:00" — both are the same instant). */
const sameInstant = (a: string, b: string) => Date.parse(a) === Date.parse(b);
const at = (time: string) => `2026-07-10T${time}:00-03:00`;
const plusMinutes = (iso: string, minutes: number) => new Date(Date.parse(iso) + minutes * 60_000).toISOString();

/**
 * Section 24's exact synthetic example (R1 R2 R3 R4, move R4 after R1) —
 * built with a REAL 30min Setup gap wherever the component changes, exactly
 * like `deriveScheduledSetups` requires everywhere else in this app.
 */
const r1: Lot = { id: 'r1', lotNumber: 'R1', materialId: 'm-a', quantity: 100, scheduledStart: at('08:00'), scheduledFinish: at('08:50'), workCenterId: 'wc', destination: 'ASSEMBLY', productionOrderId: 'po', scheduledResourceId: 'DC01', materialAttention: false, state: 'SCHEDULED' };
const r2: Lot = { ...r1, id: 'r2', lotNumber: 'R2', materialId: 'm-b', scheduledStart: at('09:20'), scheduledFinish: at('10:10') }; // +30min Setup after R1 (m-a -> m-b)
const r3: Lot = { ...r1, id: 'r3', lotNumber: 'R3', materialId: 'm-a', scheduledStart: at('10:40'), scheduledFinish: at('11:30') }; // +30min Setup after R2 (m-b -> m-a)
const r4: Lot = { ...r1, id: 'r4', lotNumber: 'R4', materialId: 'm-b', scheduledStart: at('12:00'), scheduledFinish: at('12:50') }; // +30min Setup after R3 (m-a -> m-b)
const baseline = [r1, r2, r3, r4];

describe('Section 24 — same-machine reprioritization example (R1 R2 R3 R4, move R4 after R1)', () => {
  const result = assumeFeasible(simulateSequenceMove(baseline, 'r4', { kind: 'SAME_RESOURCE', anchorLotId: 'r1' }, new Set(), 30));

  it('produces the exact expected order: R1, R4, R2, R3', () => {
    const timingFor = (lot: Lot) => result.scheduleByLotId[lot.id] ?? lot;
    const order = [r1, r2, r3, r4].sort((a, b) => Date.parse(timingFor(a).scheduledStart) - Date.parse(timingFor(b).scheduledStart)).map((lot) => lot.id);
    expect(order).toEqual(['r1', 'r4', 'r2', 'r3']);
  });

  it('R1 keeps its own time (untouched, absent from the changed-schedule map)', () => {
    expect(result.scheduleByLotId['r1']).toBeUndefined();
  });

  it('R4 slots right after R1.finish plus a Setup (m-a -> m-b differ), keeping its own 50min duration', () => {
    expect(sameInstant(result.scheduleByLotId['r4'].scheduledStart, plusMinutes(r1.scheduledFinish, 30))).toBe(true);
    expect(Date.parse(result.scheduleByLotId['r4'].scheduledFinish) - Date.parse(result.scheduleByLotId['r4'].scheduledStart)).toBe(50 * 60_000);
  });

  it('R2 starts at R4.finish with no Setup (m-b -> m-b) and R3 at R2.finish + Setup (m-b -> m-a)', () => {
    expect(sameInstant(result.scheduleByLotId['r2'].scheduledStart, result.scheduleByLotId['r4'].scheduledFinish)).toBe(true);
    expect(sameInstant(result.scheduleByLotId['r3'].scheduledStart, plusMinutes(result.scheduleByLotId['r2'].scheduledFinish, 30))).toBe(true);
  });

  it('no overlaps across the whole cascade tail', () => {
    const timingFor = (lot: Lot) => result.scheduleByLotId[lot.id] ?? lot;
    const ordered = [r1, r2, r3, r4].sort((a, b) => Date.parse(timingFor(a).scheduledStart) - Date.parse(timingFor(b).scheduledStart));
    for (let index = 1; index < ordered.length; index += 1) expect(Date.parse(timingFor(ordered[index]).scheduledStart)).toBeGreaterThanOrEqual(Date.parse(timingFor(ordered[index - 1]).scheduledFinish));
  });

  it('affectedLotIds lists exactly R2 and R3, never the moved Lot itself', () => {
    expect(new Set(result.affectedLotIds)).toEqual(new Set(['r2', 'r3']));
  });
});

describe('quantity and cycle time are never altered by a move (Section 19/42)', () => {
  it('moved Lot keeps its exact original duration', () => {
    const result = assumeFeasible(simulateSequenceMove(baseline, 'r4', { kind: 'SAME_RESOURCE', anchorLotId: 'r1' }, new Set(), 30));
    const originalDurationMs = Date.parse(r4.scheduledFinish) - Date.parse(r4.scheduledStart);
    const newDurationMs = Date.parse(result.scheduleByLotId['r4'].scheduledFinish) - Date.parse(result.scheduleByLotId['r4'].scheduledStart);
    expect(newDurationMs).toBe(originalDurationMs);
  });
});

describe('locked Lots (Section 14/15/16 — Completed/Running are immutable)', () => {
  it('refuses to move a locked Lot at all', () => {
    const result = simulateSequenceMove(baseline, 'r4', { kind: 'SAME_RESOURCE', anchorLotId: 'r1' }, new Set(['r4']), 30);
    expect(result.feasible).toBe(false);
    expect((result as { reason: string }).reason).toBe('LOT_LOCKED');
  });

  it('never rewrites a locked Lot timing even when Lots around it move', () => {
    const result = assumeFeasible(simulateSequenceMove(baseline, 'r2', { kind: 'SAME_RESOURCE', anchorLotId: 'r3' }, new Set(['r1']), 30));
    expect(result.scheduleByLotId['r1']).toBeUndefined();
  });
});

describe('moving a Lot back to its own current position is a coherent no-op', () => {
  it('R2 anchored after R1 (where it already sits) changes nothing', () => {
    const result = assumeFeasible(simulateSequenceMove(baseline, 'r2', { kind: 'SAME_RESOURCE', anchorLotId: 'r1' }, new Set(), 30));
    expect(Object.keys(result.scheduleByLotId)).toEqual([]);
    expect(sameInstant(result.newStart, r2.scheduledStart)).toBe(true);
  });
});

/** Real canonical dataset (2026-07-10, fundicao-dc, 09:15 Scenario Clock) — DC01 has 10 requirements; lot-sd-510 (last on DC01) is the "locked, immutable at 09:15" seed, one per Resource ([510, 513, 514, 517, 523] are each the last requirement of their Resource). */
const lockedCanonicalLotIds = new Set(['lot-sd-510', 'lot-sd-513', 'lot-sd-514', 'lot-sd-517', 'lot-sd-523']);

describe('real canonical dataset — DC01 same-machine reprioritization', () => {
  it('moving lot-sd-503 right after lot-sd-501 cascades the DC01 tail, no overlaps, locked lot-sd-510 untouched', () => {
    const result = assumeFeasible(simulateSequenceMove(sourceDerivedLots, 'lot-sd-503', { kind: 'SAME_RESOURCE', anchorLotId: 'lot-sd-501' }, lockedCanonicalLotIds, 30));
    expect(result.scheduleByLotId['lot-sd-510']).toBeUndefined(); // locked, never rewritten
    expect(result.affectedLotIds).toContain('lot-sd-502');
    expect(result.affectedLotIds).not.toContain('lot-sd-503'); // the moved Lot itself is never listed as "affected"

    const dc01 = sourceDerivedLots.filter((lot) => lot.scheduledResourceId === 'DC01');
    const timingFor = (lot: Lot) => result.scheduleByLotId[lot.id] ?? { scheduledStart: lot.scheduledStart, scheduledFinish: lot.scheduledFinish };
    const ordered = [...dc01].sort((a, b) => Date.parse(timingFor(a).scheduledStart) - Date.parse(timingFor(b).scheduledStart));
    for (let index = 1; index < ordered.length; index += 1) {
      const previous = timingFor(ordered[index - 1]);
      const current = timingFor(ordered[index]);
      expect(Date.parse(current.scheduledStart)).toBeGreaterThanOrEqual(Date.parse(previous.scheduledFinish));
    }
    expect(ordered.map((lot) => lot.id)[1]).toBe('lot-sd-503'); // right after lot-sd-501
  });

  it('rejects moving the locked lot-sd-510 itself', () => {
    const result = simulateSequenceMove(sourceDerivedLots, 'lot-sd-510', { kind: 'SAME_RESOURCE', anchorLotId: 'lot-sd-501' }, lockedCanonicalLotIds, 30);
    expect(result.feasible).toBe(false);
  });
});

describe('Section 13 — removing the original first Lot must not leave a permanent artificial gap', () => {
  it('moving lot-sd-501 (originally first on DC01) later lets lot-sd-502 advance into the vacated 00:30 slot, not keep its own original 01:33 start', () => {
    const result = assumeFeasible(simulateSequenceMove(sourceDerivedLots, 'lot-sd-501', { kind: 'SAME_RESOURCE', anchorLotId: 'lot-sd-505' }, lockedCanonicalLotIds, 30));
    // lot-sd-502 is now first on DC01, so it advances straight to the Resource's earliest known start (no predecessor, so no Setup gate).
    expect(sameInstant(result.scheduleByLotId['lot-sd-502'].scheduledStart, '2026-07-10T00:30:00-03:00')).toBe(true);
  });
});

describe('real canonical dataset — cross-machine move onto an eligible Reserve Resource', () => {
  it('moving lot-sd-502 (1B2-E5411-W0, Reserve DC03) onto DC03 after its locked lot-sd-514 recalculates both DC01 (compacted) and DC03 (extended)', () => {
    const result = assumeFeasible(simulateSequenceMove(sourceDerivedLots, 'lot-sd-502', { kind: 'CROSS_RESOURCE', resourceId: 'DC03', anchorLotId: 'lot-sd-514' }, lockedCanonicalLotIds, 30));
    expect(result.originResourceId).toBe('DC01');
    expect(result.destinationResourceId).toBe('DC03');
    expect(result.scheduleByLotId['lot-sd-502'].scheduledResourceId).toBe('DC03');
    // lot-sd-514 (locked) finishes 09:15 -03:00; different component (1S4-E5411-W0 -> 1B2-E5411-W0) requires a 30min Setup.
    expect(sameInstant(result.scheduleByLotId['lot-sd-502'].scheduledStart, plusMinutes('2026-07-10T09:15:00-03:00', 30))).toBe(true);
    expect(result.affectedLotIds).not.toContain('lot-sd-514'); // locked, untouched
    expect(result.affectedLotIds).toContain('lot-sd-503'); // DC01 tail compacts to fill the gap left by lot-sd-502

    const dc01 = sourceDerivedLots.filter((lot) => lot.scheduledResourceId === 'DC01' && lot.id !== 'lot-sd-502');
    const timingFor = (lot: Lot) => result.scheduleByLotId[lot.id] ?? { scheduledStart: lot.scheduledStart, scheduledFinish: lot.scheduledFinish };
    const ordered = [...dc01].sort((a, b) => Date.parse(timingFor(a).scheduledStart) - Date.parse(timingFor(b).scheduledStart));
    for (let index = 1; index < ordered.length; index += 1) {
      const previous = timingFor(ordered[index - 1]);
      const current = timingFor(ordered[index]);
      expect(Date.parse(current.scheduledStart)).toBeGreaterThanOrEqual(Date.parse(previous.scheduledFinish));
    }
  });

  it('rejects a move that would place a Lot chronologically before a locked checkpoint it was dropped after', () => {
    // The engine does not know about Component -> Resource eligibility (Section 11) by design (that gate lives in
    // the feature layer); it still must reject anything that would violate a locked checkpoint's real chronology.
    // lot-sd-507's own original start (08:19) sits after lot-sd-514's original start (08:00), so the destination
    // anchor collapses onto 08:00 — colliding head-on with locked lot-sd-514's own fixed 08:00 start.
    const result = simulateSequenceMove(sourceDerivedLots, 'lot-sd-507', { kind: 'CROSS_RESOURCE', resourceId: 'DC03', anchorLotId: null }, lockedCanonicalLotIds, 30);
    expect(result.feasible).toBe(false);
    expect((result as { reason: string }).reason).toBe('OVERLAP');
  });
});

/**
 * REGRESSION — the exact class of case published in an earlier report as
 * "Lote 405: 06:40–07:50" / "Lote 401 movido depois do Lote 405: 06:10–07:20"
 * and flagged as a temporal contradiction. Root cause turned out to be the
 * PUBLISHED REPORT, not the engine: moving an originally-first Lot later on
 * its own Resource also compacts every Lot between the old and new position
 * — including the anchor itself — earlier. Re-verified end to end against
 * the current canonical (2026-07-10, 09:15) dataset with the same
 * moved-Lot-after-anchor shape (lot-sd-501 moved after lot-sd-505), so this
 * would fail under the pre-fix `simulateResourceMove` behavior (which never
 * moved the anchor at all), or under any regression that reintroduces that bug.
 */
describe('regression — the exact published "predecessor keeps its stale baseline time" case, independently verified end to end', () => {
  const result = assumeFeasible(simulateSequenceMove(sourceDerivedLots, 'lot-sd-501', { kind: 'SAME_RESOURCE', anchorLotId: 'lot-sd-505' }, lockedCanonicalLotIds, 30));

  it('lot-sd-505 itself compacts from its baseline 05:02 to a new 03:59 start — it is NOT still at its stale baseline time in the simulation', () => {
    expect(sameInstant(result.scheduleByLotId['lot-sd-505'].scheduledStart, '2026-07-10T03:59:00-03:00')).toBe(true);
    expect(sameInstant(result.scheduleByLotId['lot-sd-505'].scheduledFinish, '2026-07-10T05:36:00-03:00')).toBe(true);
  });

  it('lot-sd-501 (moved) starts exactly at lot-sd-505\'s NEW finish plus Setup (different component), not its baseline finish', () => {
    expect(sameInstant(result.scheduleByLotId['lot-sd-501'].scheduledStart, plusMinutes(result.scheduleByLotId['lot-sd-505'].scheduledFinish, 30))).toBe(true);
    expect(sameInstant(result.scheduleByLotId['lot-sd-501'].scheduledStart, '2026-07-10T06:06:00-03:00')).toBe(true);
    expect(sameInstant(result.scheduleByLotId['lot-sd-501'].scheduledFinish, '2026-07-10T06:39:00-03:00')).toBe(true);
  });

  it('every requirement on DC01 (locked lot-sd-510 included) satisfies next.start >= previous.finish + requiredSetup — the full mathematical invariant, not just the moved pair', () => {
    assertNoOverlapAndSetupHonored(sourceDerivedLots, result, 30);
  });

  it('the entire recomputed DC01 chain, in chronological order, is exactly this — printed here so the numbers are auditable, never re-guessed', () => {
    const dc01 = sourceDerivedLots.filter((lot) => lot.scheduledResourceId === 'DC01');
    const timingFor = (lot: Lot) => result.scheduleByLotId[lot.id] ?? { scheduledStart: lot.scheduledStart, scheduledFinish: lot.scheduledFinish };
    const ordered = [...dc01].sort((a, b) => Date.parse(timingFor(a).scheduledStart) - Date.parse(timingFor(b).scheduledStart));
    const expected: [string, string, string][] = [
      ['lot-sd-502', '2026-07-10T00:30:00-03:00', '2026-07-10T01:13:00-03:00'],
      ['lot-sd-503', '2026-07-10T01:43:00-03:00', '2026-07-10T02:16:00-03:00'],
      ['lot-sd-504', '2026-07-10T02:46:00-03:00', '2026-07-10T03:29:00-03:00'],
      ['lot-sd-505', '2026-07-10T03:59:00-03:00', '2026-07-10T05:36:00-03:00'],
      ['lot-sd-501', '2026-07-10T06:06:00-03:00', '2026-07-10T06:39:00-03:00'],
      ['lot-sd-506', '2026-07-10T07:09:00-03:00', '2026-07-10T08:19:00-03:00'], // untouched — the freed slack exactly matches, coincidence of a tightly-packed baseline
      ['lot-sd-507', '2026-07-10T08:19:00-03:00', '2026-07-10T09:29:00-03:00'],
      ['lot-sd-508', '2026-07-10T09:29:00-03:00', '2026-07-10T10:39:00-03:00'],
      ['lot-sd-509', '2026-07-10T11:09:00-03:00', '2026-07-10T12:46:00-03:00'],
      ['lot-sd-510', '2026-07-10T12:46:00-03:00', '2026-07-10T14:23:00-03:00'], // locked — unchanged from baseline
    ];
    expect(ordered.map((lot) => lot.id)).toEqual(expected.map(([id]) => id));
    ordered.forEach((lot, index) => {
      const [, expectedStart, expectedFinish] = expected[index];
      const timing = timingFor(lot);
      expect(sameInstant(timing.scheduledStart, expectedStart), `${lot.id} start`).toBe(true);
      expect(sameInstant(timing.scheduledFinish, expectedFinish), `${lot.id} finish`).toBe(true);
    });
  });
});

describe('property test — every feasible move on the real canonical dataset satisfies the full no-overlap/Setup invariant', () => {
  const movableLotIds = sourceDerivedLots.filter((lot) => !lockedCanonicalLotIds.has(lot.id)).map((lot) => lot.id);
  const anchorsPerResource = FOUNDRY_RESOURCE_IDS.map((resourceId) => [resourceId, [null, ...sourceDerivedLots.filter((lot) => lot.scheduledResourceId === resourceId).map((lot) => lot.id)]] as const);

  for (const movedLotId of movableLotIds) {
    for (const [resourceId, anchors] of anchorsPerResource) {
      for (const anchorLotId of anchors) {
        if (anchorLotId === movedLotId) continue;
        it(`${movedLotId} -> ${resourceId} after ${anchorLotId ?? '(start)'}: feasible implies zero overlap and Setup honored across every Resource`, () => {
          const result = simulateSequenceMove(sourceDerivedLots, movedLotId, { kind: 'CROSS_RESOURCE', resourceId, anchorLotId }, lockedCanonicalLotIds, 30);
          if (!result.feasible) return; // infeasible moves are covered by the dedicated rejection tests above
          assertNoOverlapAndSetupHonored(sourceDerivedLots, result, 30);
        });
      }
    }
  }
});
