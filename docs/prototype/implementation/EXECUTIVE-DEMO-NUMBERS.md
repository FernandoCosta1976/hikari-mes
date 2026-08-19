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
| Waiting / No active requirement | 1 — DC03 |

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
| Total Downtime | 33 min (DC05 Ferramental 15 min · DC04 Microparada 8 min · DC01 Ajuste operacional 10 min) |

## OEE (area, day accumulated)

| Dimension | Value |
|---|---|
| Availability | 100% |
| Performance | 100% |
| Quality | 98% |
| OEE | 98% |
