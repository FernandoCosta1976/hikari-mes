# HIKARI Prototype — Use Case Manifesto

## 1. Purpose

Use cases connect personas, business questions, domain information, decisions, and interactions. They are defined by operational goals, not by screens.

## 2. Required use-case structure

Every use case must include:

- ID
- Name
- Primary Actor
- Supporting Actors
- Business Question
- Trigger
- Preconditions
- Inputs
- Main Flow
- Alternate/Exception Flow
- Decision Supported
- Expected Outcome
- Data Freshness Requirement
- Prototype Scope
- Deferred Production Concerns

## 3. UC-PROD-001 — Review Short-Term Production Schedule

**Primary Actor:** Foundry Supervisor  
**Supporting Actors:** Production Leader, PCP  
**Business Question:** What do we need to produce?  
**Trigger:** User enters the production-programming experience or a new schedule is received.  
**Preconditions:** Productive Area selected; demonstrative Balancing and PyMAC data available.  
**Inputs:** Short-Term Production Schedule, Lots, quantities, Scheduled Start/Finish, demand destination, Production Orders, last-update metadata.  
**Main Flow:** User sees the Plano Hora-Hora as a continuous timeline; understands Lot sequence and quantities; sees Production Order correlation; verifies data freshness; identifies missing or divergent information.  
**Exception:** Current-day schedule has not arrived; UI explicitly shows the last available schedule and warning.  
**Decision Supported:** Understand the production commitment before organizing execution.  
**Outcome:** Supervisor/Leader know what must be produced in the relevant day/shift.  
**Prototype Scope:** Fully represented.  
**Deferred:** Real integrations and production persistence.

## 4. UC-PROD-002 — Reconcile Production Orders and Scheduled Lots

**Primary Actor:** Supervisor / PCP  
**Business Question:** Does the schedule correspond to the formal production requirement?  
**Inputs:** PyMAC Production Order quantity and Balancing Lots/quantities.  
**Main Flow:** HIKARI shows consolidated Production Order and associated Lots; totals are compared; differences are explicit.  
**Exception:** PO=300 while scheduled Lots total 280; UI identifies 20 units not reconciled.  
**Decision Supported:** Determine whether the operational schedule is trustworthy enough to proceed.  
**Outcome:** Reconciliation status understood without collapsing PO and Lot.

## 5. UC-PROD-003 — Validate Production Readiness

**Primary Actor:** Foundry Supervisor  
**Supporting Actors:** Production Leader, Technician  
**Business Question:** Do we have the conditions to produce the plan?  
**Inputs:** Material Availability, eligible Resources, availability, mold/tooling, maintenance condition, capacity context, Setup context, buffer coverage, downstream projection.  
**Main Flow:** User reviews constraints and risks before dispatching Lots.  
**Decision Supported:** Determine whether the plan is executable and where intervention is needed.  
**Outcome:** Risks are visible before execution.  
**Prototype Scope:** Simulated decision-support indicators.  
**Deferred:** Full capacity engine, real maintenance integration, MRP calculation.

## 6. UC-PROD-004 — Operationally Resequence Lots

**Primary Actor:** Foundry Supervisor  
**Supporting Actor:** Production Leader  
**Business Question:** Is this the best operational sequence?  
**Trigger:** Supervisor identifies opportunity/constraint affecting execution.  
**Inputs:** Scheduled Sequence, Setup, Resource eligibility/availability, raw material, buffer projection, daily/shift commitment.  
**Main Flow:** User compares planning baseline with proposed operational sequence; changes sequence while preserving baseline; sees relevant impact context.  
**Decision Supported:** Organize execution to improve flow/Setup while protecting commitments.  
**Outcome:** Dispatched Sequence differs from Scheduled Sequence only through explicit action.  
**Constraint:** Prototype must not claim autonomous optimization.

## 7. UC-PROD-005 — Assign Lot to Resource

**Primary Actor:** Foundry Supervisor  
**Supporting Actor:** Production Leader  
**Business Question:** Where should this Lot be produced?  
**Inputs:** Lot, Material, Work Center, eligible Resources, availability, mold/tooling, capacity, maintenance, Setup.  
**Main Flow:** Ineligible Resources are not treated as equivalent options; user evaluates eligible alternatives and assigns the Lot.  
**Outcome:** Lot is operationally dispatched to a Resource.  
**Deferred:** Production-grade eligibility engine.

## 8. UC-BUF-001 — Assess Current Buffer Coverage

**Primary Actor:** Foundry Supervisor  
**Supporting Actors:** Production Manager, PCP  
**Business Question:** How protected is the downstream flow right now?  
**Inputs:** Available Quantity by Material, future Balancing demand, reservation destination.  
**Main Flow:** User sees Assembly coverage and reserved quantities for Replacement/Engineering separately.  
**Outcome:** Current coverage risk understood.  
**Rule:** Physical stock must not be equated with Assembly-available stock.

## 9. UC-BUF-002 — Assess Projected Buffer Coverage

**Primary Actor:** Foundry Supervisor  
**Supporting Actors:** Production Manager, Director  
**Business Question:** If we execute this plan, will the buffer remain protected?  
**Inputs:** Current Available Quantity + applicable scheduled production − future consumption from Balancing.  
**Main Flow:** User sees current versus projected coverage and the target reference.  
**Outcome:** Production decisions become predictive rather than purely reactive.  
**Hypothesis:** Target coverage granularity remains to be validated.

## 10. UC-BUF-003 — Review Reserved Demand

**Primary Actor:** Supervisor / Planning  
**Business Question:** How much of the physical buffer is committed to Assembly, Replacement, and Engineering?  
**Inputs:** On-Hand Quantity, Reserved Quantity, demand destination.  
**Outcome:** User understands what is physically present versus freely available.

## 11. UC-BUF-004 — Reallocate Reserved Quantity

**Primary Actor:** TBD cross-area authority  
**Business Question:** Can reserved stock be redirected to prevent Final Assembly stoppage?  
**Trigger:** Assembly continuity is at risk.  
**Rule:** Reallocation is permitted conceptually and must be traceable.  
**Prototype Scope:** May show the existence of the possibility but MUST NOT implement an invented approval workflow.  
**Status:** Workflow/authorization TBD.

## 12. UC-MAT-001 — Assess Raw-Material Availability

**Primary Actor:** Foundry Supervisor  
**Supporting Actor:** Production Leader  
**Business Question:** Do we have enough raw material to work the plan?  
**Inputs:** Raw-material volume/availability and planned production context.  
**Outcome:** Potential shortage risk is visible before it affects production.  
**Deferred:** Full MRP logic.

## 13. UC-FLOW-001 — Assess Downstream Consumption Projection

**Primary Actor:** Foundry Supervisor  
**Supporting Actor:** Production Manager  
**Business Question:** Can the next area consume what we intend to produce?  
**Inputs:** Demonstrative projected Machining capacity/consumption.  
**Outcome:** Supervisor can avoid blindly overproducing or underprotecting the buffer.  
**Prototype Scope:** Simulated.  
**Future:** Native HIKARI data as downstream areas are incorporated.

## 14. UC-EXEC-001 — Monitor Execution Against Plan

**Primary Actor:** Production Leader  
**Supporting Actors:** Supervisor, Manager  
**Business Question:** Are we fulfilling the plan?  
**Inputs:** Scheduled/Dispatched/Actual sequence, planned and actual quantities/times.  
**Outcome:** Deviations become visible and explainable.

## 15. UC-PERF-001 — Assess Operational Efficiency

**Primary Actor:** Industrial Director / Production Manager  
**Business Question:** Are we efficient?  
**Inputs:** Reliable execution, availability, performance, quality and loss information.  
**Outcome:** Operational efficiency is visible without exposing technical implementation.

## 16. UC-PERF-002 — Quantify Production Losses

**Primary Actor:** Production Manager  
**Supporting Actors:** Supervisor, Engineer  
**Business Question:** How much did we lose?  
**Inputs:** Downtime, scrap, rework, speed/performance loss as available in the scenario.  
**Outcome:** Loss magnitude and context are visible.

## 17. UC-QUAL-001 — Assess Production Quality

**Primary Actor:** Quality  
**Supporting Actors:** Supervisor, Manager  
**Business Question:** Has production quality deteriorated?  
**Inputs:** Good quantity, scrap, rework, blocked/not-available quantity.  
**Outcome:** Quality impact on available production and OEE can be understood.

## 18. UC-PERF-003 — Identify Bottleneck

**Primary Actor:** Production Manager  
**Supporting Actors:** Engineer, Supervisor  
**Business Question:** Where is the bottleneck?  
**Inputs:** Execution flow, capacity/constraint indicators, WIP and deviations.  
**Outcome:** Management attention can be directed to the limiting point.

## 19. UC-OEE-001 — Understand OEE Composition

**Primary Actor:** Director / Manager  
**Business Question:** What is our OEE and what is driving it?  
**Inputs:** Availability, Performance, Quality.  
**Outcome:** User sees OEE as a consequence of operational data captured throughout the process, not as an isolated metric.

## 20. UC-DATA-001 — Verify Data Freshness

**Primary Actor:** Any decision-making persona  
**Business Question:** Am I making this decision with current information?  
**Inputs:** Source, last-update date/time, expected-update status.  
**Main Flow:** Main UI shows consolidated freshness; detail reveals Balancing and PyMAC separately.  
**Exception:** Today's expected plan/order update has not arrived; previous information is clearly identified as stale/last available.  
**Outcome:** Stale information is never mistaken for current information.

## 21. Use-case-to-screen rule

A screen may serve multiple use cases only when they share a coherent decision moment. Codex MUST NOT merge unrelated use cases merely to reduce screen count.
