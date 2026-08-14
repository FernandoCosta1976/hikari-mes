# DQ-WF001-002 — Current Resource State Read-Only Projection

**ID:** DQ-WF001-002-CURRENT-RESOURCE-STATE
**Status:** TBD — PROVISIONAL DEMO BOUNDARY APPROVED
**Date:** 2026-08-13
**Scope:** WF-001 read-only operational context; future Execution Management and Production Monitoring

## Context

WF-001 owns Production Scheduling and answers primarily **“O que precisamos produzir?”** from the Production Schedule supplied by Balancing. The Product Owner and Chief Architect conditionally approved WF-001 as a consumer of a compact, read-only projection that adds the contextual question **“O que está acontecendo agora na Fundição?”** for `DC01`–`DC05`.

This decision does not transfer Execution, Monitoring, Production Confirmation, Event Management, Resource Assignment, Dispatch or Release ownership to WF-001.

## Catalog Search Result

**NOT FOUND — TRACEABILITY SOURCE NOT AVAILABLE.**

A repository-wide search covered `docs/`, source, fixtures, reports, data/reference/catalog candidates and other non-generated project directories. The repository contains a Business Question Catalog and traceability matrices, but no structured canonical MES Function Catalog containing MES Function ID, Name, Priority, Capability, Theme, Discipline, MES Stage and Business Question.

No MES Function identifier, priority or classification may be inferred from the available documents. The missing catalog is a traceability gap, but does not block a deliberately demonstrative projection that stays inside this document's boundary.

## Confirmed Facts

- `DC01`, `DC02`, `DC03`, `DC04` and `DC05` are physical Resources in Fundição DC.
- Work Center and Resource remain distinct.
- Balancing owns the Production Schedule and Scheduled Sequence; it does not assign a specific DC Resource to a future Lot in the known scenario.
- PyMAC owns Production Orders; no document confirms it as source of Current Lot, execution state or machine state.
- Scheduled, Resource Assigned, Dispatched, Released, Active/Actual and Completed are distinct.
- UC-EXEC-001 requires active Lots, produced quantities, Dispatched Sequence, Actual Sequence and events, and supports understanding current execution.
- UC-EXEC-001 does not explicitly define a per-Resource machine-state view, Setup state, downtime state or a read-only summary embedded in WF-001.
- The exact Lot-to-execution-control-unit/SFC relationship remains TBD and must not be resolved by this projection.
- Produced Quantity and Available Quantity remain distinct.
- Current Resource State has independent source and freshness semantics from Balancing and PyMAC planning data.
- Demonstrative operational data must be identified as **Cenário demonstrativo** and isolated from official plant data.
- Red must not be used.

## Use-Case Coverage Decision

**Classification: SUFFICIENT WITH EXTENSION.**

UC-EXEC-001 authorizes consultation of active Lots and produced quantities as part of monitoring execution against plan. It supports current execution, deviations and commitment. It does not expressly state that Current Lot is consulted per Resource, does not govern current machine state, and does not establish the compact consumer projection required by WF-001.

The approved prototype projection may trace provisionally to UC-EXEC-001, but the use case requires a future governed extension before the projection can be treated as a production-domain contract. No use case is changed by this decision.

## Ownership Model

### Source owners

| Information | Recommended source owner | Governance status |
|---|---|---|
| Resource identity | Resource Management / Master Data | Conceptually supported; authoritative source TBD |
| Current execution and Current Lot reference | Execution Management | Capability supported; source and exact execution relation TBD |
| Produced Quantity | Production Confirmation | Conceptually supported; confirmation unit/source TBD |
| Operational event or downtime observation | Event Management | Conceptually supported; vocabulary/source TBD |
| Resource eligibility, future availability and Setup requirements | Resource Orchestration / Production Readiness | Not part of this projection |
| Efficiency, losses and OEE | Performance / OEE | Not part of this projection |

### Projection owner

**Production Monitoring** is the recommended owner of the consolidated read-only Current Resource State projection because Monitoring is responsible for WIP, events, adherence and deviations and can consume facts from Execution, Confirmation, Events and Resource master data.

This is an architectural prototype decision, not confirmation of a production system of record.

## Consumer × Owner Boundary

```text
Resource Master Data + Execution Management + Production Confirmation + Event Management
                                  ↓
             Production Monitoring — read-only projection
                                  ↓
                    WF-001 — contextual consumer
```

WF-001 may visualize, contextualize and indicate freshness. It may not start, stop, pause, resume, hold or complete execution; dispatch or release work; assign a Resource; alter machine state; register production; register an event or downtime; infer availability; or recommend a future Lot for a Resource.

## Field Classification

| Field | Status | Owner | Semantic risk | Prerequisite / rule |
|---|---|---|---|---|
| Resource ID | APPROVED FOR SUMMARY | Resource Management / Master Data | Low | Use only confirmed `DC01`–`DC05`. |
| Resource Name | APPROVED CONDITIONALLY | Resource Management / Master Data | Medium | Show only a governed name; do not invent aliases. |
| Current Lot | APPROVED CONDITIONALLY | Execution Management | High | Contextual factual observation only; source fixture must explicitly provide it; no Lot=SFC inference. |
| Current Material | APPROVED CONDITIONALLY | Execution Management / Production Monitoring | Medium | Show only when explicitly associated with the observed Current Lot. |
| Current Production Order | DEFERRED | Execution Management / Production Monitoring | Medium | Requires governed current-execution relation and adds little to the minimum summary. |
| Execution Status | DEFERRED | Execution Management | High | Exact lifecycle and source are not governed for implementation. |
| Actual Start | DEFERRED | Execution Management | Medium | Requires governed event semantics and source. |
| Produced Quantity | DEFERRED | Production Confirmation | High | Confirmation unit, timing and source remain TBD. |
| Target Quantity | DEFERRED | Execution Management / planning context | High | Must define whether target belongs to Lot, execution unit or Production Order. |
| Remaining Quantity | DEFERRED | Production Monitoring | High | Derived value; numerator, denominator and partial-confirmation rules are unresolved. |
| Machine State | DEFERRED | Execution Management / Shop-Floor source | High | Vocabulary and authoritative source are unknown. |
| Setup State | DEFERRED | Execution Management / Event Management | High | Must distinguish current activity from future Setup requirement. |
| Downtime State | DEFERRED | Event Management / Production Monitoring | High | Classification and source are unresolved. |
| Last Event | NOT APPROPRIATE FOR WF-001 | Event Management | High | Expands WF-001 into operational event monitoring. |
| Source | APPROVED FOR SUMMARY | Projection owner | Low | For prototype, explicitly identify the demonstrative projection; do not claim a real source. |
| Observed At | APPROVED FOR SUMMARY | Projection owner | Medium | Explicit fixture timestamp; no inferred observation time. |
| Received At | APPROVED FOR SUMMARY | Projection owner | Medium | Preserve separately from Observed At. |
| Freshness | APPROVED FOR SUMMARY | Projection owner | Medium | Explicit fixture state only; no elapsed-time/SLA inference. |

## Minimum Approved Projection

The minimum projection may contain only:

- Resource ID;
- safe prototype activity projection;
- Current Lot, when explicitly known;
- Current Material, when explicitly known;
- source identified as demonstrative;
- Observed At;
- Received At;
- explicit Freshness state.

Resource Name is optional and conditional on a governed value. Quantitative progress is excluded from the first projection.

## State Vocabulary

These labels are projection language for a demonstrative experience. They do not define the MES execution lifecycle or machine-state model.

| Candidate state | Status | Meaning in this projection | Can show in WF-001? |
|---|---|---|---|
| Produção atual conhecida | SAFE PROTOTYPE PROJECTION | The fixture explicitly observes current production context for the Resource. | Yes |
| Sem produção corrente conhecida | SAFE PROTOTYPE PROJECTION | No current production is known in the projection; it does not mean available or idle. | Yes |
| Setup em andamento | REQUIRES DOMAIN DECISION | Claims a specific operational activity whose source and semantics are not governed. | No, initially |
| Parada observada | REQUIRES DOMAIN DECISION | Claims a current condition/event without governed classification or source. | No, initially |
| Informação indisponível | SAFE PROTOTYPE PROJECTION | The projection cannot provide a trustworthy current observation. | Yes |
| Informação desatualizada | SAFE PROTOTYPE PROJECTION | The demonstrative fixture explicitly marks the observation as stale. | Yes |
| Informação parcial | SAFE PROTOTYPE PROJECTION | Some approved fields are known and others are unavailable. | Yes |
| Disponível | NOT RECOMMENDED | Would infer Readiness/availability from an observed operational condition. | No |

### Distinction of state concepts

- **Execution Status** describes the lifecycle of an execution entity.
- **Machine State** describes the current technical/operational condition of equipment.
- **Setup State** describes a current or required changeover/preparation context.
- **Downtime/Event State** describes an operational event or interruption and its classification.

WF-001 does not need all four. The provisional projection uses one neutral activity statement and explicit data-availability/freshness states. It does not expose governed lifecycle, machine, Setup or downtime status.

## Progress and Quantity Decision

**Classification: DEFERRED.**

- The numerator would need to come from Production Confirmation.
- Produced Quantity is confirmed actual output and is not Available Quantity.
- The denominator is not governed: it could be Lot quantity, execution-control-unit target or Production Order quantity.
- Production Order and Lot quantities are not interchangeable.
- Partial confirmation is architecturally relevant but unresolved.
- Remaining Quantity would be derived, while Produced Quantity should be factual.
- Therefore a representation such as `80 / 100 peças` is not safe in the first projection.

## Current Lot Decision

Current Lot may be shown conditionally as a **factual contextual observation** supplied explicitly by the demonstrative projection. It must not be modeled as the execution-control relation and must not assert that Lot equals SFC or another execution-control unit.

The label means only that the projection currently associates the observed production context with that Yamaha Lot. No Assignment, Dispatch, Release or lifecycle transition is performed by WF-001.

## Data Freshness Decision

Current Resource State must not reuse Balancing freshness. The demonstrative projection preserves:

- Source;
- Observed At;
- Received At;
- Freshness State.

The safe prototype strategy is:

- show explicit timestamps;
- identify the view as **Cenário demonstrativo**;
- mark stale only when the fixture explicitly declares it;
- never infer stale from elapsed minutes;
- define no refresh interval, countdown, next update or SLA;
- allow freshness to differ by Resource.

## Source-of-Truth Status

| Information | Status | Decision |
|---|---|---|
| Current Lot | UNKNOWN / TBD | No official source is confirmed. PyMAC must not be inferred. |
| Machine State | UNKNOWN / TBD | Shop-floor/automation is an architectural layer, but no authoritative source is confirmed. |
| Produced Quantity | UNKNOWN / TBD | Production Confirmation is the conceptual owner; definitive source remains unvalidated. |
| Execution Status | EXPECTED FUTURE SOURCE | Expected from future HIKARI Execution Management, subject to execution lifecycle and SFC decisions. |
| Resource identity | UNKNOWN / TBD | The five IDs are confirmed, but an authoritative master-data source is not. |

For the provisional prototype, the source is a clearly labeled demonstrative projection, not PyMAC, Balancing, automation or a claimed production MES.

## Special-State Handling

- **Current production known:** neutral state text, Current Lot/Material when known and timestamp.
- **No current production known:** explicit neutral text; never translate it to “Disponível”.
- **Information unavailable:** neutral/gray treatment, icon and text; omit unknown business fields.
- **Information stale:** amber/orange attention, icon, explicit text and timestamp; never red.
- **Partial information:** show known approved fields and state “Informação parcial”; use an em dash or “Não informado” for absent optional content rather than inventing values.

Color must never be the sole carrier of meaning.

## Proposed Compact Card Boundary

Conceptual examples only; values are placeholders and are not fixture authorization.

```text
AGORA NA FUNDIÇÃO
Estado observado · Cenário demonstrativo

DC01
Produção atual conhecida
Lote [referência conhecida]
Material [quando conhecido]
Observado às [hora] · Atual

DC02
Produção atual conhecida
Lote [referência conhecida]
Material [quando conhecido]
Observado às [hora] · Atual

DC03
Sem produção corrente conhecida
Observado às [hora] · Atual

DC04
Informação parcial
Lote [se conhecido]
Observado às [hora]

DC05
Informação desatualizada
Última observação [data e hora]
```

No card may show future Lots, assignment, commands, quantitative progress, availability, Setup, downtime, OEE, efficiency or losses under this provisional boundary.

## Schedule × Current UX Terminology

Use two short, spatially separated perspectives:

- **PLANO RECEBIDO** — `Previsto pelo Balancing`
- **AGORA NA FUNDIÇÃO** — `Estado observado · Cenário demonstrativo`

Supporting microcopy: **“A situação atual não representa atribuição dos Lotes planejados às máquinas.”**

The current-state section has no future timeline and must remain subordinate to the Plano Hora-Hora.

## WF-002 and WF-003 Boundary

- WF-002 remains Production Readiness and answers **“Temos condições de produzir?”** Current Resource State is context, not proof of eligibility or availability.
- WF-003 remains Resource Orchestration and answers **“Como vamos organizar os Lots nas máquinas?”** Current Resource State does not assign future Lots.
- Resource drill-down remains **DEFER TO LATER WF**.

## Traceability Gap Decision

**DOES NOT BLOCK PROTOTYPE IF GOVERNED AS DEMONSTRATIVE PROJECTION.**

The gap blocks claiming canonical MES Function traceability and blocks treating the projection as a production contract. It does not block a read-only, clearly demonstrative and narrowly governed contextual projection because the capability boundary, use-case relationship, approved fields, prohibited behavior and data classification are explicit here.

## Open Questions

1. Where is the canonical MES Function Catalog and which functions trace to this projection?
2. Should UC-EXEC-001 be extended to explicitly cover current execution by Resource and read-only consumers?
3. What is the authoritative source for Resource identity and name?
4. What is the authoritative source for Current Lot, Machine State, Produced Quantity and Execution Status?
5. What is the smallest execution-control unit, and how does it relate to Yamaha Lot/SFC?
6. What operational-state vocabulary is valid for Yamaha machines?
7. What distinguishes machine state, current Setup, downtime and execution lifecycle in Yamaha operations?
8. What is the governed Production Confirmation unit and when is a quantity official?
9. What target quantity would be paired with Produced Quantity, and how are partial confirmations handled?
10. What freshness SLA will apply to actual operational data?
11. May Production Order and Material be exposed in the operational projection under the confidentiality boundary?
12. Does a later Resource drill-down belong to Execution Monitoring rather than WF-001?

## WF-001 Reopening Decision

**READY TO REOPEN WF-001 WITH PROVISIONAL DEMO PROJECTION.**

This status authorizes an implementation decision, not implementation itself. Any later implementation authorization must remain inside the Minimum Approved Projection and must reopen the frozen WF-001 baseline through the applicable product/visual gate.

## Implementation Scope If Separately Authorized

Only the following could be implemented after explicit authorization:

- replace the static Resource landscape with five compact, read-only contextual cards;
- show confirmed Resource IDs `DC01`–`DC05`;
- show safe prototype activity/data-availability states defined here;
- show Current Lot and Material only when explicitly supplied as contextual demonstrative observations;
- show source, Observed At, Received At and explicit fixture-driven Freshness;
- label the section **Cenário demonstrativo**;
- separate `PLANO RECEBIDO` from `AGORA NA FUNDIÇÃO`;
- include microcopy that current state does not assign planned Lots;
- cover current, no-current-production-known, unavailable, stale and partial demo states;
- add proportionate component, accessibility, interaction and visual-regression tests;
- update the product/visual baseline only through a separately authorized review gate.

## Explicitly Prohibited

- Resource Assignment or future Lot-by-machine visualization;
- Dispatch, Release or execution commands;
- Start, Stop, Pause, Resume, Hold or Complete;
- production confirmation or event/downtime registration;
- inference of Resource availability or readiness;
- Setup, downtime or machine-state claims before governance;
- Produced, Target or Remaining Quantity in the initial projection;
- performance, losses or OEE;
- Resource drill-down in WF-001;
- real API, payload, event contract, backend or production integration;
- automatic stale calculation, polling interval or SLA;
- use of red;
- claiming demonstrative values as official plant data.

## Next Governance Action

Chief Architect and Product Owner may decide whether to authorize the narrowly bounded provisional demo implementation. In parallel, domain governance should locate/provide the canonical MES Function Catalog, extend or supersede UC-EXEC-001 as appropriate, validate operational sources and vocabulary, and resolve execution-control and quantity semantics before any production-grade model is designed.
