# WF-002 — Plan-Aware Resource Readiness Implementation Report

## Status

Product Review candidate. This artifact does not approve the visual baseline and does not authorize WF-003.

## Implemented scope

The selected-Lot Preparation view now combines Lot context, demonstrative Resource Readiness and the existing organized plan. Resources are grouped as **Com condição**, **Requer atenção** and **Sem condição**. `UNKNOWN` remains visible as **Informação insuficiente**, and the Scheduled Resource remains in its factual group with the **Programada** marker.

The direct Preparation route without a selected Lot remains an exception-first workbench and does not render a full timeline.

## Plan context

The contextual timeline uses the same `HourByHourSchedule` component, temporal math, lanes, Lots, Setup, planned-break bands and Current Time behavior as WF-001 through the `READINESS_CONTEXT` mode. It does not create a second scheduling engine.

For the Lot 257 attention candidate, the context shows DC01, DC03 and DC05 during Turno 1. The selected Lot appears only on DC01, its Scheduled Resource. Existing Lots on the other relevant Resources remain visible.

For the Lot 267 blocked candidate, DC05 and the programmed DC02 are shown during Turno 2. Keeping DC02 in this timeline is a deliberate contextual exception: it preserves the selected Lot in its real Scheduled Resource lane without promoting that Resource out of **Sem condição**. The view preserves the 17:23 Current Time marker, planned breaks and the existing Setup on DC05.

## Known impact

For every Resource represented in the contextual timeline, the compact impact view derives only:

- number of Lots already scheduled in the displayed period;
- Material sequence;
- existing Setup count;
- first known non-ready condition, or absence of a known restriction;
- factual Scheduled Resource marker.

No best slot, ranking, recommendation or machine-selection result is calculated.

## Decision boundary

- Resource Assignment: **NO**
- Resource change: **NO**
- sequence or time reordering: **NO**
- drag-and-drop: **NO**
- optimization or automatic recommendation: **NO**
- Dispatch, Release or Execution: **NO**
- Resource Availability inference: **NO**

The source that determines Scheduled Resource remains **BUSINESS VALIDATION REQUIRED**.

## Technical gates

| Gate | Result |
|---|---:|
| Vitest | 52/52 PASS |
| TypeScript + Vite production build | PASS |
| Playwright WF-001 + WF-002 | 18/18 PASS |
| Automated accessibility validation | PASS |
| Responsive overflow validation | PASS |
| Forbidden-red validation | PASS |

## Product Review candidates

- `e2e/wf002-production-readiness.spec.ts-snapshots/WF-002-PLAN-AWARE-READINESS-ATTENTION-CANDIDATE-chromium-darwin.png`
- `e2e/wf002-production-readiness.spec.ts-snapshots/WF-002-PLAN-AWARE-READINESS-BLOCKED-CANDIDATE-chromium-darwin.png`
- `e2e/wf002-production-readiness.spec.ts-snapshots/WF-002-PLAN-AWARE-RESOURCE-CONTEXT-CANDIDATE-chromium-darwin.png`

Earlier screenshots remain preserved. None of these candidates is marked `APPROVED`.

## Remaining real TBDs

- governed business source for Scheduled Resource;
- governed Resource Availability definition and source;
- formal Overall Readiness aggregation rule;
- governed decision logic for Resource Assignment, reserved for WF-003.

These TBDs are disclosed and do not block Product Review of this demonstrative, read-only WF-002 increment.
