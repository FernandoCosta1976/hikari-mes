# WF-001 Current Resource State Implementation Report

**Status:** CANDIDATE_FOR_PRODUCT_REVIEW
**Date:** 2026-08-13
**Scope:** Controlled WF-001 reopening — provisional read-only demo projection

## Implementation Summary

WF-001 continues to own Production Scheduling and to answer **“O que precisamos produzir?”**. The approved change replaces the former compact physical Resource landscape with a secondary, read-only **“Agora na Fundição”** section that contextualizes the observed demonstrative state of `DC01`–`DC05`.

The Plano Hora-Hora remains the dominant object. The new section has no timeline, interaction, drill-down, command, future Lot assignment or readiness conclusion.

## Governance and Traceability

- Governance source: `../domain-questions/DQ-WF001-002-CURRENT-RESOURCE-STATE.md`.
- MES Function Catalog: **NOT AVAILABLE IN REPOSITORY**.
- Canonical MES Function IDs, priorities and capability IDs: not claimed.
- UC-EXEC-001: provisional traceability reference, classified **SUFFICIENT WITH EXTENSION**; the use case was not modified.
- Projection owner: **Production Monitoring — conceptual**.
- Consumer: **WF-001**.
- Contract: **READ ONLY**.

## Architecture and Data Flow

```text
demonstrative fixture
→ currentResourceStateAdapter
→ CurrentResourceStateProjection domain model
→ immutable ScenarioDefinition context / selector
→ FoundryResourceLandscape view
```

The domain model has no dependency on React, Zustand, components, CSS, routing or fixtures. The feature does not import a fixture. No API, backend, event contract or real integration was introduced.

The projection is stored inside the immutable loaded `ScenarioDefinition` because it is transversal context for the demonstrative journey and is expected to be consumed later by WF-002/WF-003. Zustand gained only a stable read selector; no mutable Current Resource State, action or transition was added.

## Projection Model

Model: `CurrentResourceStateProjection`.

Approved fields implemented:

- `resourceId`;
- `activityState`;
- optional `currentLotReference`;
- optional `currentMaterial`;
- `source`, fixed to the demonstrative monitoring projection;
- optional `observedAt`;
- optional `receivedAt`;
- explicit `freshness`.

Implemented safe projection states:

- `CURRENT_PRODUCTION_KNOWN` — Produção atual conhecida;
- `NO_CURRENT_PRODUCTION_KNOWN` — Sem produção corrente conhecida;
- `INFORMATION_UNAVAILABLE` — Informação indisponível;
- `INFORMATION_STALE` — Informação desatualizada;
- `INFORMATION_PARTIAL` — Informação parcial.

These values are explicitly projection/demo states and do not define a production MES lifecycle.

## Demonstrative Resource Cards

| Resource | Projection state | Current Lot shown? | Material shown? | Freshness | Notes |
|---|---|---:|---:|---|---|
| DC01 | Produção atual conhecida | Yes — 247 | Yes — Material A | CURRENT | Observed and received timestamps are separate. |
| DC02 | Produção atual conhecida | Yes — 248 | Yes — Material B | CURRENT | Observed and received timestamps are separate. |
| DC03 | Sem produção corrente conhecida | No | No | CURRENT | Does not claim availability. |
| DC04 | Informação parcial | Yes — 249 | No | PARTIAL | UI states “Não informado”; no Material is inferred. |
| DC05 | Informação desatualizada | No | No | STALE | Explicit fixture state; no elapsed-time calculation. |

All values are demonstrative and are not Yamaha production data.

## Prohibited Field Audit

| Field | Shown? |
|---|---:|
| Current Production Order | NO |
| Execution Status | NO |
| Actual Start | NO |
| Produced Quantity | NO |
| Target Quantity | NO |
| Remaining Quantity | NO |
| Machine State | NO |
| Setup State | NO |
| Downtime State | NO |
| Last Event | NO |

OEE, efficiency, losses, scrap, future availability and Resource Eligibility are also absent.

## Schedule × Current Separation

- **PLANO RECEBIDO:** `Plano recebido — Balancing`; future/planned continuous timeline at Work Center level.
- **AGORA NA FUNDIÇÃO:** `Estado observado · Cenário demonstrativo`; five compact present-context cards with a separate demonstrative source and timestamps.
- The sections use headings, temporal wording, source wording and spatial separation. Meaning does not depend on color.
- Mandatory microcopy is present: **“A situação atual não representa atribuição dos Lotes planejados às máquinas.”**

## Resource Assignment and Lot Detail Audit

- Future Lots assigned to `DC01`–`DC05`: **0**.
- Resource Assignment actions: **0**.
- Dispatch actions: **0**.
- Execution commands: **0**.
- Planned Lot detail still displays **“Recurso — Ainda não atribuído”**.
- Selecting planned Lot 252 does not change the Current Lot observations.
- The **Avaliar preparação** handoff remains present without adding Readiness answers.

## Data Freshness

Schedule freshness remains sourced separately from Balancing/PyMAC. Current-state freshness belongs to the demonstrative Current Resource State projection.

For every current-state record, the fixture may explicitly provide:

- `observedAt` — business observation time;
- `receivedAt` — separate projection receipt time;
- `freshness` — explicit fixture state.

No SLA, timer, countdown, next refresh, polling or automatic stale calculation exists.

## Accessibility and Responsiveness

- Semantic section heading and temporal description are present.
- Resources are exposed as an accessible list.
- Every card has a comprehensible accessible name.
- Received At is exposed to assistive technology separately from Observed At.
- Stale, partial and absent information use text and do not depend on color.
- Axe found zero automatically detectable violations.
- At 1440, 1280 and 1024 pixels, the section has no horizontal overflow.
- Browser measurements: 1280 viewport → `1214/1214` client/scroll width; 1024 viewport → `958/958`.

## Test and Build Results

| Gate | Result | Quantity | Errors | Warnings |
|---|---|---:|---:|---:|
| TypeScript typecheck | PASS | 1 command | 0 | 0 |
| Production build | PASS | 112 modules | 0 | 0 |
| Unit/component tests | PASS | 23 tests / 9 files | 0 | 0 |
| Playwright E2E | PASS | 5 tests | 0 | 0 functional |
| Axe accessibility | PASS | 1 complete scan | 0 violations | 0 |
| Responsive widths | PASS | 3 widths | 0 overflow | 0 |
| Visual regression candidate | PASS | 1 new candidate | 0 mismatch | 0 |
| `git diff --check` | PASS | 1 scan | 0 | 0 |
| Red-color scan | PASS | 1 source scan | 0 violations | 0 |

The Playwright runner emitted only an environment notice about `NO_COLOR`/`FORCE_COLOR`; it did not affect any gate.

No lint script exists in `package.json`, so no lint command was available.

## Red Scan

**RED COLOR VIOLATIONS: 0**

Stale attention uses amber treatment with explicit text. No state relies on color alone.

## Screenshot

Previous compact candidate:

`e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-RESOURCE-LANDSCAPE-COMPACT-CANDIDATE-chromium-darwin.png`

New, not-approved candidate:

`e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-CURRENT-RESOURCE-STATE-CANDIDATE-chromium-darwin.png`

All earlier baselines and candidates were preserved.

## Visual Comparison

| Aspect | Result | Observation |
|---|---|---|
| Timeline dominance | UNCHANGED | Plano Hora-Hora remains larger, earlier and visually dominant. |
| Resource context usefulness | IMPROVED | The five Resources now communicate a compact observed starting context. |
| Page height | REGRESSED | The richer secondary section adds moderate vertical height. |
| Information density | IMPROVED | Information is compact, aligned and scannable without becoming a table. |
| Schedule × Current distinction | IMPROVED | Explicit headings, source, temporal language and microcopy separate the perspectives. |
| Visual complexity | UNCHANGED | Five small cards replace five pills without adding interaction or another timeline. |
| Handoff clarity | UNCHANGED | “Avaliar preparação” remains the next governed decision. |

The moderate page-height increase is an accepted trade-off for contextual usefulness and does not displace the timeline from the dominant position.

## Architectural Audit

| Check | Result |
|---|---:|
| ADR-001 preserved? | YES |
| Domain React-independent? | YES |
| Fixture imported only through adapter? | YES |
| Zustand used only if justified? | YES |
| UI state local? | YES |
| No backend? | YES |
| No real integration? | YES |
| No Resource Assignment? | YES |
| No Dispatch? | YES |
| No Execution commands? | YES |
| No WF-002 implementation? | YES |
| No WF-003 implementation? | YES |
| No MES lifecycle invented? | YES |

## Open Questions

- Canonical MES Function Catalog location and function traceability.
- Formal UC-EXEC-001 extension.
- Authoritative sources for Resource identity, Current Lot, Machine State, Produced Quantity and Execution Status.
- Yamaha Lot × SFC/execution-control-unit relation.
- Governed machine, Setup and downtime vocabulary.
- Production Confirmation unit, target and partial-confirmation rules.
- Production Current Resource State freshness SLA.
- Future Resource drill-down ownership.

## Product Owner Review Items

The Product Owner should verify:

1. Plano Hora-Hora remains visually dominant.
2. “Plano recebido — Balancing” is unmistakably future/planned.
3. “Agora na Fundição” is unmistakably observed demonstrative context.
4. Five cards remain compact and understandable in seconds.
5. Current Lot references cannot be mistaken for future assignment.
6. “Sem produção corrente conhecida” does not imply availability.
7. Partial and stale states are understandable without red or color-only meaning.
8. The page-height increase is acceptable.
9. Lot 252 detail still says “Ainda não atribuído”.
10. The handoff to “Avaliar preparação” remains clear.

## Review URL

`http://127.0.0.1:4173/demo/fundicao-dc/production-scheduling`

## Recommended Decision

**CURRENT RESOURCE STATE READY FOR PRODUCT REVIEW**

## Final approval and freeze — 2026-08-14

The Product Owner and Chief Architect approved this read-only demonstrative projection as contextual WF-001 scope. The approved visual representation is included in:

`docs/prototype/assets/wireframes/production-scheduling/WF-001-PRODUCTION-SCHEDULING-INTEGRATED-V1.0-APPROVED.png`

Approved baseline SHA-256: `33e3dea1e80c8207fee9350b14671b39cb26d572f7e9eddb6fac26a973b98b6c`.

All deferred fields, open questions and owner/consumer boundaries in this report remain unchanged.
