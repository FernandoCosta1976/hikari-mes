# WF-002 — Wireframe Scenarios

**Status:** CONCEPTUAL SCENARIO SPECIFICATION — NO TECHNICAL FIXTURES
**Classification:** CENÁRIO DEMONSTRATIVO / NOT YAMAHA MASTER DATA

No scenario assigns, selects, ranks or recommends a Resource.

| Scenario | Narrative purpose | Expected wireframe evidence |
|---|---|---|
| SCN-WF002-01 | At least one viable path | Lot summary states that an evidenced path exists; one eligible Resource has demonstratively attended conditions. |
| SCN-WF002-02 | Setup required | Eligible Resource compares current and required tool and explains that a change is required. No real duration is inferred. |
| SCN-WF002-03 | Maintenance restriction | Eligible Resource shows a known restriction and explains the affected interval without a machine lifecycle. |
| SCN-WF002-04 | Material available, Staging pending | Material availability and preparation at the production context are displayed separately. |
| SCN-WF002-05 | Insufficient information | One dimension is unknown/stale/not evaluated and cannot become positive or negative automatically. |
| SCN-WF002-06 | No viable path at the moment | All eligible Resources have an impediment or insufficient evidence; summary explains reasons without selecting corrective action. |
| SCN-WF002-07 | Problematic Freshness | Summary warns that one or more contributing dimensions need freshness review; detail contains source and timestamps. |
| SCN-WF002-08 | Rapid structural elimination | DC02/DC04 are compactly shown as ineligible and receive no deeper operational evaluation. |

## Main Scenario

### Scheduled Lot Context

- Lot: 252;
- Material: Material A;
- Quantity: 100 pieces;
- Scheduled interval: 16:43 → 17:48;
- Demand Destination: Montagem;
- Work Center: Fundição DC;
- Eligible Resources: DC01, DC03 and DC05;
- Ineligible Resources: DC02 and DC04.

### Demonstrative Resource Narratives

#### DC01

- structurally eligible;
- current production context known;
- current context does not imply Availability or Readiness;
- demonstrative tool condition compatible with the required context;
- no Setup required in this hypothesis;
- material available and preparation context ready;
- no known maintenance/capacity restriction;
- provisional experience result: **Condições atendidas**.

#### DC03

- structurally eligible;
- no current production known, which does not mean available;
- tool change required in this hypothesis;
- Setup required, duration not calculated;
- material available;
- preparation/staging pending;
- provisional experience result: **Atenção**.

#### DC05

- structurally eligible;
- current information partial;
- known demonstrative restriction;
- tool and capacity evidence incomplete;
- material availability known but preparation context uncertain;
- provisional experience result: **Informação insuficiente** with an explicit restrictive observation.

### Consolidated Narrative

The wireframe states **“Existe caminho viável”** because the demonstrative assessment contains at least one Resource with conditions attended. This is an explicitly designed scenario outcome, not a productive formula, score, recommendation or Resource selection.

## Scenario Rules

- Every screen states **Cenário demonstrativo**.
- All tool/material/maintenance facts are fictional hypotheses for UX validation.
- No productive source is claimed.
- Each attention/impediment includes reason and scheduled interval.
- Buffer affects urgency only.
- Montagem remains context and does not change technical readiness rules.
- Unknown information remains inconclusive.
