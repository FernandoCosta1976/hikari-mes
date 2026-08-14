# DQ-MRE-001 — Material × Resource Eligibility Definition Basis

**ID:** DQ-MRE-001-ELIGIBILITY-DEFINITION-BASIS
**Status:** TBD — NON-BLOCKING FOR GOVERNED DEMO PROJECTION
**Date:** 2026-08-13
**Scope:** Production definition/master data; WF-002 Production Readiness; WF-003 Resource Orchestration

## Question

> A elegibilidade de máquina é definida diretamente por Material ou depende de Routing, Operation/Operation Activity, Production Version/recipe, Production Tool ou outra Production Definition governada?

## Confirmed Facts

- A Material/part may only be produced on a subset of Resources.
- Resource Eligibility and Resource Availability are distinct.
- Production Readiness and Resource Orchestration consume Resource Eligibility.
- A selected Resource is not equivalent to an eligible Resource.
- HIKARI architecture requires Routing and Operation between the production requirement and execution Resource.
- A Material/Operation may require a Production Tool, and a tool may be compatible with specific Resources.
- Real Yamaha names, mappings and authoritative master-data sources are not confirmed.

## Alternatives Requiring Validation

### A — Direct Material × Resource

Eligibility is governed directly for each Material and Resource.

### B — Material × Routing × Operation × Resource

Eligibility is governed in the applicable Routing/Operation context.

### C — Production Version / Recipe / Production Definition

Eligibility depends on a richer production definition that selects Routing, Operation, tool/process variant and eligible Resources.

### D — Other Yamaha mechanism

Another governed business object or engineering rule defines eligibility.

**Selected alternative:** NONE — BUSINESS/ENGINEERING VALIDATION REQUIRED.

## Why It Matters

The answer determines the production master-data owner, stable identity, effectivity scope, traceability and future domain model. Choosing a direct matrix prematurely could create a dead end when one Material has multiple process routes or operation/tool variants.

## Non-Blocking Prototype Rule

The question does not block a simplified demonstrative `Material → Eligible Resources` projection if it is:

- read-only;
- explicitly demonstrative;
- isolated from production master data;
- treated as a projection rather than canonical persistence;
- free of availability, readiness, recommendation, Assignment and Dispatch semantics;
- replaceable by the validated richer model.

## Decision Required

Business/Engineering Architecture must validate:

1. the object that defines eligibility;
2. whether eligibility varies by Routing or Operation;
3. whether Production Tool compatibility is part of the same rule or a separate readiness dimension;
4. the authoritative source and steward;
5. whether status/effectivity/version governance is required;
6. whether eligible Resource groups exist or only individual Resource relations.

## Related Documents

- `../domain/MATERIAL-RESOURCE-ELIGIBILITY.md`
- `../architecture-reinforcement/01-ROUTING-AND-OPERATION-MODEL.md`
- `../architecture-reinforcement/03-RESOURCE-ORCHESTRATION.md`
- `../architecture-reinforcement/04-PRODUCTION-TOOLS-AND-SETUP.md`
- `../functional-model/04-PRODUCTION-READINESS.md`
- `../functional-model/06-DISPATCHING-AND-RESOURCE-ASSIGNMENT.md`
- `../use-cases/UC-PROD-003-VALIDATE-PRODUCTION-READINESS.md`
- `../use-cases/UC-PROD-005-ASSIGN-LOT-TO-RESOURCE.md`
