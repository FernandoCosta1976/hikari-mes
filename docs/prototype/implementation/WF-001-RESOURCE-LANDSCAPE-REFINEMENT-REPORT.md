# WF-001 RESOURCE LANDSCAPE REFINEMENT REPORT

**Date:** 2026-08-13
**Scope:** WF-001 — Production Scheduling / Plano Hora-Hora
**Candidate status:** READY FOR PRODUCT REVIEW — NOT APPROVED

## A. Product Decision Recorded

The section `Physical Resource Landscape in WF-001` was added to `WF-001-MARKET-ALIGNMENT-REVIEW.md`. It records that WF-001 presents Fundição DC machines DC01–DC05 as a secondary physical-resource layer, without Lot assignment, Resource Availability, Dispatch or Production Readiness behavior.

`DQ-WF001-001-PARALLEL-SCHEDULE` remains `TBD / BUSINESS VALIDATION REQUIRED`; physical Resource lanes do not become Schedule Streams.

## B. Files Changed

Created:

- `src/features/production-scheduling/components/FoundryResourceLandscape.tsx`
- `src/features/production-scheduling/components/FoundryResourceLandscape.test.tsx`
- `e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-RESOURCE-LANDSCAPE-CANDIDATE-chromium-darwin.png`
- `docs/prototype/implementation/WF-001-RESOURCE-LANDSCAPE-REFINEMENT-REPORT.md`

Modified:

- `src/features/production-scheduling/ProductionSchedulingPage.tsx`
- `src/features/production-scheduling/ProductionSchedulingPage.module.css`
- `e2e/wf001-production-scheduling.spec.ts`
- `docs/prototype/wireframes/production-scheduling/WF-001-MARKET-ALIGNMENT-REVIEW.md`

## C. Resource Representation

- DC01 visible? **YES**
- DC02 visible? **YES**
- DC03 visible? **YES**
- DC04 visible? **YES**
- DC05 visible? **YES**

The machines appear as five non-interactive horizontal physical Resource lanes aligned to the plan's temporal reference. No operational status is shown.

## D. Resource Semantics

- DC01–DC05 represent physical Resources? **YES**
- DC01–DC05 represent Schedule Streams? **NO**
- DC01–DC05 represent Work Centers? **NO, unless separately validated**
- DC01–DC05 currently receive Lot Assignment? **NO**

Internally the component uses `Resource`; the UI title uses the governed and natural pt-BR label “Máquinas da Fundição DC”.

## E. Schedule × Resource Separation

The dominant `Plano Hora-Hora` continues to contain the received Lots and explicitly identifies `Plano recebido — Balancing`. Below it, a separate secondary section identifies the physical context of the Area and states that the Lots have not yet been assigned to machines.

The physical lanes contain no Lot blocks and are labeled as context, not planning sequences. A discreet journey reads `Plano recebido → Preparação → Organização operacional`.

## F. Lot Assignment Audit

- Lots assigned to DC01–DC05: **0**
- Resource Assignment actions: **0**
- Dispatch actions: **0**
- Drag-and-drop interactions: **0**
- Resource status claims: **0**

The selected Lot continues to show `Recurso — Ainda não atribuído`.

## G. Product Owner Narrative

The composition supports this narrative without implementing the future decision:

1. Balancing supplied the short-term Production Schedule.
2. The Hour-by-Hour Plan shows the Lots that must be produced.
3. Fundição DC has five physical machines: DC01–DC05.
4. No Lot has yet been assigned to a machine.
5. Eligibility and availability will be assessed in preparation, followed later by operational organization.

## H. Visual Hierarchy

1. Global context and Data Freshness;
2. commitment and demand destinations;
3. quick attention reading;
4. plan controls and business date;
5. Schedule revision;
6. dominant Hour-by-Hour Plan and contextual Lot detail;
7. secondary Fundição DC physical Resource landscape;
8. Production Order correlation;
9. buffer and material attention;
10. next decision / preparation handoff.

## I. Domain Question Status

`DQ-WF001-001-PARALLEL-SCHEDULE`

- Status: **TBD / BUSINESS VALIDATION REQUIRED**
- Selected model: **NONE**
- Impact of this refinement: **NONE**

The five physical lanes do not answer whether Balancing supplies one or multiple planned sequences.

## J. Test Results

| Gate | PASS/FAIL | Quantity | Errors | Warnings |
|---|---|---:|---:|---:|
| Typecheck | PASS | 1 execution | 0 | 0 |
| Build | PASS | 110 modules | 0 | 0 |
| Unit/component tests | PASS | 19 tests in 8 files | 0 | 0 |
| Playwright | PASS | 5 tests | 0 | 0 |
| Axe | PASS | 1 full-page scan | 0 violations | 0 |
| Responsive E2E | PASS | 3 viewports | 0 | 0 |
| Visual snapshot | PASS | 1 new candidate | 0 | 0 |
| Git diff check | PASS | Working tree | 0 | 0 |
| Red scan | PASS | `src` and `e2e` | 0 | 0 |
| Lint | NOT CONFIGURED | 0 | 0 | No `lint` script exists |

## K. Accessibility

- The section is a named region with heading and contextual description.
- DC01–DC05 form a semantic list.
- Each machine has an accessible label stating that it has no assigned Lot.
- The lanes are deliberately non-interactive.
- The horizontally scrollable reference has an accessible label and keyboard focus.
- Automated axe result: zero detected violations.

## L. Responsiveness

- 1440 px: **PASS**
- 1280 px: **PASS**
- 1024 px: **PASS**

At narrower widths the section preserves a minimum industrial timeline width and uses controlled horizontal scrolling. DC01–DC05 remain legible and do not become large dashboard cards. The dominant plan timeline is not compressed.

## M. Red Scan

RED COLOR VIOLATIONS: 0

## N. Screenshots

- Previous baseline: `e2e/wf001-production-scheduling.spec.ts-snapshots/wf001-production-scheduling-before-market-alignment-chromium-darwin.png`
- Market alignment candidate: `e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-MARKET-ALIGNMENT-CANDIDATE-chromium-darwin.png`
- New Resource Landscape candidate: `e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-RESOURCE-LANDSCAPE-CANDIDATE-chromium-darwin.png`

All prior references remain preserved. The new screenshot is a **CANDIDATE**, not an approved baseline.

## O. Architectural Audit

1. ADR-001 preserved? **YES**
2. Application Context preserved? **YES**
3. Zustand boundary preserved? **YES**
4. Domain remains React-independent? **YES**
5. No Resource Assignment? **YES**
6. No Dispatch? **YES**
7. No WF-002? **YES**
8. No new MES TBD resolved? **YES**
9. Work Center != Resource preserved? **YES**
10. Schedule != Resource lanes preserved? **YES**

No domain model, fixture, state or routing change was required. The machine identifiers are presentation constants for the confirmed physical context and do not create assignment state.

## P. Product Owner Review Items

The Product Owner must observe:

1. whether the Hour-by-Hour Plan remains the primary object;
2. whether DC01–DC05 are immediately recognizable as machines of Fundição DC;
3. whether the machine section is clearly secondary to the received Schedule;
4. whether empty lanes communicate physical capacity context without implying availability;
5. whether the absence of Lot blocks clearly prevents a false assignment;
6. whether the text explaining future preparation is sufficient and discreet;
7. whether `Plano recebido → Preparação → Organização operacional` supports the executive narrative;
8. whether the shared temporal reference aids comprehension or suggests an unintended machine schedule;
9. whether the section adds appropriate context without excessive page density;
10. whether the Lot detail still communicates `Recurso — Ainda não atribuído`;
11. whether horizontal scrolling at 1024 px remains understandable;
12. whether the candidate should be approved, adjusted or removed.

## Q. Review URL

`http://127.0.0.1:5173/demo/fundicao-dc/production-scheduling`

## R. Recommended Decision

**A. RESOURCE LANDSCAPE READY FOR PRODUCT REVIEW**

The five confirmed physical Resources are visible without creating Resource Assignment, Dispatch, WF-002 behavior or a decision about Balancing parallelism. Automated, visual, accessibility and responsive gates passed. Final visual acceptance remains exclusively with the Product Owner.

WF-001 RESOURCE LANDSCAPE PASSED — READY FOR PRODUCT REVIEW
