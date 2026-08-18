# WF-002 — Readiness Model

**Status:** CONCEPTUAL / NON-NORMATIVE RESULT VOCABULARY

## Model Boundary

This document defines an experience model, not a production lifecycle, persistence schema, API, event contract or authoritative decision engine.

## Structural Filter: Resource Eligibility

Resource Eligibility is evaluated first:

```text
Scheduled Lot + Material + applicable production-definition context
→ Eligible Resources
→ readiness-condition assessment
```

The current demo projection is simplified `Material → Eligible Resources`. The productive definition basis remains DQ-MRE-001 and may depend on Routing, Operation/Operation Activity, production version/recipe or Production Tool.

`Eligible ≠ Available ≠ Ready ≠ Selected`.

## Resource Availability

Conceptual definition for WF-002:

> Resource Availability is evidence that an Eligible Resource can receive the Scheduled Lot in the relevant scheduled time context, considering governed operational commitments and constraints.

It is time-indexed and cannot be derived solely from Current Resource State. A Resource with no known current production is not automatically available. Future availability may depend on:

- current occupation and expected completion;
- existing operational commitments;
- maintenance restrictions;
- required Setup/Changeover;
- Production Tool location/condition;
- other governed constraints.

Authoritative source, calculation rule, forecast confidence and vocabulary remain TBD.

## Production Tool

### Structural master/production-definition information

- tool required by Material/Operation;
- Resource/tool compatibility;
- applicable production-definition relationship.

### Current condition information

- tool location;
- tool installed on Resource;
- usability/condition;
- observed/received time and freshness.

WF-002 compares required versus current context. It does not manage tools or invent real identifiers.

## Setup / Changeover

The confirmed objective is to reduce unnecessary mold/tooling changes by grouping similar production. WF-002 exposes:

- current configuration when governed;
- required configuration;
- whether a change is required;
- qualitative potential impact;
- uncertainty or missing evidence.

It does not calculate an optimal sequence, assign a Resource or invent Setup durations/matrices. Optimization and operational organization belong to WF-003 or APS as governed.

## Maintenance and Technical Restrictions

The experience must distinguish explicit restriction evidence from missing information. Conceptual presentations may describe:

- restriction known;
- maintenance affecting the relevant interval;
- technically unavailable in the relevant interval;
- temporary restriction;
- information unavailable.

These are explanatory categories, not a normative productive enum. Exact vocabulary and sources require domain governance.

## Material Availability and Staging

Required distinctions:

- On-Hand: physical quantity in the relevant inventory context;
- Available: usable quantity after applicable restrictions/reservations;
- Reserved: quantity committed to a destination;
- Staged / Floor Stock: prepared at the shop-floor/execution context;
- Consumed: actual execution consumption, outside WF-002 decision preparation.

Experience-design classification only — not Standard MES Function Priority:

- **Material Availability: PRIMARY FOR WF-002**;
- **Material Staging: PRIMARY FOR WF-002**;
- detailed Floor Stock and material movement management: **LATER**;
- authoritative source and exact sufficiency/conversion rule: **TBD**.

WF-002 must not reproduce MRP or WMS and must not equate stock existence with production-point readiness.

## Capacity

Minimum WF-002 role: disclose a known capacity constraint relevant to the Scheduled Quantity and interval. The first conceptual view does not calculate finite capacity, optimize quantity × time or become APS.

Detailed rates, formulas, resource calendars and downstream-capacity models remain TBD. Downstream context is shown only when governed quantitative information exists; otherwise it remains absent, not invented.

## Current Resource State

Current Resource State is an observed read-only input. It can explain what is known now, but it is neither Resource Availability nor a future assignment.

The assessment must preserve:

- observation/source classification;
- Observed At;
- Received At;
- Freshness;
- unknown/partial/stale conditions.

## Time Context

Readiness must state its evaluation reference:

- current observation time;
- Scheduled Start/Scheduled Finish window;
- assessment time;
- known validity/effectivity when governed.

The central comparison is not merely “está disponível agora?”, but “há evidência de condições no contexto temporal necessário para este Lot?”.

## Granularity Comparison

| Model | Domain correctness | UX | WF-003 handoff | Complexity |
|---|---|---|---|---|
| Lot only | Hides Resource-specific conditions | Simple but opaque | Weak | Low |
| Lot × Resource only | Preserves evidence | Can overload quick decisions | Strong | Medium–High |
| Both | Preserves evidence and executive summary | Supports progressive disclosure | Strongest | Medium–High |

**Recommendation: BOTH.** A Lot result summarizes, while Lot × Resource assessments provide evidence. No Resource is selected.

## Provisional Result Model

Candidate UX concepts, not normative lifecycle states:

| Presentation concept | Meaning |
|---|---|
| Condições atendidas | Evidence supports at least one viable path under approved rules. |
| Atenção | A viable path may exist, but a condition requires awareness/intervention. |
| Condição impeditiva | Known evidence prevents a path under the evaluated context. |
| Informação insuficiente | Evidence is missing, stale or not evaluated; no positive/negative inference. |

“Blocked” is avoided as an initial UI term because it may be confused with Hold/Blocked lifecycle or inventory semantics. “Não avaliado” may be used at dimension level. Product Owner/domain approval is required before these labels are frozen.

## Conceptual Derivation

1. Filter by governed Resource Eligibility.
2. Evaluate applicable dimensions for each Eligible Resource.
3. Preserve unknown/stale/not-evaluated evidence explicitly.
4. Produce reasons before a summarized presentation result.
5. Consolidate at Lot level without score, weighting or hidden ranking.

The productive aggregation and gating rules remain TBD. A demo fixture may use an explicitly documented scenario rule only after separate authorization.

## Buffer and Destination

Buffer Context and Demand Destination influence urgency, prioritization and business consequence. They do not automatically change technical Readiness. Any future rule connecting destination to a readiness condition requires explicit governance.

## Freshness Model

Recommended model combines consolidated comprehension with dimension-level evidence:

- Level 1: compact assessment freshness and explicit warning when evidence is problematic;
- Level 2: freshness shown beside affected dimensions/Resources;
- Level 3: source, Observed At, Received At and state for every contributing dimension.

Different sources must retain independent timestamps. Consolidation must not conceal stale or unavailable evidence. No automatic-update frequency, next-update claim or SLA is invented.
