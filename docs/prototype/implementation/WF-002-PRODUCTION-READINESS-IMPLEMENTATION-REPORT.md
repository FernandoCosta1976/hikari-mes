# WF-002 Production Readiness Implementation Report

**Status:** CANDIDATE — NOT APPROVED  
**Dominant question:** **Temos condições de produzir?**

## 1. Implemented

Implemented a navigable Readiness Workbench at `/demo/fundicao-dc/production-readiness`, integrated with the WF-001 Lot Detail handoff. The experience preserves the selected Scheduled Lot and planning context, supports exception-first navigation across the period, evaluates demonstrative Lot × Resource evidence, and exposes progressive condition detail without Resource Assignment, Dispatch, Release, or Execution.

## 2. Functional traceability

The repository explicitly states that the Standard MES Function Catalog is unavailable. Consequently, no Function ID or official CORE/ESSENTIAL priority is invented.

| Capability | MES Function | Priority | User Use Case | WF-002 Element | Source |
| --- | --- | --- | --- | --- | --- |
| Evaluate production conditions | Production Readiness | Catalog classification unavailable | UC-PROD-003 | Dominant summary and Lot assessment | Functional Model 04; UC-PROD-003 |
| Assess raw-material sufficiency | Material Availability | Catalog classification unavailable | UC-MAT-001 | Material condition evidence | Functional Model 07; Use Case Manifesto |
| Filter technically possible machines | Resource Eligibility | Catalog classification unavailable | UC-PROD-003 | Eligibility-first DC01–DC05 cards | WF-002 Readiness Model; DQ-MRE-001 |
| Understand time-relevant machine conditions | Resource Availability context | Catalog classification unavailable | UC-PROD-003 | Availability condition per eligible Resource | WF-002 Readiness Model |
| Understand tooling and preparation impact | Production Tool / Setup context | Catalog classification unavailable | UC-PROD-003 | Tooling and Setup evidence in drill-down | Architecture Reinforcement 04; Functional Model 04 |
| Identify technical restrictions | Maintenance/constraint context | Catalog classification unavailable | UC-PROD-003 | Restriction evidence and exception strip | Functional Model 04; WF-002 Concept |
| Preserve urgency context | Buffer Context | Catalog classification unavailable | contextual UC-BUF-001 | Lot context only; not a readiness rule | WF-002 Information Architecture |

## 3. Dominant question

The H1 asks “Temos condições de produzir?”. Immediately below, the selected Lot context and provisional, explainable Readiness Summary state whether a demonstrative viable path exists and expose attended, attention, impediment, and unknown Resource evidence.

## 4. WF-001 → WF-002 handoff

- Route: `/demo/fundicao-dc/production-readiness?lotId=<lot-id>`.
- Preserved: Productive Area, business date, Lot, Material, quantity, destination, scheduled interval, Scheduled Resource (demonstrative), Schedule Version, Balancing source, and correlated PyMAC Production Order.
- Entry: `Avaliar preparação` from WF-001 Lot Detail.
- Return: `Voltar ao Plano Hora-Hora` carries the same Lot ID and reopens its detail.

## 5. Lot Readiness

The internal presentation model distinguishes `READY`, `ATTENTION`, `BLOCKED`, and `UNKNOWN`. The demonstrative fixture assigns explicit scenario outcomes to the 21 Lots; it is not a productive formula. Consolidation is reason-first and contains no score, weighting, machine recommendation, or lifecycle transition.

## 6. Resource Readiness — main candidate (Lot 252)

| Resource | Eligibility | Availability | Tooling | Setup | Maintenance/restriction | Presentation status |
| --- | --- | --- | --- | --- | --- | --- |
| DC01 | Eligible | No known impediment | Compatible hypothesis | No change identified | None known | READY |
| DC02 | Ineligible | Not evaluated | Not evaluated | Not evaluated | Not evaluated | Structural exclusion |
| DC03 | Eligible; Scheduled Resource demonstrative | No known impediment | Demonstrative tool change | Required; duration not calculated | None known | ATTENTION |
| DC04 | Ineligible | Not evaluated | Not evaluated | Not evaluated | Not evaluated | Structural exclusion |
| DC05 | Eligible | Evidence unconfirmed | Compatibility unconfirmed | No change identified | Restrictive observation may require validation | UNKNOWN |

## 7. Exception-based UX

The sidebar filters all 21 Lots by attended, attention, impediment, and insufficient-information results. A compact exception strip links directly to affected Resources. Normal evidence stays available but visually subordinate.

## 8. Progressive drill-down

Level 1 presents the Lot result and counts. Level 2 presents unranked DC01–DC05 cards and relevant exceptions. Level 3 opens an accessible contextual drawer with condition, evidence, demonstrative source, assessment time, and explicit unknowns. Closing or pressing Escape returns focus to the originating Resource.

## 9. WF-003 boundary

- Resource Assignment implemented? **NO**
- Dispatch implemented? **NO**
- Release implemented? **NO**
- Execution implemented? **NO**

The future handoff is visible but disabled and explicitly says no Resource is assigned in WF-002.

## 10. Domain questions / TBDs

- Standard MES Function Catalog, Function IDs, and CORE/ESSENTIAL priorities are unavailable.
- Productive Readiness aggregation, mandatory dimensions, normative vocabulary, and lifecycle remain TBD.
- Resource Availability authoritative source, forecast rule, confidence, and vocabulary remain TBD.
- Productive tooling identifiers, compatibility source, Setup matrix, and duration rules remain TBD.
- Maintenance/restriction authoritative source and normative vocabulary remain TBD.
- Material sufficiency/conversion and staging authoritative sources remain TBD.
- The origin of Scheduled Resource remains BUSINESS VALIDATION REQUIRED.
- WF-003 route and final handoff label remain outside this implementation.

## 11. Files created

- `src/domain/production-readiness/models.ts`
- `src/demo/fixtures/fundicaoDcProductionReadiness.ts`
- `src/demo/adapters/productionReadinessAdapter.ts`
- `src/features/production-readiness/ProductionReadinessPage.tsx`
- `src/features/production-readiness/ProductionReadinessPage.module.css`
- `src/features/production-readiness/ProductionReadinessPage.test.tsx`
- `e2e/wf002-production-readiness.spec.ts`
- `e2e/wf002-production-readiness.spec.ts-snapshots/WF-002-PRODUCTION-READINESS-CANDIDATE-chromium-darwin.png`

## 12. Files modified

- `src/domain/scenario/ScenarioDefinition.ts`
- `src/demo/scenarios/fundicaoDcScenario.ts`
- `src/demo/adapters/scenarioDefinitionAdapter.ts`
- `src/demo/scenario-engine/scenarioStore.ts`
- `src/app/routing/DemoRouteBoundary.tsx`
- `src/features/production-scheduling/ProductionSchedulingPage.tsx`
- `src/features/production-scheduling/ProductionSchedulingPage.module.css`
- `src/features/production-scheduling/components/LotDetail.tsx`
- `e2e/wf001-production-scheduling.spec.ts`

## 13. Test results

| Gate | Result |
| --- | --- |
| TypeScript / production build | PASS |
| Unit/component/integration | 48 PASS |
| Playwright WF-001 + WF-002 | 14 PASS |
| WF-001 → WF-002 → WF-001 context | PASS |
| `git diff --check` | PASS |

## 14. Accessibility

Landmarks, H1 hierarchy, accessible labels, textual states, keyboard interaction, Escape, focus return, reduced motion, and contextual drawer were implemented. Automated axe result: PASS, zero violations.

## 15. Responsiveness

Validated at 1440×900, 1280×800, and 1024×768 with no global horizontal overflow. The Resource grid progressively reduces columns; the sidebar retains rail behavior and becomes an overlay on small viewports.

## 16. Red scan

PASS. No forbidden red semantic styling was rendered. Blocked/impediment uses the governed unavailable/neutral visual language and explicit text.

## 17. Architectural audit

The domain model is React/CSS/Zustand independent. Demonstrative facts remain in fixtures and are converted through an adapter. Features consume scenario projections rather than fixtures. Application Context, Scenario State, and local UI State remain distinct. No backend, API, persistence, or premature generic abstraction was introduced.

## 18. Review URL

`http://127.0.0.1:4173/demo/fundicao-dc/production-readiness?lotId=lot-252`

## 19. Screenshot path

- `e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-READINESS-SIGNALS-CANDIDATE-chromium-darwin.png`
- `e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-LOT-QUICK-CONTEXT-CANDIDATE-chromium-darwin.png`
- `e2e/wf002-production-readiness.spec.ts-snapshots/WF-002-PRODUCTION-READINESS-CANDIDATE-chromium-darwin.png`
- `e2e/wf002-production-readiness.spec.ts-snapshots/WF-002-EXCEPTION-WORKBENCH-CANDIDATE-chromium-darwin.png`

All four artifacts are **CANDIDATE — NOT APPROVED**.

## 20. Product Owner review points

1. Does the provisional vocabulary communicate evidence without implying lifecycle status?
2. Is exception-first filtering sufficient for 21 Lots?
3. Does the selected Scheduled Resource remain visibly demonstrative?
4. Are ineligible machines compact enough while still explainable?
5. Is the distinction between Material Availability and Staging clear?
6. Does the Resource drill-down contain enough evidence without becoming a matrix?
7. Is the disabled WF-003 handoff boundary sufficiently explicit?
8. Are the fictional tooling and restriction narratives safe for executive demonstration?

## 21. Recommended next action

**A. WF-002 READY FOR PRODUCT REVIEW**

## WF-001 ↔ WF-002 CONTINUOUS JOURNEY

1. **Entry points:** contextual Lot investigation and compact Preparation Summary in WF-001; direct sidebar entry is also supported.
2. **Quick Context:** the existing Lot Detail retains the timeline and adds only a compact provisional result plus Material, Eligibility, and Setup signals.
3. **Plan signal:** every Lot block has a small textual/icon signal for READY, ATTENTION, BLOCKED, or UNKNOWN; its accessible name states the readiness meaning.
4. **Preparation Summary:** the compact attention strip shows the four plan counts and opens WF-002 without selecting a Lot.
5. **Exception-first entry:** aggregate mode orders BLOCKED, ATTENTION, UNKNOWN, then READY and explicitly says that this is not operational prioritization.
6. **Programmed Resource:** displayed as **Máquina programada · demonstrativa**, separate from Readiness and operational assignment.
7. **Context transport:** the route carries only the stable Lot identifier; Productive Area and current demo controls remain in their existing Application/Scenario state boundaries. A journey snapshot preserves origin, scroll, page position, and sidebar state.
8. **WF-001 restoration:** return uses client-side routing and restores the same in-memory scenario controls and saved journey snapshot.
9. **Horizontal scroll restored:** **YES**, using the timeline component's explicit initial-scroll contract.
10. **Lot remains selected:** **YES**.
11. **Focus returns to Lot:** **YES**.
12. **Deep linking:** a valid `lotId` opens that Lot; missing or invalid context falls back to aggregate mode without arbitrary selection.
13. **Sidebar entry:** Preparação always opens aggregate/exception-first mode without silently choosing a Lot.
14. **Journey sidebar:** Plano Hora-Hora and Preparação are functional; Organização is visibly future and non-interactive.
15. **Timeline duplicated in WF-002?** **NO**.
16. **Resource Assignment implemented?** **NO**.
17. **Dispatch implemented?** **NO**.
18. **Remaining TBDs:** Scheduled Resource origin/authority; productive Readiness aggregation and vocabulary; Availability sources/rules; tooling, Setup, maintenance, material/staging sources; WF-003 behavior and authorization.

## OPERATIONAL WORKSPACE ARCHITECTURE

1. **How WF stopped representing Screen:** workflow IDs now identify governed operational decision capabilities. Plano and Preparação are perspectives of one product workspace, while their feature modules and state meanings remain separate.
2. **Perspectives:** Plano answers “O que precisamos produzir?”; Preparação answers “Temos condições de produzir?”; Organização is visible only as the future perspective for “Onde e como vamos produzir?”. They are directly accessible and are not wizard steps.
3. **Transversal Lot Context:** selecting a Lot opens progressive context in Plano without forced navigation. The same Lot ID can then anchor specialized Readiness investigation and return to the original timeline, selection, focus, filters, scroll, and sidebar state.
4. **Readiness reuse:** the reference `production-readiness` domain projection and Scenario selector feed the Plan signal, Lot Context summary, preparation detail, and aggregate exception workbench. Components do not independently calculate a Readiness status.
5. **Persona access:** a scheduling persona may investigate from Plano; a preparation persona may open Preparação directly. Neither path requires completing the other perspective.
6. **Contextual work:** `PLAN → LOT CONTEXT → READINESS CONDITION → INVESTIGATE` progressively adds evidence while preserving the scheduling context and semantic origin of each fact.
7. **Exception work:** direct Preparação entry opens the aggregate period view, orders explicit exception states first, and never silently chooses a Lot or calls that ordering an operational priority.
8. **Routing continuity:** routes remain available for deep links and history, but both perspectives render the same `OperationalWorkspace`. Productive Area comes from Application Context; Scenario and business controls remain in Scenario State; applicable Lot and journey restoration are preserved.
9. **Scenes of evolution:** modular feature, domain, selector, and shared-shell boundaries support Plan, Lot detail, Readiness signal/detail, and eligible Resource comparison now, while reserving later scenes for assignment, sequencing, dispatch/release, and execution without a mega component.
10. **WF-003 implemented:** **NO**.
11. **Resource Assignment implemented:** **NO**. Lot Context and Preparação contain no assign/change/confirm Resource action.
12. **TBDs:** Scheduled Resource authority; productive Readiness aggregation and lifecycle; authoritative Availability, tooling, Setup, maintenance, material, and staging rules; WF-003 interaction, authorization, and assignment semantics.

### Architecture record and impact

- **Decision created:** `docs/prototype/decisions/OPERATIONAL-WORKSPACE-AND-DECISION-BOUNDARIES.md`.
- **Shared implementation created:** `src/app/workspace/OperationalWorkspace.tsx`, `OperationalWorkspace.module.css`, and `src/shared/presentation/productionFormatting.ts`.
- **Files modified for the boundary:** Production Scheduling page/styles, Production Readiness page, WF-002 E2E coverage, and this report.
- **WF-001 impact:** its timeline and Lot Context remain intact, but now render inside the shared workspace and consume the same reference Readiness projection as Preparação.
- **WF-002 impact:** its contextual and exception modes now share the same shell and Application Context as Plano; the capability remains a separate feature.
- **Future WF-003 impact:** Organização has a reserved perspective and modular extension point only. No route, domain behavior, Resource Assignment, or orchestration UI was created.
