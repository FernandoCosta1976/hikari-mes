# WF-001 — 24H / 1,600 Pieces / Planned Breaks / Setup

## Implemented scope

The demonstrative Fundição DC schedule now contains exactly 21 Lots and 1,600 pieces across a continuous 24-hour timeline, three shifts and five Scheduled Resource lanes. Lots may cross planned Café/Refeição bands without being split or temporally recalculated.

Material changes on the same Resource generate a distinct Scheduled Setup block. The centralized 30-minute duration is a **DEMONSTRATIVE ASSUMPTION / TBD**, not a standard MES rule. Setup is not a Lot, Production Order, planned break, Downtime, Maintenance or Actual Stop and contributes no quantity.

## Reconciled commitment

| Scope | Lots | Pieces |
|---|---:|---:|
| Turno 3 | 6 | 500 |
| Turno 1 | 8 | 550 |
| Turno 2 | 7 | 550 |
| Day | 21 | 1,600 |

Lot-size mix: 9 × 100 pieces, 5 × 70 pieces and 7 × 50 pieces.

## Demonstrative setups

| Resource | Transition | Window | Duration |
|---|---|---|---:|
| DC03 | Material A → Material B | 02:15–02:45 | 30 min |
| DC02 | Material B → Material D | 09:15–09:45 | 30 min |
| DC01 | Material A → Material C | 17:30–18:00 | 30 min |
| DC05 | Material A → Material B | 20:20–20:50 | 30 min |

The fixtures avoid placing these setup blocks directly over planned breaks as a demonstrative simplification only.

## Break behavior

Planned Shift Break is temporal context and does not block a Scheduled Lot. Examples include Lot 251 crossing Café 01:15–01:30, Lot 254 crossing Refeição 02:45–03:30, Lot 265 crossing Café 17:00–17:15 and Lots 267–270 crossing Refeição 19:15–20:00. Each remains one block with its original Scheduled Start and Scheduled Finish.

## Current Time

The scenario reference remains 17:23. On initial display, the timeline calculates a one-time horizontal scroll so the marker is approximately 2/9 of the visible temporal viewport, excluding the sticky Resource column. Subsequent user scrolling is unrestricted and is not overridden.

## Boundaries and pending validation

- `Eligible Resource != Available Resource`.
- `Scheduled Resource != Dispatched Resource != Actual Resource`.
- Current Time is a planning reference, not Actual state.
- Setup optimization, setup matrix, SMED, automatic sequencing and real Yamaha setup duration remain out of scope.
- The origin that determines Scheduled Resource remains `BUSINESS VALIDATION REQUIRED`.

## Validation evidence

- Unit and component tests: 44 passed across 12 files.
- Playwright E2E: 5 passed, including accessibility, responsiveness, setup rendering and Current Time auto-position.
- TypeScript and production build: passed.
- Current Time browser measurement at 1440 px: temporal viewport 1,218 px; target 270.67 px; initial `scrollLeft` 2,276 px; final marker position 21.98%.

## Candidate screenshots

- `../../../e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-24H-1600PCS-SETUP-CURRENT-TIME-CANDIDATE-chromium-darwin.png`
- `../../../e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-SHIFT2-1600PCS-SETUP-CANDIDATE-chromium-darwin.png`

The candidates do not replace or mark any prior baseline as approved.
