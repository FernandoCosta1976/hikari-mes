# WF-001 — Final Integrated Approval Record

**ID:** WF-001
**Experience:** Production Scheduling / Programação da Produção / Plano Hora-Hora
**Status:** APPROVED / FROZEN
**Approval date:** 2026-08-14
**Approvers:** Product Owner / Chief Architect
**Dominant question:** “O que precisamos produzir?”
**Primary persona:** Foundry Supervisor
**Supporting personas:** Production Leader, PCP; Production Manager as contextual consumer

## Approved Visual Baselines

- Original design baseline: `../assets/wireframes/production-scheduling/WF-001-PRODUCTION-SCHEDULING-V1.0-APPROVED.png`
- Previous approved implementation baseline: `../assets/wireframes/production-scheduling/WF-001-PRODUCTION-SCHEDULING-IMPLEMENTATION-V1.0-APPROVED.png`
- Final integrated approved baseline: `../assets/wireframes/production-scheduling/WF-001-PRODUCTION-SCHEDULING-INTEGRATED-V1.0-APPROVED.png`
- Approved candidate source, preserved historically: `../../../e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-CURRENT-STATE-ELIGIBILITY-CANDIDATE-chromium-darwin.png`

**Approved integrated baseline SHA-256:** `33e3dea1e80c8207fee9350b14671b39cb26d572f7e9eddb6fac26a973b98b6c`

The approved baseline is byte-identical to its candidate source. All original, previous approved and candidate images remain preserved.

## Approved Experience

The final integrated WF-001 baseline includes:

- Production Schedule received from Balancing;
- Plano Hora-Hora;
- continuous time axis;
- duration-proportional Lots;
- Lot as the primary visual entity;
- Material and Quantity;
- Scheduled Start and Scheduled Finish;
- Work Center and Demand Destination;
- Production Order correlation with PyMAC;
- Balancing × PyMAC reconciliation;
- Schedule Version;
- change/revision visibility;
- Data Freshness;
- current and Projected Buffer Coverage;
- Operational Attention Summary;
- progressive disclosure/drill-down;
- contextual Lot Detail;
- contextual Current Resource State;
- physical Resources DC01–DC05;
- contextual Material × Resource Eligibility;
- Assigned Resource displayed as **Ainda não atribuído**;
- handoff CTA **Avaliar preparação**.

## Approved Perspective Separation

### Planned

- Question: **“O que precisamos produzir?”**
- Source: Balancing.
- Representation: Production Schedule and Plano Hora-Hora.

### Current

- Question: **“O que está acontecendo agora na Fundição?”**
- Representation: Agora na Fundição with DC01–DC05.
- Nature: Current Resource State, read-only demonstrative projection.

### Eligibility

- Question: **“Em quais máquinas este Material pode tecnicamente ser produzido?”**
- Representation: Máquinas elegíveis in Lot Detail.
- Nature: Material × Resource Eligibility, read-only `DEMO_SIMULATED` projection.

## Current Resource State Approval

- Status: APPROVED for contextual WF-001 consumption.
- Conceptual projection owner: Production Monitoring.
- Consumer: WF-001.
- Contract: READ ONLY / DEMO.

Approved projection fields:

- Resource ID;
- contextual Current Lot;
- contextual Current Material;
- demonstrative source;
- Observed At;
- Received At;
- Freshness;
- governed safe projection state.

Deferred:

- Execution Status;
- Actual Start;
- Produced, Target and Remaining Quantity;
- definitive Machine State;
- Setup State;
- Downtime State;
- Last Event.

UC-EXEC-001 remains a provisional traceability reference and requires later governance for a production contract.

## Material × Resource Eligibility Approval

- Canonical architectural concept: Resource Eligibility.
- UX: Máquinas elegíveis.
- Current projection: `Material → Eligible Resources`.
- Classification: `DEMO_SIMULATED`.
- Contract: READ ONLY.

The productive future-ready model remains:

```text
Material
→ Production Definition / Routing
→ Operation / Operation Activity
→ Eligible Resource / Resource Group
```

Approved demonstrative baseline — **NOT YAMAHA MASTER DATA**:

- Material A → DC01, DC03, DC05;
- Material B → DC02, DC03, DC05;
- Material C → DC01, DC04.

## Mandatory Domain Distinctions

- Eligibility ≠ Availability.
- Eligibility ≠ Readiness.
- Eligibility ≠ Resource Assignment.
- Current Resource State ≠ Resource Availability.
- Current Lot ≠ future Scheduled Lot Assignment.
- Scheduled ≠ Resource Assigned ≠ Dispatched ≠ Released ≠ Actual.
- Production Order ≠ Lot.
- Work Center ≠ Resource.
- Produced Quantity ≠ Available Quantity.
- Reserved Quantity ≠ Available Quantity.

## Explicitly Not Implemented

- Resource Availability;
- Production Readiness;
- Resource Assignment;
- Recommended Resource;
- Resource ranking;
- Dispatch;
- Release;
- Execution commands;
- OEE;
- WF-002;
- WF-003.

## Open Domain Questions

| Domain Question | Status | Freeze impact |
|---|---|---|
| DQ-WF001-001-PARALLEL-SCHEDULE | TBD | Non-blocking for approved demonstrative WF-001 baseline |
| DQ-WF001-002-CURRENT-RESOURCE-STATE | TBD — PROVISIONAL DEMO BOUNDARY APPROVED | Non-blocking for approved contextual projection |
| DQ-MRE-001-ELIGIBILITY-DEFINITION-BASIS | TBD — NON-BLOCKING FOR GOVERNED DEMO PROJECTION | Non-blocking for simplified demo projection |

No open question is resolved by this approval.

## Traceability Gap

**Canonical MES Function Catalog:** NOT AVAILABLE IN REPOSITORY.

WF-001 does not claim definitive MES Function IDs, priorities, capability IDs or production-grade function traceability. The gap does not block the approved demonstrative baseline.

## Handoff to WF-002

The next authorized design activity is **WF-002 — Production Readiness conceptual design**, under the dominant question:

> Temos condições de produzir?

WF-002 may consume Scheduled Lot, Current Resource State, Resource Eligibility, Material, Work Center and Schedule context. This approval does not authorize WF-002 implementation.

## Future Handoff to WF-003

WF-003 — Resource Orchestration remains future scope under:

> Como vamos organizar os Lots nas máquinas?

Its future input may include Scheduled Lots, Current Resource State, Resource Eligibility and Readiness Result. Its future output may include Resource Assignment and Operational Sequence. None is implemented by WF-001.

## Freeze Rule

Any change to the approved WF-001 functional semantics, hierarchy, interaction, demonstrative baseline data or visual composition requires an explicit Product Owner/Chief Architect decision and a reviewed replacement baseline. Defect corrections that change behavior, semantics or composition must return through the applicable governance gate.
