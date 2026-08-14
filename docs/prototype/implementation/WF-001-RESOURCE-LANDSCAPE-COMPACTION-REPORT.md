# WF-001 RESOURCE LANDSCAPE COMPACTION REPORT

**Date:** 2026-08-13
**Scope:** WF-001 — Production Scheduling / Plano Hora-Hora
**Candidate status:** READY FOR PRODUCT REVIEW — NOT APPROVED

## A. Implementation Summary

The secondary empty DC01–DC05 temporal matrix and its duplicated hour axis were removed from WF-001. They were replaced by a compact, non-temporal physical-context strip containing the five Fundição DC machines, an explicit `Atribuição dos Lotes — Ainda não realizada` message and a short Production Readiness handoff.

The approved Hour-by-Hour Plan logic, Lot-first representation, temporal mathematics, Schedule Version, Data Freshness, revision, attention reading and progressive disclosure were not redesigned.

## B. Files Changed

Created:

- `e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-RESOURCE-LANDSCAPE-COMPACT-CANDIDATE-chromium-darwin.png`
- `docs/prototype/implementation/WF-001-RESOURCE-LANDSCAPE-COMPACTION-REPORT.md`

Modified:

- `src/features/production-scheduling/components/FoundryResourceLandscape.tsx`
- `src/features/production-scheduling/components/FoundryResourceLandscape.test.tsx`
- `src/features/production-scheduling/ProductionSchedulingPage.module.css`
- `e2e/wf001-production-scheduling.spec.ts`
- `docs/prototype/wireframes/production-scheduling/WF-001-MARKET-ALIGNMENT-REVIEW.md`

Removed from the current UI/CSS, without deleting historical artifacts:

- the second Resource time axis;
- the DC01–DC05 temporal lanes;
- the Resource section's horizontal scroller and temporal grid.

## C. Resource Representation

- DC01 visible? **YES**
- DC02 visible? **YES**
- DC03 visible? **YES**
- DC04 visible? **YES**
- DC05 visible? **YES**

The five identifiers appear as compact list items, not individual cards, lanes or controls.

## D. Temporal Duplication

- Second Resource Time Axis present? **NO**
- Second Resource Timeline present? **NO**

The only temporal visualization is the dominant Hour-by-Hour Plan received from Balancing.

## E. Resource Assignment Audit

- Lots assigned to Resources: **0**
- Resource Assignment actions: **0**
- Dispatch actions: **0**
- Machine selectors/recommendations: **0**
- Drag-and-drop interactions: **0**

Lot Detail continues to state `Recurso — Ainda não atribuído`.

## F. WF-001 Final Hierarchy

1. global HIKARI context and demonstrative Area;
2. dominant question and Data Freshness;
3. production commitment, destinations and Schedule source/version;
4. quick attention reading;
5. plan controls, business date and Schedule revision;
6. dominant Hour-by-Hour Plan with contextual Lot detail;
7. compact physical context — Máquinas da Fundição DC;
8. progressive Production Order, buffer and material-attention detail;
9. next-decision handoff to preparation.

## G. Handoff

The selected Lot continues to expose the `Avaliar preparação` CTA. The compact machine section says that machine eligibility and availability will be evaluated during preparation. The final next-decision section also reinforces that preparation occurs in the next experience without assigning a Resource, releasing or starting production in WF-001.

No WF-002 route, evaluation, state or component was implemented.

## H. Domain Question

`DQ-WF001-001-PARALLEL-SCHEDULE`

- Status: **TBD / BUSINESS VALIDATION REQUIRED**
- Selected model: **NONE**
- Changed by this compaction: **NO**

The compact Resource list does not depend on or answer the Balancing parallelism question.

## I. Test Results

| Gate | PASS / FAIL | Quantity | Errors | Warnings |
|---|---|---:|---:|---:|
| Typecheck | PASS | 1 execution | 0 | 0 |
| Build | PASS | 110 modules | 0 | 0 |
| Unit/component tests | PASS | 19 tests in 8 files | 0 | 0 |
| Playwright | PASS | 5 tests | 0 | 0 |
| Axe | PASS | 1 full-page scan | 0 violations | 0 |
| Responsive E2E | PASS | 3 viewports | 0 | 0 |
| Visual snapshot | PASS | 1 new compact candidate | 0 | 0 |
| Git diff check | PASS | Working tree | 0 | 0 |
| Red scan | PASS | `src` and `e2e` | 0 | 0 |
| Lint | NOT CONFIGURED | 0 | 0 | No `lint` script exists |

## J. Accessibility

- The compact section remains a named semantic region.
- Its heading and descriptive text establish context.
- DC01–DC05 are exposed as a semantic list with accessible machine labels.
- Machines are deliberately non-interactive.
- The section creates no unnecessary focus stop or horizontal scrolling.
- Axe detected zero violations.

## K. Responsiveness

- 1440 px: **PASS**
- 1280 px: **PASS**
- 1024 px: **PASS**

The compact list wraps in a controlled manner if required, preserves legible labels and does not cause horizontal page overflow. Only the actual Hour-by-Hour Plan retains controlled temporal scrolling where needed.

## L. Red Scan

RED COLOR VIOLATIONS: 0

## M. Screenshot Paths

- Original approved design: `docs/prototype/assets/wireframes/production-scheduling/WF-001-PRODUCTION-SCHEDULING-V1.0-APPROVED.png`
- Previous market-alignment candidate: `e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-MARKET-ALIGNMENT-CANDIDATE-chromium-darwin.png`
- Previous resource-landscape candidate: `e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-RESOURCE-LANDSCAPE-CANDIDATE-chromium-darwin.png`
- New compact candidate: `e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-RESOURCE-LANDSCAPE-COMPACT-CANDIDATE-chromium-darwin.png`

All previous references remain unchanged. The new screenshot is a **CANDIDATE**, not an approved baseline.

## N. Before × After Visual Review

| Aspect | Classification | Objective comparison |
|---|---|---|
| Page height | IMPROVED | Full-page candidate reduced from 1868 px to 1726 px at 1280 px width |
| Timeline dominance | IMPROVED | The only remaining time matrix is the Balancing Hour-by-Hour Plan |
| Resource clarity | IMPROVED | Five machines and unassigned state are visible together in one compact context |
| Visual duplication | IMPROVED | Repeated time axis and empty machine lanes removed |
| Information density | IMPROVED | Resource context uses a short strip instead of a large empty surface |
| Handoff clarity | IMPROVED | Preparation message is adjacent to the explicit unassigned state and existing CTA |

## O. Architectural Audit

1. ADR-001 preserved? **YES**
2. Application Context preserved? **YES**
3. Scenario State boundary preserved? **YES**
4. UI State remains local? **YES**
5. Domain remains React-independent? **YES**
6. No Resource Assignment? **YES**
7. No Dispatch? **YES**
8. No WF-002 implementation? **YES**
9. Work Center != Resource preserved? **YES**
10. Schedule != Resource Assignment preserved? **YES**
11. No MES TBD resolved? **YES**

WF-003 was not implemented. `Temporal Resource Matrix` is explicitly deferred to Resource Orchestration after governed Resource Assignment.

## P. Product Owner Review Items

The Product Owner should verify visually:

1. whether the Hour-by-Hour Plan is again the only and dominant temporal object;
2. whether DC01–DC05 remain immediately legible;
3. whether the machines read as physical context rather than a scheduler;
4. whether `Atribuição dos Lotes — Ainda não realizada` is sufficiently explicit;
5. whether the compact section occupies appropriately little vertical space;
6. whether the absence of an hour axis removes the false impression of machine scheduling;
7. whether the preparation message is clear without exposing WF-002 detail;
8. whether Lot 252 still shows `Recurso — Ainda não atribuído`;
9. whether `Avaliar preparação` creates a natural handoff;
10. whether the compact list wraps acceptably at 1024 px;
11. whether the overall narrative remains “Balancing → Lots → five machines → preparation”;
12. whether the new candidate may replace the previous Resource Landscape direction.

## Q. Review URL

`http://127.0.0.1:5173/demo/fundicao-dc/production-scheduling`

## R. Recommended Next Action

**A. COMPACT RESOURCE LANDSCAPE READY FOR PRODUCT REVIEW**

The duplicate temporal representation was removed while preserving the confirmed physical Resource context and the WF-001 boundary. Technical, visual, responsive and accessibility gates passed. Final visual approval remains with the Product Owner.

WF-001 RESOURCE LANDSCAPE COMPACTION PASSED — READY FOR PRODUCT REVIEW

## Final integrated freeze reference — 2026-08-14

The compact physical Resource landscape was the approved predecessor of the contextual **Agora na Fundição** projection. This report remains historical evidence; the final integrated baseline is:

`docs/prototype/assets/wireframes/production-scheduling/WF-001-PRODUCTION-SCHEDULING-INTEGRATED-V1.0-APPROVED.png`

The final approval record preserves Work Center ≠ Resource, Current Resource State ≠ Resource Availability and the absence of Resource Assignment.
