# Executive Demo Numbers — 10/07/2026 09:15, Turno 1

All figures below are computed live from the running scenario (`computeFundicaoDcQualitySummary`,
`computeFundicaoDcOeeSummary`, `computeResourceOperationalSnapshots`) against the reference scenario
`fundicao-dc` at its 09:15 baseline — none are hand-entered.

## Context

| Field | Value |
|---|---|
| Day | 10/07/2026 |
| Time | 09:15 |
| Shift | Turno 1 |
| Production Group | PowerTrain |
| Productive Area | Fundição DC |

## Plan

| Metric | Value |
|---|---|
| Planned Requirements | 23 |
| Planned Quantity | 2.100 peças |

## Production & Quality (day accumulated)

| Metric | Value |
|---|---|
| Produced | 1.159 |
| Good | 1.026 |
| Reject | 24 |
| Rework | 0 |

## Resource Operational State (ResourceOperationalSnapshot, DC01–DC05)

| State | Count |
|---|---|
| Producing (Produzindo) | 4 — DC01, DC02, DC04, DC05 |
| Paused (Em pausa) | 0 |
| Waiting start (Aguardando início) | 1 — DC03 |

DC03 (lot-sd-514, `1S4-E5411-W0`) is `NOT_STARTED` with Readiness `READY` and no
Release record, so it resolves to `OperationalStatus = READY_FOR_RELEASE` — a real,
late, still-pending Requirement. **Fixed this round**: `deriveResourceOperationalStatus`
previously mapped every status other than RUNNING/PAUSED/WAITING_START/BLOCKED to the
`NO_ACTIVE_REQUIREMENT` catch-all, so READY_FOR_RELEASE fell through to "Sem necessidade
ativa" — semantically impossible for a Resource with a pending, overdue Requirement. It
now maps PLANNED/WAITING_PREPARATION/READY_FOR_RELEASE/WAITING_START to `WAITING_START`
("Aguardando início"); only `null` or `COMPLETED` ever produce `NO_ACTIVE_REQUIREMENT`.
Regression test: `resourceOperationalSnapshotAdapter.test.ts` — "current requirement
exists + not completed + LATE ⇒ resource state != NO_ACTIVE_REQUIREMENT".

## Adherence Qualifier (same snapshot, a SEPARATE dimension from Operational State)

| Qualifier | Count |
|---|---|
| Late | 1 — DC03 |
| At Risk | 0 |

Note: Visão Estratégica's "Situação das Máquinas" grid additionally shows each Resource's
**Lot Health** (a pre-existing, richer per-Requirement risk assessment from Capability 05 —
`assessLotExecutionHealth`, e.g. "Risco de atraso"), which is intentionally a distinct,
quantity-aware dimension from the Adherence Qualifier above — both are legitimate, neither
was altered this round, and they are not expected to numerically agree (Section 20: never
forced to "bater").

## Downtime (Capability 08 governed Events, closed by 09:15)

| Metric | Value |
|---|---|
| Named Events (Registro de Eventos) | 33 min — DC01 Ajuste operacional 10 min · DC05 Ferramental 15 min · DC04 Microparada 8 min, all within Turno 1 (07:00–15:14), all closed by 09:15 |
| Implied Planned-vs-Run gap (day, all 16 eligible due Lots) | 53 min — see OEE math below |

The 53-min day-level gap is not double-counting the 33 min of named Events: the three
Lots that directly host an Event (lot-sd-506/DC01, lot-sd-516/DC04, lot-sd-521/DC05) each
show a gap **exactly equal** to their own Event's duration (10/8/15 min). The remaining 20
min is downstream schedule slip on DC01's and DC04's *next* Lot on the same Resource
(lot-sd-507 +10 min, lot-sd-517 +8 min — both still open, inheriting the upstream delay
and not yet caught up) plus a 2-min pre-existing variance on lot-sd-503 unrelated to any
Event. This is standard OEE behavior: a stop's cost persists in every subsequent Lot on
that Resource until the schedule recovers, not just the Lot that hosted the Event.

## OEE (area, day accumulated)

**Fixed this round** — two formula bugs in the governed OEE domain functions
(`domain/oee/calculations.ts`, `domain/production-quality/models.ts`), not a display or
report-only issue:

1. `plannedProductionTimeMinutes` clamped a Lot's Planned window to the Shift covering its
   **start**, even when the Lot had a concrete Actual Finish that legitimately crossed into
   the next Shift (3 Lots start in Turno 3, finish in Turno 1). Run Time has no such clamp,
   so those rows showed `Run > Planned`. Fix: only apply the Shift clamp to a still-open
   window (no Actual Finish yet) — a concrete Actual Finish is never clamped.
2. `knownRunTimeMinutes` subtracted an Event's full duration from the Run Time window even
   when the Event entirely preceded Actual Start — double-counting a delay that had already
   pushed Actual Start later (DC05's Setup overrun: Event 08:30–08:45, Actual Start 08:45).
   Fix: skip Events that start before Actual Start, mirroring the guard already used in
   `operationalTimelineAdapter.ts`.

Together these made `sum(Run) > sum(Planned)` across the day's 16 eligible due Lots, and
`aggregateAvailability`'s `clamp01(sumRun/sumPlanned)` silently rounded the resulting >100%
ratio down to exactly 100% — masking the real Availability loss from the 33 min of known
downtime. Corrected:

| Metric | Value |
|---|---|
| Effective Planned Production Time | 1.306 min (no Planned Time Exclusions modeled — Setup/breaks are symmetrically absent from both Run Time and Planned Time by design, see code comment) |
| Run Time | 1.253 min |
| Unplanned Downtime (Planned − Run) | 53 min |
| **Availability** | 1.253 / 1.306 = 95.94% → **96%** |
| Performance | 99.82% → **100%** |
| Quality | 97.71% → **98%** |
| **OEE** (A × P × Q) | 0.9594 × 0.9982 × 0.9771 = 0.9358 → **94%** |

Verified live at the reference 09:15 snapshot: OEE page "Acumulado do dia" and Visão
Estratégica's "Eficiência · OEE" both read **94% · A 96% · P 100% · Q 98%** — identical.
