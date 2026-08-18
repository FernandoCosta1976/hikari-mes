# HIKARI MES — Material × Resource Eligibility

**Document ID:** HIKARI-DOM-MRE-001
**Status:** PROTOTYPE_DOMAIN_FOUNDATION — REAL DEFINITION BASIS TBD
**Date:** 2026-08-13
**Scope:** WF-001 contextual visibility; WF-002 Production Readiness; WF-003 Resource Orchestration

## Purpose

Govern the structural rule that determines which Resources are technically eligible to produce a Material without confusing eligibility with current operational conditions or Resource selection.

## Domain Definition

`Resource Eligibility` answers:

> Em quais Resources este Material pode tecnicamente ser produzido no contexto aplicável de produção?

The relationship represents structural production capability or compatibility. It may reflect product/process constraints, machine characteristics, supported Production Tools or other governed engineering definitions.

The following distinctions are mandatory:

```text
Resource Eligibility
≠ Resource Availability
≠ Production Readiness
≠ Resource Assignment
≠ Dispatch
```

An eligible Resource is a candidate for further assessment. It is not necessarily available, prepared, recommended, selected or authorized for execution.

## Normative Terminology

- Normative architectural term: **Resource Eligibility**.
- Relationship wording: **Material → Eligible Resources**, only as a simplified projection.
- Recommended pt-BR UX term: **Máquinas elegíveis**.

“Máquinas elegíveis” is preferred over “Máquinas compatíveis” because eligibility is already present in the governed functional and architectural documentation and conveys a controlled candidate set. “Compatível” may be used only as explanatory language for a particular technical criterion; it is not the replacement normative term.

## Ownership

### Recommended rule owner

The structural rule belongs primarily to the governed **production definition/master-data layer**, centered on:

- Material;
- Routing;
- Operation / Operation Activity;
- Resource or eligible Resource group;
- applicable Production Tool/process definition when relevant.

Engineering/master-data governance is the likely business stewardship boundary. The authoritative system and organizational owner are **TBD** and must not be inferred.

### Consumers

- **Production Readiness:** consumes eligibility as the first Resource filter before evaluating current conditions.
- **Resource Orchestration:** consumes eligible/readiness-qualified candidates before Resource Assignment.
- **WF-001:** may consume a compact read-only projection in Lot Detail.

Production Readiness and Resource Orchestration are consumers of the structural rule; they do not automatically own its master definition.

## Material × Routing × Operation × Resource

The architecture prohibits treating Production Order-to-machine as the sole execution relationship. The future-ready conceptual structure is:

```text
Material
→ applicable production definition / Routing
→ Operation / Operation Activity
→ eligible Resource or eligible Resource group
```

A direct `Material → Resource` matrix may be an approved prototype projection for the known Foundry operation, but it must not be treated as proof that eligibility is globally independent of Routing, Operation, production version, recipe, Production Tool or process variant.

The actual Yamaha eligibility-definition basis is governed by [DQ-MRE-001](../domain-questions/DQ-MRE-001-ELIGIBILITY-DEFINITION-BASIS.md).

## Structural Eligibility × Current Condition

### Structural eligibility

Stable production-definition fact:

> Esta máquina pode tecnicamente produzir este Material no contexto aplicável.

### Current condition

Temporal readiness fact:

> Esta máquina está atualmente em condições de produzir este Material.

Current condition may depend on:

- Resource Availability;
- installed/available Production Tool;
- Setup / Changeover;
- maintenance restrictions;
- raw-material availability;
- capacity;
- other approved constraints.

A current constraint does not automatically remove structural eligibility. A structurally eligible Resource does not automatically satisfy current readiness.

## Normative Data Structure

### Future-ready eligibility rule

The normative structure should be capable of representing:

| Field | Requirement | Rule |
|---|---|---|
| Eligibility rule identity | REQUIRED FUTURE-READY | Stable identity for governance and traceability. |
| Material reference | REQUIRED | Material whose production definition is being evaluated. |
| Routing / production-definition reference | CONDITIONAL / TBD | Required if eligibility varies by route, recipe or production version. |
| Operation / Operation Activity reference | CONDITIONAL / TBD | Required if eligibility applies at operation level. |
| Eligible Resource or Resource-group reference | REQUIRED | Candidate execution Resource or governed group. |
| Status | REQUIRED FUTURE-READY | Allows a rule to be active/inactive without deleting history; exact vocabulary TBD. |
| Effective From | FUTURE-READY | Supports governed future changes when effective dating is required. |
| Effective To | FUTURE-READY | Optional open-ended validity; exact rule TBD. |
| Rule/evidence reference | OPTIONAL FUTURE-READY | References the approved engineering/process basis without embedding proprietary detail. |

Exact field names, identifiers, status values and production persistence are not authorized by this document.

### Simplified prototype projection

For the Foundry demonstrative experience, a read-only projection may expose only:

```text
Material reference
→ Eligible Resource references
→ demonstrative-data classification
```

The projection must remain replaceable by the richer production-definition model.

## Version and Effectivity

Eligibility may plausibly change after a new Material, process validation, Resource modification or Production Tool/process change. The data structure should therefore be **FUTURE-READY** for status and effective dating.

This document does not establish:

- approval workflow;
- who authorizes an engineering change;
- exact status vocabulary;
- retroactivity rules;
- version numbering;
- authoritative source;
- automatic effective-date behavior.

Those remain governed decisions. A first demonstrative projection may be static and unversioned if explicitly classified as demo data.

## Demonstrative Eligibility Matrix

**DATA CLASSIFICATION: DEMO_SIMULATED**
**NOT YAMAHA MASTER DATA**

| Material | DC01 | DC02 | DC03 | DC04 | DC05 |
|---|---|---|---|---|---|
| Material A | ELIGIBLE | NOT ELIGIBLE | ELIGIBLE | NOT ELIGIBLE | ELIGIBLE |
| Material B | NOT ELIGIBLE | ELIGIBLE | ELIGIBLE | NOT ELIGIBLE | ELIGIBLE |
| Material C | ELIGIBLE | NOT ELIGIBLE | NOT ELIGIBLE | ELIGIBLE | NOT ELIGIBLE |

This matrix exists solely to make a future prototype scenario internally coherent. It is not a fixture authorization, production rule, Yamaha fact or confirmation of a direct master-data relationship.

## WF-001 Visibility Decision

**Classification: APPROPRIATE WITH CONDITIONS.**

WF-001 Lot Detail may show a concise, read-only **Máquinas elegíveis** summary because it helps the user understand that a Material cannot necessarily be produced on every Fundição DC Resource while preserving the dominant scheduling question.

Conditions:

- display only in the selected planned Lot/Material context;
- label demonstrative data unambiguously;
- show no availability, readiness, ranking or recommendation;
- provide no selection or Resource Assignment action;
- keep Assigned Resource as **Ainda não atribuído**;
- do not infer eligibility from Current Resource State;
- keep the full matrix outside WF-001;
- preserve the richer Routing/Operation domain behind the simplified projection.

Conceptual Lot Detail:

```text
Material
Material B

Máquinas elegíveis
DC02 · DC03 · DC05

Recurso atribuído
Ainda não atribuído
```

The values above are demonstrative. “Máquinas elegíveis” does not mean available or recommended.

## WF-002 Impact

Production Readiness consumes structural eligibility as its first filter:

```text
Scheduled Lot / Material
→ structurally eligible Resources
→ Availability + Production Tool + Setup + maintenance + material + capacity constraints
→ readiness result
```

Structurally ineligible Resources do not need full current-condition evaluation for that Material. WF-002 must still explain unavailable or missing eligibility information and must not convert eligibility alone into “Pronto”.

## WF-003 Impact

Resource Orchestration consumes:

```text
Scheduled Lot
+ eligible/candidate Resources
+ readiness result
→ Resource Assignment
→ Dispatched Sequence
```

`Eligible Resource` remains distinct from `Selected Resource`. This document does not authorize Assignment, Dispatch or an optimization/ranking mechanism.

## Current Resource State Separation

The WF-001 **Agora na Fundição** cards describe observed current context by Resource. They must not display or infer Material eligibility.

Eligibility belongs to the selected Material/Lot context. Current Resource State and Material eligibility must not be merged into the same WF-001 Resource Card because that could imply future suitability, readiness or Assignment from a present-state observation.

## Domain Model Impact

| Concept | Classification | Rationale |
|---|---|---|
| Material | EXISTING | Normative core object and current scheduling model. |
| Resource | EXISTING CONCEPT / IMPLEMENTATION MODEL INCOMPLETE | Normative core object; current WF-001 uses confirmed Resource references. |
| Routing | EXISTING CONCEPT / IMPLEMENTATION MODEL DEFERRED | Required architectural layer, intentionally hidden from WF-001. |
| Operation / Operation Activity | EXISTING CONCEPT / IMPLEMENTATION MODEL DEFERRED | Required future eligibility context; Yamaha mapping remains TBD. |
| Resource Eligibility | EXISTING NORMATIVE CONCEPT | Already present in Production Readiness and Resource Orchestration documentation. |
| Eligibility rule/master record | NEW MODEL CANDIDATE | Needed for governed production definition and effectivity. |
| Material eligible-Resources projection | NEW MODEL CANDIDATE | Simplified read-only prototype projection. |
| Resource Assignment | NOT REQUIRED | Belongs to WF-003 and is explicitly excluded here. |

## Use-Case Coverage

### UC-PROD-003 — Validate Production Readiness

**Classification: SUFFICIENT.**

UC-PROD-003 explicitly requires Resource eligibility and asks whether the scheduled commitment has conditions for execution. The functional model further defines Resource Eligibility as “Which machines are technically capable of producing the part?”. It is sufficient for WF-002 to consume the rule. It does not define or own the underlying master data.

### UC-PROD-005 — Assign Lot to Resource

UC-PROD-005 explicitly requires eligible Resources and displays them before the user selects a Resource. It consumes eligibility together with availability, tooling, Setup and maintenance/capacity context. Eligibility does not perform the Assignment.

### WF-001 contextual visibility

The Lot Detail summary is supporting read-only context. It does not change UC-PROD-003 or UC-PROD-005 and does not claim that WF-001 owns either use case.

## Traceability Gap

The Standard MES Function Catalog remains **NOT AVAILABLE IN REPOSITORY**. No MES Function ID, priority, capability ID or nonexistent traceability is introduced.

This gap does not block the governed demonstrative projection, but it blocks claiming standard function-level traceability or a production contract.

## Prototype Boundary

This document authorizes governance and future planning only. It does not authorize:

- code or fixture changes;
- WF-001 Lot Detail changes;
- WF-002 or WF-003 implementation;
- Resource availability or readiness states;
- Resource ranking or recommendation;
- Resource Assignment or Dispatch;
- production master-data schema or persistence;
- APIs, payloads or integrations;
- Yamaha eligibility claims.

## Recommended Next Action

After Chief Architect review, the Product Owner may choose **ADD ELIGIBILITY SUMMARY TO WF-001 LOT DETAIL** under the conditions above. A separate implementation authorization and review gate are required.
