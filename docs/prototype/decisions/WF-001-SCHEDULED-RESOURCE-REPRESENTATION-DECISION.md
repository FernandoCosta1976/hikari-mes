# WF-001 — Scheduled Resource Representation Decision

**Status:** APPROVED FOR DEMONSTRATIVE PROTOTYPE
**Date:** 2026-08-14
**Scope:** WF-001 Plano Hora-Hora

## Decision

WF-001 preserves the executive question **“O que precisamos produzir?”** and, for Fundição DC operational comprehension, represents:

```text
Scheduled Lot × Scheduled Resource × Scheduled Time
```

The Hour-by-Hour Plan contains five physical Resource lanes: DC01, DC02, DC03, DC04 and DC05. Position is Scheduled Start, width is Scheduled Duration and lane is Scheduled Resource.

## Superseded Decision

The previous rule that a specific Resource could appear only as compact physical context and remained **Ainda não atribuído** in WF-001 is **SUPERSEDED** for Scheduled Resource representation.

Historical documents, screenshots and approved baselines remain preserved. This decision does not rewrite their historical status.

## Mandatory Distinctions

- Scheduled Resource ≠ Dispatched Resource ≠ Actual Resource.
- Scheduled Resource Assignment ≠ Dispatch ≠ Release ≠ Execution.
- Current Time Marker ≠ Execution Status or Actual Sequence.
- Resource Eligibility ≠ Resource Availability.
- Work Center ≠ Resource.

WF-001 exposes only Scheduled Resource. It does not expose Dispatched Resource, Actual Resource or Resource Availability.

## Assignment Source

**BUSINESS VALIDATION REQUIRED.**

The demonstrative scenario supplies Scheduled Resource without claiming that Balancing, HIKARI, Supervisor/Leader or another system/process is the authoritative origin. See `../domain-questions/DQ-WF001-003-SCHEDULED-RESOURCE-SOURCE.md`.

## Eligibility Invariant

Every Scheduled Lot must reference one confirmed Fundição DC Resource and its Material must be structurally eligible for that Resource according to the demonstrative Material × Resource Eligibility projection.

Eligibility does not prove availability, preparation, maintenance condition, tooling condition or authorization.

## WF-002 Boundary

WF-002 continues to assess whether conditions exist to execute the scheduled plan, including future Resource Availability, material, tooling, Setup/Changeover and maintenance context when governed.

## WF-003 Reassessment

WF-003 remains open but its residual responsibility must be revalidated. Candidate questions include operational reorganization, exception handling, Resource change, post-Readiness sequencing and optimization. None is resolved here.

## Explicit Exclusions

- Resource selection or editing;
- automatic allocation;
- drag-and-drop;
- Dispatch;
- Release;
- Execution;
- Resource Availability;
- functional maintenance or Setup;
- backend, API or database.
