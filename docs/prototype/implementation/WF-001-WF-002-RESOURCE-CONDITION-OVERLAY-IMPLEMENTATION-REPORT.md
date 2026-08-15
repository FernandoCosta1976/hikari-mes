# WF-001 / WF-002 — Resource Condition Overlay Implementation Report

## Status

Product Review candidate. No commit or push was performed.

## Implemented

The WF-001 Hour-by-Hour plan now provides the operational **Avaliar cenários** action and the active **Avaliação de alternativas** mode. After a Lot is selected, the five fixed Resource lanes receive the same canonical WF-002 condition projection: **Com condição**, **Requer atenção** and **Sem condição**. `UNKNOWN` remains distinct, and the Scheduled Resource is marked **Programada** without status promotion. The canonical DC01–DC05 spatial order never changes.

The overlay is read-only. Disabling it restores the original DC01–DC05 timeline order and leaves all Lots, Setups, planned breaks and Current Time unchanged.

## Context and impact

Eligible Resource labels expose a keyboard- and pointer-accessible preview containing Eligibility, Availability, Tooling, Setup and the main known restriction. The compact impact summary derives only current-plan facts: main restriction, Material changes or continuity, and known existing Setup minutes.

Noneligible Resources remain present as factual plan context but are visually subordinated. Eligibility is not interpreted as availability, recommendation or assignment.

## Reuse and future boundary

The implementation extends the existing `HourByHourSchedule` scene mode and reuses its temporal engine, grid, Resource lanes, Lots, Setup, breaks, Current Time and accessibility primitives. `SIMULATION` exists only as an internal future scene-mode type; no simulation control or behavior is exposed.

- Resource Assignment: **NO**
- plan mutation: **NO**
- drag-and-drop: **NO**
- ranking or recommendation: **NO**
- Dispatch or Release: **NO**

## Gates

| Gate | Result |
|---|---:|
| Vitest | 53/53 PASS |
| TypeScript + Vite build | PASS |
| Playwright WF-001 + WF-002 | 20/20 PASS |
| Overlay keyboard preview | PASS |
| Overlay automated accessibility | PASS |
| Overlay forbidden-red validation | PASS |
| Original timeline restored after exit | PASS |

## Screenshot candidate

`e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-RESOURCE-CONDITION-OVERLAY-CANDIDATE-chromium-darwin.png`

The screenshot remains a candidate and does not replace an approved baseline.

## Remaining TBDs

- governed source of Scheduled Resource;
- governed Resource Availability source and rule;
- future Resource Assignment decision logic in WF-003;
- any future Simulation Mode behavior and authorization.
