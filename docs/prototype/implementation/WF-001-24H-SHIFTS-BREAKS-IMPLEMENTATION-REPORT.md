# WF-001 — 24H Shifts and Planned Breaks Implementation Report

## Scope implemented

WF-001 now presents a continuous demonstrative 24-hour Production Schedule for Fundição DC. The plan preserves five Scheduled Resource lanes (`DC01`–`DC05`), adds governed shift windows and planned-break overlays, and lets the user switch between the complete day and an individual shift without changing the underlying Schedule Version.

The experience remains read-only and answers only **“O que precisamos produzir?”**. Shift breaks are visual planning context: they are not Lots, Downtime, failure, maintenance, OEE loss, Release, Dispatch or execution evidence.

## Demonstrative shifts

| ID | User label | Window | Planned breaks |
|---|---|---|---|
| `SHIFT_3` | Turno 3 | 00:00–06:59 | Café 1 01:15–01:30; Refeição 02:45–03:30; Café 2 05:00–05:15 |
| `SHIFT_1` | Turno 1 | 07:00–15:14 | Café 1 08:45–09:00; Refeição 10:45–11:30; Café 2 13:15–13:30 |
| `SHIFT_2` | Turno 2 | 15:15–23:59 | Café 1 17:00–17:15; Refeição 19:15–20:00; Café 2 21:45–22:00 |

## Demonstrative schedule

- Total: 30 Lots and 3,000 pieces.
- Turno 3: 10 Lots and 1,000 pieces (`251`–`260`).
- Turno 1: 10 Lots and 1,000 pieces (`261`–`270`).
- Turno 2: 10 Lots and 1,000 pieces (`271`–`280`).
- Every Resource has two Lots in every shift.
- The fixtures preserve parallel Lots, intentional gaps, varied duration, destinations and Material × Resource Eligibility.
- No Lot crosses a shift boundary or overlaps a planned break.

Examples include Lot 251 on DC01 from 00:05 to 01:05, Lot 265 on DC03 from 09:05 to 10:15, Lot 275 on DC03 from 17:20 to 18:40 and Lot 280 on DC05 from 22:05 to 23:15.

## Semantic and functional boundaries

- `Eligible Resource != Available Resource`.
- `Scheduled Resource != Dispatched Resource != Actual Resource`.
- Planned break does not assert unavailability and does not generate an operational state.
- The current scenario time remains 17:23 and is independent from planned-break rendering.
- The business source that determines the Scheduled Resource remains `BUSINESS VALIDATION REQUIRED`.

## Validation evidence

- Unit/component tests: 39 passed across 11 files.
- Build and TypeScript: passed.
- E2E/browser tests: 5 passed, including accessibility scan, responsive widths, reduced motion, 24h view and Shift 2 view.
- No lint script exists in the current package configuration.

## Candidate screenshots

- `../../../e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-24H-SHIFTS-BREAKS-CANDIDATE-chromium-darwin.png`
- `../../../e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-SHIFT-2-CANDIDATE-chromium-darwin.png`

These are review candidates and do not replace or mutate earlier approved baselines.
