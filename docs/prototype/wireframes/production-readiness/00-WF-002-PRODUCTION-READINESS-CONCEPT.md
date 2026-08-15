# WF-002 — Production Readiness Concept

**Status:** CONCEPTUAL DESIGN APPROVED
**Scope:** Documentation only
**Dominant question:** **Temos condições de produzir?**

## Purpose

WF-002 supports the Foundry Supervisor and Production Leader in understanding whether a Scheduled Lot has a viable path to production in its relevant scheduled time context and why that path is viable, constrained or still unknown.

The experience consumes the Production Scheduling baseline without modifying it. It prepares governed decision context for later Resource Orchestration; it does not select a Resource or organize a Dispatched Sequence.

The governed functional model and UC-PROD-003 use the broader wording **“Temos condições de cumprir o plano?”**. This concept uses the approved WF-002 experience question **“Temos condições de produzir?”** while preserving the commitment-level intent of UC-PROD-003. This wording choice does not amend the use case.

## Primary Actors

### Foundry Supervisor

- leads the assessment of the Scheduled Lot against production commitment, constraints, buffer and downstream context;
- determines whether the evidence is sufficient to continue toward operational organization;
- identifies conditions requiring cross-functional attention.

### Production Leader

- contributes current shop-floor context, practical preparation constraints and intervention needs;
- validates that displayed conditions reflect the operational situation known for the shift;
- shares the assessment context used in the next operational step.

UC-PROD-003 retains the Foundry Supervisor as Primary Actor and the Production Leader as Supporting Actor. The experience supports collaborative consultation, but no approval, sign-off, voting or conflict-resolution workflow is invented. If the actors disagree, the interface must preserve the evidence and uncertainty rather than manufacture a final confirmation.

## Responsibility

WF-002 is responsible for:

- receiving a selected Scheduled Lot and its planning context;
- applying Resource Eligibility as the first structural filter;
- comparing relevant readiness conditions for eligible Resources;
- distinguishing current observation from the condition required at the scheduled time;
- explaining constraints, attention items and missing information;
- presenting a Lot-level assessment together with its Resource-level evidence;
- preserving source and Data Freshness context;
- handing assessment context to WF-003 without Resource Assignment.

## Boundary

WF-002 does not answer:

- which Resource should be selected;
- how Lots should be sequenced across Resources;
- whether work may be Dispatched, Released or started;
- what actually happened in Execution;
- whether operation was efficient;
- OEE, losses or performance.

It must not provide Resource selection, ranking, automatic recommendation, drag-and-drop, assignment persistence, Dispatch, Release or execution commands.

## Inputs from WF-001

- Scheduled Lot;
- Material;
- Scheduled Quantity;
- Scheduled Start and Scheduled Finish;
- Work Center;
- Demand Destination;
- Production Order correlation;
- Schedule Version;
- schedule and source Data Freshness;
- Current Resource State;
- Resource Eligibility;
- Buffer Context;
- Operational Attention.

These are inherited facts or contextual projections. WF-002 must not reinterpret Current Resource State as Resource Availability or change the Scheduled Sequence.

## Experience Design Priority

The following labels prioritize information inside WF-002 only. They are **not Canonical MES Function Priorities**. The canonical MES Function Catalog is unavailable, so this package makes no official `CORE`, `ESSENTIAL` or equivalent catalog claim.

## Readiness Dimensions

| Dimension | Role in WF-002 | Initial design classification |
|---|---|---|
| Resource Eligibility | Structural filter | PRIMARY FOR WF-002 |
| Resource Availability | Time-relevant operational condition | PRIMARY FOR WF-002; definition/source TBD |
| Production Tool | Required-versus-current compatibility and condition | PRIMARY FOR WF-002; fixture basis TBD |
| Setup / Changeover | Preparation difference and qualitative impact | PRIMARY FOR WF-002 |
| Maintenance | Restriction evidence | PRIMARY FOR WF-002; vocabulary/source TBD |
| Material Availability | Sufficiency for the Scheduled Lot | PRIMARY FOR WF-002 |
| Material Staging | Preparation at the relevant production context | PRIMARY FOR WF-002 |
| Capacity | Minimum constraint context, not APS | SECONDARY FOR WF-002 when evidence exists |
| Buffer Context | Urgency/business-priority context | CONTEXTUAL, not readiness by itself |
| Downstream Context | Future quantitative flow context | LATER unless governed data exists |
| Other Restriction | Explicit governed observation | EXTENSIBLE, no generic invented enum |

## Readiness Principle

Readiness is a composed, explainable assessment. Resource Availability is one dimension only. An eligible Resource can remain constrained by tool, Setup, maintenance, material, staging, capacity or missing information.

No score, percentage or arbitrary weighted formula is authorized. A result must be supported by dimension-level evidence and reasons.

## Recommended Granularity

**Both:**

1. `Lot × Resource` contains the evidence for each structurally eligible Resource.
2. `Lot` provides a concise consolidated assessment based on whether a credible production path is evidenced.

The Lot summary must never hide disagreement between Resources or convert unknown data into a positive/negative conclusion. The exact productive derivation rule remains TBD.

## Result to WF-003

Conceptual output: **Lot Readiness Assessment** containing:

- Scheduled Lot identity and schedule context;
- structurally Eligible Resources;
- assessed candidate Resources, without ranking or selection;
- condition observations by Resource;
- provisional readiness presentation result;
- explicit reasons, constraints and missing information;
- assessment time context;
- source/freshness context.

It excludes Selected Resource, Resource Assignment, Dispatched Sequence, Dispatch and Release.

## Decision

The conceptual boundary is sufficiently defined for Product Owner review and a later wireframe step. Productive semantics and demonstrative values remain governed separately.
