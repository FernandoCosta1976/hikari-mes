# WF-002 — Traceability and Conceptual Gate

**Status:** CONCEPTUAL DESIGN APPROVED

## Business Question Traceability

| Experience element | Governed question | Traceability |
|---|---|---|
| Dominant Readiness assessment | Temos condições de produzir? / Temos condições de cumprir o plano? | BQ-003; UC-PROD-003 |
| Material condition | Temos matéria-prima suficiente? | BQ-006; UC-MAT-001 |
| Buffer urgency context | Temos peças suficientes para proteger a cadeia? | BQ-007; contextual UC-BUF-001 |
| Resource Eligibility | Quais máquinas podem tecnicamente produzir este Material? | UC-PROD-003; Material × Resource Eligibility domain foundation |
| Resource condition comparison | Existe caminho viável para o Lot no contexto necessário? | UC-PROD-003 conceptual extension |
| Future handoff | Como vamos organizar os Lots nas máquinas? | WF-003; UC-PROD-004/005 boundaries |

## Persona Traceability

| Persona | WF-002 responsibility | Governed source |
|---|---|---|
| Foundry Supervisor | Primary assessment of commitment feasibility and constraints | PERSONA-003; UC-PROD-003 |
| Production Leader | Shared operational evidence and intervention context | PERSONA-002; UC-PROD-003 supporting actor |
| Technician | Contextual specialist when a technical restriction requires interpretation | PERSONA-004; UC-PROD-003 supporting actor |
| Quality | Context only when a governed readiness condition requires it | PERSONA-006; UC-PROD-003 supporting actor |

No approval authority is inferred.

## UC-PROD-003 Gap Analysis

**Overall classification: PARTIALLY ALIGNED.**

### Fully aligned elements

- selected scheduled commitment as trigger;
- Resource Eligibility, Availability, tooling, Setup, capacity and maintenance;
- raw-material, Buffer and downstream context;
- constraint/risk visibility;
- explainability before proceeding;
- decision support without automatic optimal planning.

### Conceptual extensions not explicit in UC-PROD-003

- readiness assessed at the Scheduled Lot time, not only now;
- distinction between Current Resource State and Resource Availability;
- explicit `Lot × Resource` evidence plus Lot-level summary;
- Current Condition versus Required Condition;
- Material Availability versus Material Staging;
- per-dimension source/freshness;
- explicit unknown/not-evaluated handling;
- structured output to WF-003 without selection.

### Gaps requiring later governance

- productive Readiness derivation and mandatory dimensions;
- normative result vocabulary;
- authoritative sources;
- acknowledgement/override authority, if required;
- reassessment/version behavior.

The conceptual extensions clarify the experience and do not modify UC-PROD-003. A later use-case revision may incorporate them through governance.

## WF-002 × UC-PROD-005 Boundary

WF-002 ends when users understand:

- which Resources are structurally eligible;
- which eligible Resources have sufficient assessment evidence to remain candidates;
- which constraints, attentions or unknowns apply;
- the provisional Lot Readiness result and its reasons.

UC-PROD-005 begins when users:

- compare candidates for operational choice;
- select a specific Resource;
- confirm demonstrative Resource Assignment;
- update Dispatched Sequence/context.

WF-002 may pass candidate evidence but may not select, recommend, rank, assign or dispatch.

## Architecture Traceability

| Concept | Source |
|---|---|
| Resource Eligibility first filter | `domain/MATERIAL-RESOURCE-ELIGIBILITY.md`; Architecture Reinforcement 03 |
| Routing/Operation future model | Architecture Reinforcement 01 |
| Production Tool and Setup | Architecture Reinforcement 04 |
| Material Staging / Floor Stock | Architecture Reinforcement 05 |
| Scheduling/Readiness/Dispatch separation | Architecture Reinforcement 06 and 11 |
| Current Resource State projection | DQ-WF001-002 |
| Schedule Version | Architecture Reinforcement 09 |
| Frontend boundaries for a future implementation | ADR-001 |

## Traceability Gap

The Standard MES Function Catalog is not available in the repository. No MES Function ID, priority, capability ID or production contract is invented.

This blocks definitive function-level traceability and productive model claims. It does not block Product Owner review of this conceptual experience because business questions, personas, use cases, domain foundations and capability boundaries are traceable.

## Proposed Wireframe Structure

```text
HEADER / CONTEXT
Área · Cenário · Data · Schedule Version · Freshness

SELECTED LOT
Lot · Material · Quantidade · Início/Término Previsto
Work Center · Destination · Production Order

READINESS SUMMARY
Provisional result · dominant reasons · missing/stale evidence

RESOURCE ELIGIBILITY
Eligible Resources · concise ineligible explanation

CONSTRAINT-FIRST RESOURCE CARDS
Current condition × required condition
Availability · Tool · Setup · Maintenance · Material/Staging · Capacity

OPTIONAL COMPACT COMPARISON
Only for eligible Resources; no ranking

RESTRICTIONS / ATTENTIONS
Reasons · affected context · time · source/freshness

HANDOFF
Return to Plano Hora-Hora
Future: Continue to organization, without Resource Assignment
```

## Conceptual Gate Result

**Recommended next action: A — READY TO CREATE WF-002 WIREFRAME**, after Product Owner review of this conceptual package.

This recommendation authorizes neither an image nor implementation by itself. A separate explicit instruction is required.
