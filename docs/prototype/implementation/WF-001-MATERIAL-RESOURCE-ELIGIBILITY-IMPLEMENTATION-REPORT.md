# WF-001 Material × Resource Eligibility Implementation Report

**Status:** CANDIDATE_FOR_PRODUCT_REVIEW
**Date:** 2026-08-13
**Scope:** WF-001 Lot Detail — contextual, read-only `Material → Eligible Resources` demo projection

## Pre-Flight

- Working tree contained the uncommitted Current Resource State implementation and its governance/report artifacts.
- `git diff --check`: PASS before implementation.
- Current Resource State changes were identified in scenario composition/state selectors, WF-001 page/component/styles/tests, domain projection, adapter, fixture and E2E candidate.
- No concurrent edit or material conflict was detected.
- Previous work was preserved; no Current Resource State behavior, fixture value, state vocabulary or screenshot was removed.
- Shared files were extended additively only where scenario composition, selection and page integration required it.

## Implementation Summary

WF-001 now consumes a simplified, explicitly `DEMO_SIMULATED`, read-only `Material → Eligible Resources` projection exclusively inside the selected planned Lot Detail.

The detail presents:

- Material;
- non-interactive **Máquinas elegíveis** chips;
- microcopy separating eligibility from availability/selection;
- **Recurso atribuído — Ainda não atribuído**;
- existing handoff to **Avaliar preparação**.

No matrix was added to the main page. The Plano Hora-Hora remains dominant. The **Agora na Fundição** cards remain a separate Current Resource State projection and contain no eligibility information.

## Demo Eligibility Data

**Classification: DEMO_SIMULATED — NOT YAMAHA MASTER DATA**

| Existing Material ID | UX Material | Eligible Resources |
|---|---|---|
| `material-a` | Material A | DC01, DC03, DC05 |
| `material-b` | Material B | DC02, DC03, DC05 |
| `material-c` | Material C | DC01, DC04 |

Existing Material identities and names were preserved. No Material was duplicated or renamed.

The existing confirmed Resource references `DC01`–`DC05` are represented by the shared `FoundryResourceId` domain type. No duplicate Resource objects were created in the eligibility module.

## Domain / Projection Model

Model: `MaterialResourceEligibilityProjection`.

Fields:

- `materialId`;
- `eligibleResourceIds`;
- `classification: 'DEMO_SIMULATED'`.

Explicitly absent:

- availability;
- priority;
- ranking;
- score;
- recommended Resource;
- selected Resource;
- Setup;
- tooling;
- maintenance;
- capacity.

The model is independent of React, Zustand, router, CSS, components and fixture imports.

The direct relation is a prototype projection, not a productive master-data model. The future-ready architecture remains:

```text
Material
→ Production Definition / Routing
→ Operation / Operation Activity
→ Eligible Resource / Resource Group
```

## Adapter Boundary

```text
fundicaoDcMaterialResourceEligibilityFixture
→ materialResourceEligibilityAdapter
→ MaterialResourceEligibilityProjection
→ immutable ScenarioDefinition + stable selector
→ eligibilityForMaterial view-model selection
→ LotDetail
```

The feature does not import the fixture. No API, generic repository, backend or real integration was introduced.

## Lot Detail Result

Conceptually:

```text
Material
Material A

Máquinas elegíveis
DC01 · DC03 · DC05

Elegível não significa disponível ou selecionado.

Recurso atribuído
Ainda não atribuído
```

The list has a textual accessible equivalent such as **“Máquinas elegíveis para Material A: DC01, DC03, DC05.”** Chips are list items, not controls.

## Current Resource State Separation

| Audit | Result |
|---|---:|
| Eligibility shown in “Agora na Fundição” cards? | NO |
| Current Resource State used to derive Eligibility? | NO |
| Current Resource State used to derive Availability? | NO |

The two projections share only governed Resource identities. No current-state observation influences the structural eligibility fixture.

## Resource Assignment Audit

| Behavior/field | Present? |
|---|---:|
| Automatic assignment | NO |
| Manual assignment control | NO |
| Recommended Resource | NO |
| Ranking | NO |
| Availability | NO |
| Dispatch | NO |
| WF-002 readiness result | NO |
| WF-003 orchestration | NO |

Even when eligibility is shown, Assigned Resource remains **Ainda não atribuído**.

## Domain Question

`DQ-MRE-001-ELIGIBILITY-DEFINITION-BASIS` remains:

**TBD — NON-BLOCKING FOR GOVERNED DEMO PROJECTION**

The implementation does not infer whether productive eligibility is owned directly by Material or by Routing, Operation, Production Version/recipe, Production Tool or another Production Definition.

## Traceability Gap

The Standard MES Function Catalog remains **NOT AVAILABLE IN REPOSITORY**. The implementation does not claim MES Function IDs, priorities, capability IDs or standard function-level traceability.

UC-PROD-003 and UC-PROD-005 remain governed consumers of Resource Eligibility. Neither use case was changed.

## Test Results

| Gate | Result | Quantity | Errors | Warnings |
|---|---|---:|---:|---:|
| Pre-flight `git diff --check` | PASS | 1 scan | 0 | 0 |
| TypeScript typecheck | PASS | 1 command | 0 | 0 |
| Production build | PASS | 114 modules | 0 | 0 |
| Unit/component tests | PASS | 28 tests / 10 files | 0 | 0 |
| Material A/B/C mapping | PASS | 3 parameterized cases | 0 | 0 |
| Prohibited projection fields | PASS | 4 explicit runtime assertions plus type boundary | 0 | 0 |
| Cross-Material Lot Detail | PASS | Material A and Material B | 0 | 0 |
| Playwright E2E | PASS | 5 tests | 0 | 0 functional |
| Axe accessibility | PASS | 1 complete scan | 0 violations | 0 |
| Responsiveness | PASS | 1440, 1280 and 1024 | 0 overflow | 0 |
| Visual regression candidate | PASS | 1 new integrated candidate | 0 mismatch | 0 |
| Final `git diff --check` | PASS | 1 scan | 0 | 0 |
| Red-color scan | PASS | 1 source scan | 0 violations | 0 |

Playwright emitted only an environment notice about `NO_COLOR`/`FORCE_COLOR`; no functional warning or failure occurred. No lint script exists in `package.json`.

## Current Resource State Regression

**All previous Current Resource State tests continue passing: YES.**

Validated:

- DC01–DC05 remain visible;
- safe current-state vocabulary remains intact;
- stale and partial states remain textual;
- no Resource card interaction was introduced;
- mandatory no-assignment microcopy remains present;
- 1440/1280/1024 have no Current Resource State overflow;
- Current Lot observations remain independent from planned Lot Resource Assignment.

## Accessibility

- Eligibility uses an accessible list with a Material-specific textual name.
- Chips are non-interactive list items.
- Meaning does not depend on color.
- Microcopy is visible, not tooltip-only.
- “Ainda não atribuído” remains explicit.
- Axe violations: 0.

## Responsiveness

Validated at 1440, 1280 and 1024 pixels:

- no global horizontal overflow;
- no Lot Detail horizontal overflow;
- no Current Resource State horizontal overflow;
- eligible Resource chips wrap inside the detail when required.

## Red Scan

**RED COLOR VIOLATIONS: 0**

No new severity color was introduced.

## Screenshots

Previous Current Resource State candidate:

`e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-CURRENT-RESOURCE-STATE-CANDIDATE-chromium-darwin.png`

New integrated, not-approved candidate:

`e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-CURRENT-STATE-ELIGIBILITY-CANDIDATE-chromium-darwin.png`

All previous screenshots remain preserved.

## Visual Review

| Aspect | Result | Observation |
|---|---|---|
| Timeline dominance | UNCHANGED | Eligibility exists only in the opened secondary detail. |
| Lot Detail density | REGRESSED | One compact row and explanatory line increase local density slightly. |
| Eligibility clarity | IMPROVED | Explicit chips and microcopy make the structural constraint visible. |
| Current State × Eligibility separation | UNCHANGED | Eligibility does not appear in Resource cards and is not derived from them. |
| Handoff clarity | IMPROVED | Material → eligible machines → unassigned Resource → preparation is explicit. |

The small local-density increase is the intentional trade-off and does not increase the main-page information architecture.

## Architectural Audit

| Check | Result |
|---|---:|
| ADR-001 preserved? | YES |
| Domain React-independent? | YES |
| Feature does not import fixture? | YES |
| No Availability modeled? | YES |
| No Resource Assignment? | YES |
| No Dispatch? | YES |
| No WF-002? | YES |
| No WF-003? | YES |
| Current Resource State preserved? | YES |
| Eligibility separate from Current State? | YES |
| DQ-MRE-001 unresolved? | YES |
| No productive model claimed? | YES |

## Product Owner Review Items

The Product Owner should verify:

1. Plano Hora-Hora remains dominant.
2. Eligibility appears only after selecting a planned Lot.
3. Material A shows DC01, DC03 and DC05.
4. Material B shows DC02, DC03 and DC05.
5. Chips do not look interactive.
6. Microcopy clearly separates eligibility from availability and selection.
7. “Recurso atribuído — Ainda não atribuído” remains prominent.
8. The additional Lot Detail density is acceptable.
9. “Agora na Fundição” contains no eligibility claim.
10. “Avaliar preparação” remains the natural next step.

## Review URL

`http://127.0.0.1:4173/demo/fundicao-dc/production-scheduling`

## Recommended Decision

**INTEGRATED WF-001 READY FOR PRODUCT REVIEW**

## Final approval and freeze — 2026-08-14

The Product Owner and Chief Architect approved this read-only `DEMO_SIMULATED` eligibility projection as contextual WF-001 Lot Detail scope. The approved visual representation is included in:

`docs/prototype/assets/wireframes/production-scheduling/WF-001-PRODUCTION-SCHEDULING-INTEGRATED-V1.0-APPROVED.png`

Approved baseline SHA-256: `33e3dea1e80c8207fee9350b14671b39cb26d572f7e9eddb6fac26a973b98b6c`.

DQ-MRE-001 remains TBD and the projection remains distinct from Availability, Readiness and Resource Assignment.
