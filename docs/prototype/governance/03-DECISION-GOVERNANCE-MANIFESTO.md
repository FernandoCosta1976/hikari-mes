# HIKARI Prototype — Decision Governance Manifesto

## 1. Purpose

This document prevents assumptions, hypotheses, prototype conveniences, and confirmed Yamaha rules from being mixed together.

## 2. Decision record schema

Every material decision should contain:

- ID
- Status
- Category
- Decision
- Rationale
- Evidence/Source
- Prototype Impact
- Validation Required
- Supersedes/Superseded By, when applicable

## 3. Status model

### CONFIRMED
Supported by explicit stakeholder/process information and approved for prototype/domain use.

### PROTOTYPE_DECISION
A deliberate design/product choice for the prototype. It is not automatically a production rule.

### HYPOTHESIS
Plausible working assumption that requires validation.

### TBD
Known decision gap. Codex must not invent the missing rule.

### SUPERSEDED
Previously valid record replaced by a newer decision.

## 4. Categories

Recommended categories:

- ARCH — Architecture
- DOM — Domain
- OPS — Operations
- UX — Experience
- UI — Design/Interaction
- DATA — Data
- BUF — Buffer/Inventory
- PLAN — Planning/Scheduling
- DISP — Dispatching
- QUAL — Quality
- PERF — Performance
- GOV — Governance

## 5. Confirmed discovery decisions

### HIKARI-PLAN-001 — Plano Hora-Hora temporal model
**Status:** CONFIRMED  
**Decision:** The Yamaha Plano Hora-Hora is a continuous temporal sequence. Each Lot has quantity, Scheduled Start, and Scheduled Finish and may cross hour boundaries. Hour boundaries are references, not rigid buckets.

### HIKARI-PLAN-002 — Balancing supplies temporal schedule
**Status:** CONFIRMED  
**Decision:** Balancing supplies the Lot with planned start and finish times as part of the short-term schedule.

### HIKARI-DOM-003 — Lot is a real production identifier
**Status:** CONFIRMED  
**Decision:** The Lot identifier is real and controls a specific production grouping, not merely a visual planning split.

### HIKARI-DOM-004 — Foundry also uses real Lot identifiers
**Status:** CONFIRMED  
**Decision:** In Foundry, each sequenced group also receives a real individual Lot identifier.

### HIKARI-PLAN-005 — Balancing plans at Work Center/line level
**Status:** CONFIRMED  
**Decision:** Balancing informs Foundry/line/Work Center context; the specific machine/Resource is selected later by operations.

### HIKARI-DISP-006 — Resource assignment actors
**Status:** CONFIRMED  
**Decision:** The Foundry Supervisor and Production Leader jointly determine the Resource for execution.

### HIKARI-DISP-007 — Resource-selection criteria
**Status:** CONFIRMED  
**Decision:** Resource selection considers operational strategy, part-to-machine eligibility, Resource availability, installed mold/tooling, capacity, maintenance, preceding sequence, and Setup.

### HIKARI-DISP-008 — Setup minimization
**Status:** CONFIRMED  
**Decision:** Supervisor and Production Leader seek to reduce mold/tooling changes and Setup by grouping compatible production where operationally appropriate.

### HIKARI-OPS-009 — Operational resequencing freedom
**Status:** CONFIRMED  
**Decision:** Supervisor and Production Leader may determine the operational production sequence. By the end of the relevant shift/day, required Lot quantities must be produced. Decisions also consider raw-material availability and downstream ability to consume/produce.

### HIKARI-OPS-010 — Scheduled time is a baseline, not rigid Foundry execution window
**Status:** CONFIRMED  
**Decision:** Lots may be moved within the shift/day as long as quantity commitments are met and the Foundry finished-parts buffer remains protected. How production is organized inside Foundry is operational responsibility.

### HIKARI-BUF-011 — Buffer visibility requirement
**Status:** CONFIRMED  
**Decision:** Users need visibility of finished pieces in buffer by Material and temporal coverage in days/turns.

### HIKARI-DATA-012 — Inventory update context
**Status:** CONFIRMED  
**Decision:** Production confirmation updates PyMAC and, in the corporate model, inventory/WMS should be updated. These are official company information sources, but definitive system-of-record ownership still requires validation.

### HIKARI-BUF-013 — Future demand drives coverage
**Status:** CONFIRMED  
**Decision:** Buffer need/coverage must consider future consumption forecast/planned by Balancing, not merely a historical average.

### HIKARI-BUF-014 — Projected coverage formula concept
**Status:** CONFIRMED  
**Decision:** Projected Buffer Coverage considers current available inventory plus scheduled Foundry production minus future consumption planned by Balancing. Exact production calculation rules remain an engineering concern.

### HIKARI-BUF-015 — Buffer target granularity
**Status:** HYPOTHESIS  
**Decision:** Buffer target policy is factory-governed, while days-of-coverage may be parameterized by productive area. Approximately three days is the Foundry demonstration reference.  
**Validation Required:** Yes, with Yamaha.

### HIKARI-BUF-016 — Foundry buffer boundary
**Status:** CONFIRMED  
**Decision:** “Foundry buffer” means finished and released Foundry pieces waiting to be consumed by Machining.

### HIKARI-BUF-017 — Availability criterion
**Status:** CONFIRMED  
**Decision:** A piece enters the buffer for coverage purposes when it is actually available for consumption by the next area.

### HIKARI-BUF-018 — Produced versus available
**Status:** CONFIRMED  
**Decision:** The solution must distinguish Produced Quantity from quantity effectively Available for downstream consumption.

### HIKARI-PLAN-019 — Demand destination required
**Status:** CONFIRMED  
**Decision:** Production requirements must distinguish at least Assembly, Replacement, and Engineering destinations.

### HIKARI-PLAN-020 — Balancing supplies demand destination
**Status:** CONFIRMED  
**Decision:** The demand destination classification comes from Balancing.

### HIKARI-OPS-021 — Final Assembly priority
**Status:** CONFIRMED  
**Decision:** Final Assembly is the priority demand when continuity of production must be protected.

### HIKARI-BUF-022 — Shared physical buffer with logical segregation
**Status:** CONFIRMED  
**Decision:** Assembly, Replacement, and Engineering pieces may reside in the same physical buffer, but reserved/segregated quantities must remain identifiable and must not be treated as freely available to other demand.

### HIKARI-BUF-023 — Logical and effective reservation
**Status:** CONFIRMED  
**Decision:** A demand is logically reserved from planning. The reservation becomes physically/effectively represented when the piece enters the buffer.

### HIKARI-BUF-024 — Coverage segmented by destination
**Status:** CONFIRMED  
**Decision:** The buffer experience must show Assembly coverage and separately identify quantities reserved for Replacement and Engineering.

### HIKARI-BUF-025 — Exceptional reservation reallocation
**Status:** CONFIRMED  
**Decision:** Reserved Replacement/Engineering pieces may be reallocated to prevent production stoppage in Final Assembly. The change must be explicit and traceable.

### HIKARI-GOV-025A — Reallocation authority/workflow
**Status:** TBD  
**Decision Gap:** Cross-area alignment is expected, but approval participants and authority levels are not yet defined. Codex must not invent the workflow.

### HIKARI-MAT-026 — Raw-material visibility
**Status:** CONFIRMED  
**Decision:** HIKARI must provide visibility of raw-material volume available for production and alert on potential risks.

### HIKARI-FLOW-027 — Quantitative downstream view
**Status:** CONFIRMED  
**Decision:** HIKARI should provide a quantitative view of projected downstream capacity/consumption to support Foundry decisions.

### HIKARI-FLOW-028 — Future native HIKARI downstream information
**Status:** CONFIRMED  
**Decision:** In the future, HIKARI itself will provide downstream capacity/consumption information as more productive areas are incorporated.

### HIKARI-FLOW-029 — Real-time downstream condition
**Status:** FUTURE / NOT REQUIRED NOW  
**Decision:** Real-time downstream operational-condition intelligence may evolve later and does not block the current prototype.

### HIKARI-DATA-030 — Data freshness
**Status:** CONFIRMED  
**Decision:** Production Schedule and Production Orders must expose last-update date/time and alert when expected current information has not been received. Balancing and PyMAC freshness are evaluated separately while the main UI may show a consolidated status.

## 6. Decision-change policy

Codex MUST NOT edit a confirmed decision in place to make implementation easier. A changed decision requires a new record that explicitly supersedes the prior one.

## 7. Hypothesis policy

Hypotheses may be visualized in the prototype only when clearly identified as demonstrative or pending validation. They MUST NOT be presented as official Yamaha rules.

## 8. TBD policy

When implementation reaches a TBD that materially changes domain behavior, Codex must stop that specific path, record the missing decision, and continue only with work independent of that decision.
