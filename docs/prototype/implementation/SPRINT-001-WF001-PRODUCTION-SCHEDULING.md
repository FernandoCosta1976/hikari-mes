# Sprint 001 — WF-001 Production Scheduling

**Status:** APPROVED / FROZEN
**Date:** 2026-08-13
**Route:** `/demo/fundicao-dc/production-scheduling`

## Scope

WF-001 answers only **“O que precisamos produzir?”** through the demonstrative Fundição DC schedule. It implements productive-area context, business date, Hoje/D+1/D+2/D+3, Schedule Version, source-level Data Freshness, commitment, destinations, continuous Hour-by-Hour Plan, Lot selection/detail, Production Order correlation, summarized buffer and raw-material context, version comparison, scenario variants and reset.

Production Readiness, Resource assignment, release, execution, quality, performance and OEE remain outside this experience.

## Pre-flight and Git baseline

- Governed WF-001 documentation, normative glossary, ADR-001 and Sprint 0 report were reviewed.
- Approved image: `docs/prototype/assets/wireframes/production-scheduling/WF-001-PRODUCTION-SCHEDULING-V1.0-APPROVED.png`.
- Incidental red and “next automatic update” content in the image were not reproduced because normative rules prevail.
- Sprint 0 placeholder and route were confirmed.
- No sensitive data was found.
- Local Sprint 0 baseline commit: `5fc2313` (`chore: establish HIKARI frontend foundation baseline`).
- No remote was configured and no push was performed.
- No final Sprint 1 commit was created.

## Domain and data

Pure TypeScript models created: `ProductionSchedule`, `ProductionOrder`, `Lot`, `Material`, `WorkCenter`, `DemandDestination`, `BufferPosition`, `DataFreshness`, `ScheduleVersion` and `ProductionSchedulingDefinition`.

The typed Fundição DC fixture contains 24 Lots across four days, three Production Orders, three Materials, three buffer positions, two Schedule Versions and separate Balancing/PyMAC freshness records. OP 4500123 correlates coherently with Lots 251, 252 and 253 (300 = 100 + 100 + 100). The mismatch variant changes the demonstrative order quantity to 340 without auto-correction.

Data flow remains:

`scenario fixture → demo adapter → domain/scenario state → selectors/view model → feature`

No component imports fixtures directly in production code.

## Scenario state

Zustand remains restricted to transversal demo facts and semantic actions: date selection, destination filtering, Schedule Version comparison, scenario activation and atomic reset. Definition, state, actions and selectors remain separate concepts. Lot detail visibility and freshness disclosure are local UI state.

Implemented scenarios:

| Scenario | Result |
|---|---|
| SCN-WF001-01 — current reconciled plan | PASS |
| SCN-WF001-02 — Replacement/Engineering reservations | PASS |
| SCN-WF001-03 — low current coverage recovered by plan | PASS |
| SCN-WF001-04 — raw-material attention | PASS |
| SCN-WF001-05 — Balancing × PyMAC mismatch | PASS |
| SCN-WF001-06 — current plan missing / previous-day plan | PASS |
| SCN-WF001-07 — active versus previous Schedule Version | PASS |
| SCN-WF001-08 — Lot 252 selected with detail open | PASS |

## Components and interactions

| Component | Taxonomy | Responsibility |
|---|---|---|
| `ProductionSchedulingPage` | Feature | Governed WF-001 composition and local Lot-detail state |
| `HourByHourSchedule` | Feature | Continuous custom HTML/CSS timeline, Lot selection and arrow-key navigation |
| `ScheduleSummary` | Feature | Commitment, Lot count, destinations and source/version |
| `DataFreshness` | Domain | Consolidated and source-level freshness disclosure |
| `ProductionOrderCorrelation` | Domain | Order-to-Lot reconciliation and mismatch disclosure |
| `BufferCoverageSummary` | Domain | Current/projected/target demonstrative coverage |
| `OperationalAttentionSummary` | Feature | Summarized raw-material attention |
| `LotDetail` | Domain | Accessible contextual detail and future handoff CTA |
| `Button`, `Badge` | Shared | Generic accessible interaction/presentation primitives |

Interactions include period and Destination selection, keyboard Lot navigation, Lot detail open/close (including Escape), freshness detail, stale and mismatch variants, version comparison, demonstrative scenario selection, preparation handoff acknowledgement and baseline reset.

## Invariants and calculations

- Production Order ≠ Lot: preserved.
- Work Center ≠ Resource: preserved; Resource is always “Ainda não atribuído”.
- Scheduled ≠ Dispatched ≠ Actual: preserved; only `SCHEDULED` is modeled.
- Produced ≠ Available: preserved; no Produced Quantity is invented.
- Reserved ≠ Available and Hold/Blocked ≠ Reserved: distinct buffer fields.
- Balancing remains schedule source; PyMAC remains order source.
- Projected available quantity uses `Available + scheduled production − future planned consumption`.
- Reserved quantities are explicitly not free availability for Assembly.

## Accessibility and responsiveness

- Each Lot accessible name includes Lot, Material, Quantity, Scheduled Start and Scheduled Finish.
- Arrow keys move focus between Lots; standard Tab navigation remains available.
- Lot detail receives initial focus, supports Escape, has an explicit close control and returns focus to the originating Lot when closed.
- `prefers-reduced-motion` is covered by browser test.
- axe: zero automatically detectable violations.
- Desktop is primary; the timeline uses controlled horizontal scrolling and detail becomes a bounded overlay on narrower viewports.
- Manual Product Owner validation of reading order and industrial-device ergonomics remains recommended.

## Visual fidelity

| Area | Assessment | Note |
|---|---|---|
| Layout | MATCH | Header, executive summary, controls, dominant timeline and contextual side detail follow the approved composition. |
| Hierarchy | MATCH | Business question, commitment and timeline dominate. |
| Spacing | ACCEPTABLE DEVIATION | Responsive CSS and browser font metrics produce minor differences. |
| Typography | ACCEPTABLE DEVIATION | System-font stack replaces the unavailable reference typeface. |
| Timeline | MATCH | Continuous, non-hour-aligned Lots and dominant scale are preserved. |
| Colors | ACCEPTABLE DEVIATION | Red was replaced by governed blue, magenta, green and amber semantics. |
| Panels | MATCH | Lot detail preserves timeline context on desktop and overlays on narrower screens. |
| Density | MATCH | Dense industrial information remains readable without a generic card dashboard. |

Visual baseline: `e2e/wf001-production-scheduling.spec.ts-snapshots/wf001-production-scheduling-chromium-darwin.png`.

## Dependencies

No dependencies were added. Timeline, detail and summarized coverage use the approved existing foundation and semantic HTML/CSS. Lucide, Radix and Recharts were not required.

## Quality gates

| Gate | Result | Checks | Errors | Warnings |
|---|---|---:|---:|---:|
| Typecheck | PASS | TypeScript strict | 0 | 0 |
| Build | PASS | Vite, 107 modules | 0 | 0 |
| Unit/component/integration | PASS | 6 files, 16 tests | 0 | 0 |
| E2E | PASS | 4 Chromium tests | 0 | Node color-env notice only |
| axe | PASS | Full initial page scan | 0 violations | 0 |
| Reduced motion | PASS | Chromium media preference | 0 | 0 |
| Visual screenshot | PASS | deterministic full-page baseline with Lot 252 detail | 0 | 0 |
| npm audit | PASS | installed dependency tree | 0 vulnerabilities | 0 |
| Lint | N/A | not configured in Sprint 0 | — | — |

## Automated audits

- `RED COLOR VIOLATIONS: 0`
- Domain imports of React/Zustand/Router: 0.
- Production feature imports of fixtures: 0.
- Shared UI MES semantics: 0.
- Backend, HTTP, API or external integration: none.
- Premature SFC, Release, lifecycle, Quality Disposition, Genealogy, OEE or Resource Assignment models: none.
- Real production data, credentials, APIs, payloads, productive schemas or event contracts: none.

## Limitations and deferred decisions

- The demo uses local simulated dates and quantities only.
- Schedule Version comparison is conceptual and demonstrative; it defines no external version mechanism.
- The preparation CTA records only a local handoff acknowledgement because WF-002 has no authorized route.
- SFC/Execution Control Unit, Release, execution lifecycle, Quality Disposition, reservation reallocation governance, detailed confirmation, genealogy, Resource Assignment, real services, backend, persistence, authentication and telemetry remain deferred.

## Acceptance gate

1. Answers “O que precisamos produzir?”: YES.
2. Sufficiently faithful to approved visual baseline: YES.
3. All mandatory scenarios work: YES.
4. All mandatory tests pass: YES.
5. Technical blocker: NO.
6. Architectural blocker: NO.
7. Functional blocker: NO.
8. Visual blocker: NO.
9. Documentation blocker: NO.
10. Ready for Product Owner/Chief Architect review: YES.

## Next-step recommendation

WF-001 was approved by the Product Owner and frozen on 2026-08-13. The official record is `docs/prototype/governance/WF-001-APPROVAL-RECORD.md`; the approved implementation baseline is `docs/prototype/assets/wireframes/production-scheduling/WF-001-PRODUCTION-SCHEDULING-IMPLEMENTATION-V1.0-APPROVED.png`.

The next authorizable activity is **WF-002 — Production Readiness conceptual design**, under the dominant question “Temos condições de produzir?”. No WF-002 or WF-003 implementation is authorized by this status change.

## Final integrated freeze — 2026-08-14

The Product Owner and Chief Architect approved and froze the integrated WF-001 experience, including contextual read-only Current Resource State and contextual read-only Material × Resource Eligibility in Lot Detail.

- Final integrated approved baseline: `docs/prototype/assets/wireframes/production-scheduling/WF-001-PRODUCTION-SCHEDULING-INTEGRATED-V1.0-APPROVED.png`.
- SHA-256: `33e3dea1e80c8207fee9350b14671b39cb26d572f7e9eddb6fac26a973b98b6c`.
- Approval record: `docs/prototype/governance/WF-001-APPROVAL-RECORD.md`.
- Current Resource State implementation report: `docs/prototype/implementation/WF-001-CURRENT-RESOURCE-STATE-IMPLEMENTATION-REPORT.md`.
- Eligibility implementation report: `docs/prototype/implementation/WF-001-MATERIAL-RESOURCE-ELIGIBILITY-IMPLEMENTATION-REPORT.md`.

The final baseline preserves Resource Assignment as not implemented and leaves WF-002/WF-003 outside implementation scope.
