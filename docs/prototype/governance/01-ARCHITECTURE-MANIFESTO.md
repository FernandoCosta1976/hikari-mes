# HIKARI Prototype — Architecture Manifesto

## 1. Architectural intent

HIKARI is a **single corporate MES platform composed of specialized MES modules that can evolve independently while collaborating as one governed platform**.

The prototype MUST communicate modularity without exposing implementation infrastructure.

## 2. Architectural principles

### 2.1 Corporate platform over local applications

Capabilities created for one productive area should be evaluated for corporate reuse. The prototype must not imply that Foundry is receiving a bespoke standalone system.

### 2.2 Specialized modules over monolith

Each MES Discipline may materialize through specialized modules. Modularity must support independent evolution, reuse, and clear responsibility boundaries.

### 2.3 Event collaboration

Modules conceptually collaborate through the **Corporate Event Service**. The prototype may show that an execution change can inform Performance, Quality, Materials, or Analytics. It MUST NOT show contracts, payloads, broker topology, topics, queues, or implementation technology.

### 2.4 Events domain distinction

The MES **Events** discipline handles operational events, alarms, anomalies, occurrences, and related workflows. It is not the Corporate Event Service.

## 3. External planning context

The relevant planning chain is:

**Balancing → PyMAC/MRP → HIKARI MES → Production.**

Balancing provides long-, medium-, and short-term planning context and, for the short-term operational horizon, provides the production sequence used as the planning baseline.

PyMAC performs MRP-related planning and supplies Production Orders. It may consolidate daily requirements into larger Production Order quantities.

HIKARI must correlate the short-term schedule with Production Orders without destroying the lot-level sequence required by operations.

## 4. Short-term scheduling architecture

The first prototype journey uses this conceptual flow:

Balancing
→ Short-Term Production Schedule
→ HIKARI Production Scheduling
→ Production Readiness
→ Operational Rescheduling
→ Dispatching
→ Execution
→ Production Confirmation
→ Inventory/Buffer visibility
→ Adherence/Performance/OEE.

HIKARI receives the temporal schedule from Balancing. It does not normally recreate the original schedule.

## 5. Production Order and Lot relationship

PyMAC may produce a Production Order representing a consolidated daily quantity, for example 300 pieces.

Balancing may represent the operational requirement as multiple real Lots, for example 100 + 100 + 100, each with its own Lot identifier, sequence, quantity, Scheduled Start, and Scheduled Finish.

The prototype must preserve the distinction:

**Production Order ≠ Lot ≠ Resource assignment.**

A Production Order may be correlated with multiple Lots. Lots are real production identifiers in the Yamaha process and are not merely visual splits.

## 6. Work Center and Resource boundary

Balancing provides the planned production context at Foundry/line/Work Center level. It does not determine the specific production Resource.

The Resource assignment is a subsequent operational decision performed by the Foundry Supervisor together with the Production Leader.

Therefore:

**Scheduling defines the production requirement and baseline timing. Dispatching materializes that requirement on Resources.**

## 7. Baseline lineage

The prototype must preserve three conceptual states where applicable:

1. **Scheduled Sequence** — baseline received from planning/Balancing.
2. **Dispatched Sequence** — operational organization selected for execution and resource allocation.
3. **Actual Sequence** — what was actually executed.

Operational changes MUST NOT overwrite the planning baseline. This lineage is required for future adherence and deviation analysis.

## 8. Rescheduling authority

Foundry Supervisor and Production Leader have operational freedom to resequence Lots within the shift/day. The commitment is to meet required quantities by the relevant shift/day boundary while protecting downstream supply and buffer objectives.

Scheduled Start and Scheduled Finish from Balancing remain baseline planning information, not necessarily rigid execution windows for Foundry.

## 9. Decision-support architecture

Operational Rescheduling and Dispatching should eventually consider:

- Resource eligibility for a Material/part;
- Resource availability;
- installed mold/tooling;
- capacity;
- maintenance condition;
- preceding sequence;
- Setup impact;
- raw-material availability;
- Finished Goods Buffer status;
- projected buffer coverage;
- downstream consumption/capacity context.

The prototype MUST support human decision-making. It MUST NOT imply that an unvalidated optimization algorithm autonomously chooses the best sequence.

## 10. Buffer architecture

For the Foundry scenario, the Finished Goods Buffer is the stock of Foundry-finished and released parts that are actually available for consumption by Machining.

Produced Quantity and Available Quantity are distinct concepts. A produced piece only contributes to available buffer when it is actually available for downstream consumption.

The prototype must support conceptual visibility of:

- Produced Quantity;
- On-Hand Quantity;
- Reserved Quantity;
- Available Quantity;
- Current Buffer Coverage;
- Projected Buffer Coverage;
- Target Buffer Coverage.

## 11. Demand destination

Balancing provides the destination/use classification of the production requirement. At minimum, the prototype distinguishes:

- Final Assembly / production-chain demand;
- Replacement/Spare demand;
- Engineering demand.

Final Assembly demand has operational priority when continuity of production is at risk.

Replacement and Engineering quantities may physically reside in the same buffer but must remain logically segregated/reserved.

A logical reservation exists from planning; the physical/effective reservation is materialized when produced pieces become available in the buffer.

Reserved quantities may exceptionally be reallocated to protect Final Assembly continuity. Approval workflow and authority are TBD and must not be invented.

## 12. Material availability

HIKARI should provide visibility of raw-material volume required to work the schedule and alert on potential shortage risk. The prototype is not an MRP implementation; it presents decision-support information relevant to execution readiness.

## 13. Downstream context

HIKARI should evolve to provide quantitative projected capacity/consumption of downstream areas. For the Foundry prototype this may be simulated as demonstrative context. Future HIKARI expansion across areas will make end-to-end flow visibility increasingly native.

Real-time downstream operational condition is explicitly future evolution and is not required for Wireframe V0.1.

## 14. Inventory system-of-record status

Production confirmation updates PyMAC, and corporate inventory/WMS should theoretically reflect the official position. The definitive production System of Record for each inventory fact is not yet validated. The prototype MUST NOT assert an unconfirmed system-of-record decision.

## 15. Data freshness architecture

Production Schedule and Production Orders must carry freshness metadata. Balancing and PyMAC must be monitored separately for last update date/time and expected-update status.

The prototype must never silently present stale information as current.

## 16. Non-goals

The prototype architecture does not define physical database design, APIs, endpoints, schemas, event contracts, infrastructure, authentication, authorization architecture, observability, CI/CD, broker technology, or production persistence.
