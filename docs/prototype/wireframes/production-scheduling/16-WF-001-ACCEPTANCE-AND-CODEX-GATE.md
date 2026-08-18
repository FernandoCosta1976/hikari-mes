# WF-001 — Acceptance and Codex Gate

**Gate type:** UX / Prototype implementation gate  
**Target:** First implementation of Production Scheduling

## 1. Required upstream documents

Codex must read and respect:

- Group 01 — Governance;
- Group 02 — Foundry Functional Model;
- Group 03 — Personas / Use Cases / Traceability;
- all Group 04 WF-001 specifications.

If any instruction conflicts, Codex must identify the conflict rather than silently choose a new rule.

## 2. Functional acceptance

The implementation must demonstrate:

- global Productive Area;
- Fundição DC coherent scenario;
- business date;
- freshness;
- Balancing Hour-by-Hour baseline;
- PyMAC Production Order correlation;
- real Lot concept;
- continuous Scheduled Start/Finish timeline;
- destination;
- shift/day commitment;
- buffer contextual signal;
- raw-material contextual signal;
- reconciliation;
- Lot detail;
- transition toward Production Readiness.

## 3. Domain acceptance

Must preserve:

**Production Order ≠ Lot**

**Scheduled Sequence ≠ Dispatched Sequence ≠ Actual Sequence**

**Produced ≠ On-Hand ≠ Reserved ≠ Available**

**Work Center ≠ Resource**

**Balancing schedule ≠ HIKARI operational resequencing**

## 4. Freshness acceptance

Must support at least:

- current;
- partial freshness;
- previous-day plan/not received.

Stale data cannot appear as current.

## 5. UX acceptance

Within a few seconds the user must identify:

- where;
- when;
- what quantity;
- which Lots;
- freshness;
- main attention.

The timeline must visually dominate.

## 6. Visual acceptance

Must follow:

- HIKARI identity;
- T-Systems-inspired composition;
- Yamaha-inspired blue;
- white/neutral base;
- no red;
- no generic admin-template appearance;
- no spreadsheet replica.

## 7. Demo-data acceptance

Every simulated scenario must be identified as demonstrative.

Dataset must remain internally consistent across all interactions.

## 8. Confidentiality acceptance

Do not expose:

- APIs;
- payloads;
- schemas;
- endpoints;
- event contracts;
- broker technology;
- physical database;
- proprietary BOM;
- infrastructure;
- detailed APF.

## 9. Technical scope

Allowed:

- frontend-only demo state;
- local navigation;
- isolated scenario state;
- reusable presentation components.

Not authorized:

- real external integration;
- production persistence;
- production database;
- irreversible architecture changes.

## 10. Implementation quality

Codex must avoid:

- one-off hard-coded visual hacks when a reusable prototype component is appropriate;
- invented domain terminology;
- invented Yamaha rules;
- silent assumptions;
- duplicate representations of reference concepts.

## 11. Validation scenarios

Implementation must be testable against:

A. normal current plan;  
B. destination reservation;  
C. buffer recovery;  
D. raw-material risk;  
E. reconciliation mismatch;  
F. previous-day plan;  
G. Lot selection and transition to readiness.

## 12. Final implementation report

When implementation is eventually authorized, Codex must report:

- files created/changed;
- scenarios implemented;
- assumptions used;
- TBD items preserved;
- deviations from specifications;
- tests/checks executed.

## 13. Current authorization

This document completes the **wireframe specification gate**.

The conceptual composition and narrative were approved through the V1.0 visual baseline and regularized by `docs/prototype/governance/14-WF001-DOCUMENTATION-GATE-DECISION.md`.

WF-001 is eligible for implementation planning. Code implementation still requires a separate explicit instruction and remains limited to the prototype scope defined here.
