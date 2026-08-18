# WF-001 — Documentation Gate Decision

**Decision ID:** HIKARI-GOV-WF001-014  
**Status:** CONFIRMED  
**Scope:** WF-001 — Production Scheduling / Programação da Produção / Plano Hora-Hora  
**Reference repository:** `/Users/fe/Documents/Hikari-mes`

## 1. Purpose

This decision regularizes the documentation gate for WF-001. It supersedes prior statements that WF-001 V0.2 still awaited visual approval or that the WF-001 prototype implementation itself was not yet authorized.

This decision does not initiate or authorize implementation in the current documentation-only stage. Implementation still requires a separate explicit instruction.

## 2. Approved visual baseline

The approved visual reference remains:

`docs/prototype/assets/wireframes/production-scheduling/WF-001-PRODUCTION-SCHEDULING-V1.0-APPROVED.png`

It governs composition, hierarchy, layout and experience subject to the precedence below.

## 3. Precedence

1. Manifestos and normative rules;
2. domain decisions;
3. implementation baseline;
4. approved image;
5. implementation discretion.

Incidental red in the approved image must not be reproduced. Use orange/amber, iconography, text, borders or an accessible combination. The approved image itself remains unchanged.

## 4. Demonstrative data

All WF-001 operational data is demonstrative. The experience must show the discreet and unambiguous label:

**Cenário demonstrativo**

Numbers in the approved image are not official production measurements.

## 5. Terminology

Internal domain naming uses standard MES English. User-facing content uses controlled pt-BR from:

`docs/prototype/glossary/HIKARI-NORMATIVE-GLOSSARY.md`

Non-normative or English labels visible in the approved image must be translated or normalized during implementation without changing its approved composition.

## 6. Data Freshness

WF-001 preserves source, information/business date, last reception/update timestamp and current/stale state.

WF-001 must not claim or display a next automatic update, automatic frequency or expected-arrival SLA until a separate domain rule is approved. The corresponding incidental footer in the image is not implementation authority.

## 7. Schedule Version

Schedule Version remains an architectural concept. WF-001 may represent the active demonstrative version and comparison context without defining a technical versioning mechanism.

## 8. Non-blocking TBDs

The following remain explicitly outside WF-001 scope and do not block it:

- SFC / Execution Control Unit;
- Release;
- Execution lifecycle;
- Quality Disposition;
- Reservation Reallocation Governance;
- detailed Production Confirmation;
- detailed Genealogy.

They must not be resolved, implied or implemented through WF-001.

## 9. Functional boundary

WF-001 answers only:

**O que precisamos produzir?**

It does not answer which machine should produce, whether work can be released or started, operational efficiency, losses or OEE. Resource remains unassigned in this experience.

## 10. UC-PROD normative registry

- `UC-PROD-001` — Review Short-Term Production Schedule;
- `UC-PROD-002` — Reconcile Production Orders and Scheduled Lots;
- `UC-PROD-003` — Validate Production Readiness;
- `UC-PROD-004` — Operationally Resequence Lots;
- `UC-PROD-005` — Assign Lot to Resource.

This registry corrects identifiers only. It does not change the functional content of the use cases.

## 11. Gate effect

The WF-001 documentation baseline is governed and suitable for implementation planning after this documentation-only regularization is validated. No frontend, application, route, component, framework or backend is created by this decision.
