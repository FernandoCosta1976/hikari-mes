# HIKARI Prototype — Codex Execution Rules

## 1. Mandatory preflight

Before modifying prototype code, Codex MUST read all files under the prototype-governance package and the canonical glossary. It must identify applicable personas, use cases, confirmed decisions, hypotheses, and TBDs.

## 2. No silent product decisions

Codex MUST NOT invent domain rules, MES terminology, approval workflows, optimization behavior, system-of-record ownership, target-buffer policies, or persona authority.

## 3. Decision-state discipline

- CONFIRMED may be implemented as prototype behavior.
- PROTOTYPE_DECISION may be implemented but must not be represented as a production/Yamaha rule.
- HYPOTHESIS may be visualized only with appropriate demonstrative/validation context.
- TBD must not be filled by invention.
- SUPERSEDED must not drive new implementation.

## 4. Domain terminology gate

Codex MUST use canonical English terms in code/domain identifiers and controlled pt-BR labels in the UI.

No new domain term may be introduced without adding it to the glossary with a governance status.

## 5. Persona/use-case gate

Codex MUST NOT create a screen or major interaction without identifying:

- primary persona;
- supporting persona(s), if any;
- business question;
- use case;
- decision supported.

If none exists, implementation must stop until product governance is clarified.

## 6. One-question experience rule

Every major experience must have one dominant business question. Codex must reject/flag screen growth that turns a focused experience into an unrelated dashboard collection.

## 7. Architecture gate

Codex MUST preserve:

- corporate-platform concept;
- modular MES disciplines;
- Events discipline versus Corporate Event Service distinction;
- Balancing schedule versus PyMAC Production Order distinction;
- Production Order versus Lot distinction;
- Work Center versus Resource distinction;
- Scheduling versus Dispatching distinction;
- Scheduled versus Dispatched versus Actual sequence lineage;
- Produced versus Available Quantity distinction;
- physical versus reserved versus available buffer distinction.

## 8. Prototype isolation gate

Prototype data and actions MUST remain isolated. No official operational data may be modified. Demo state must be resettable.

## 9. Data classification gate

Any demonstrative value must be identifiable as DEMO_SIMULATED or DERIVED_SIMULATED in the prototype data layer. Real/reference data must not be silently modified for narrative convenience.

## 10. Data freshness gate

Production Schedule and Production Orders must expose freshness. Codex MUST NOT hide stale data or substitute prior-day data without an explicit warning.

## 11. Confidentiality gate

Codex MUST NOT introduce APIs, endpoints, payloads, event contracts, schemas, broker details, physical database diagrams, infrastructure diagrams, detailed APF, detailed sizing, or proprietary algorithms into executive prototype views.

## 12. Visual gate

Codex MUST follow the Design System Manifesto:

- T-Systems-inspired structural/editorial reference;
- HIKARI/Yamaha blue identity;
- white and neutral gray foundation;
- CORE dark blue;
- ESSENTIAL light blue;
- IMPORTANT orange;
- COMPLEMENTARY green;
- no red;
- graph-first executive composition;
- no generic admin-template appearance.

## 13. Interaction gate

Codex MUST NOT:

- assign Resources in the schedule-reception experience by default;
- overwrite Scheduled Sequence during Rescheduling;
- present ineligible Resources as valid equivalents;
- implement an invented reservation-reallocation approval workflow;
- imply autonomous optimization where none is validated;
- rely on hover for critical information.

## 14. Wireframe V0.1 implementation scope

The first authorized wireframe is **Programação da Produção — Plano Hora-Hora**.

It answers: **O que precisamos produzir?**

Required elements:

- HIKARI/demo shell;
- Productive Area global context;
- day/horizon context;
- “Cenário demonstrativo” label;
- consolidated Data Freshness indicator;
- source-level Balancing/PyMAC freshness detail on demand;
- continuous Plano Hora-Hora timeline;
- Lot selection;
- Lot detail panel;
- Production Order-to-Lot correlation/reconciliation;
- demand destination;
- concise current/projected buffer context;
- concise raw-material risk context when relevant;
- transition to Production Readiness.

Explicitly excluded from V0.1 main screen:

- OEE;
- detailed quality;
- detailed losses;
- bottleneck analytics;
- full modular architecture;
- Functional Catalog;
- MES coverage maps;
- APF;
- technical integration details.

## 15. TBD handling

When a component depends on a TBD:

1. do not invent the rule;
2. document the missing decision;
3. use a neutral placeholder only if it does not imply a business rule;
4. continue independent work;
5. report the blocker in the implementation summary.

## 16. Change reporting

Every Codex implementation batch should report:

- governance files read;
- use cases implemented;
- personas served;
- decisions applied;
- hypotheses displayed;
- TBDs encountered;
- files changed;
- prototype-only assumptions;
- tests/checks executed.

## 17. Definition of done

A prototype change is done only when it is visually coherent, navigable, traceable to persona/use case, compliant with domain terminology, isolated from production data, explicit about simulated data, and free of prohibited technical disclosure.
