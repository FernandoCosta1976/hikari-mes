# WF-001 — Approval Record

**Experience:** WF-001 — Production Scheduling / Programação da Produção / Plano Hora-Hora
**Status:** APPROVED / FROZEN
**Approval date:** 2026-08-13
**Approver:** Product Owner
**Dominant question:** “O que precisamos produzir?”

## Approved Baselines

- Original design baseline: `../assets/wireframes/production-scheduling/WF-001-PRODUCTION-SCHEDULING-V1.0-APPROVED.png`
- Approved implementation baseline: `../assets/wireframes/production-scheduling/WF-001-PRODUCTION-SCHEDULING-IMPLEMENTATION-V1.0-APPROVED.png`
- Historical approved candidate source: `../../../e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-RESOURCE-LANDSCAPE-COMPACT-CANDIDATE-chromium-darwin.png`

Historical candidates remain preserved and are not themselves renamed or overwritten.

## Approved Experience Decisions

- continuous time axis;
- duration-proportional Lot blocks;
- contextual Lot detail;
- explicit Schedule × Dispatch separation;
- Schedule Version and revision visibility;
- quick restriction reading;
- progressive drill-down;
- compact physical Resource context for DC01–DC05;
- Resource remains “Ainda não atribuído” in WF-001;
- handoff to Production Readiness through “Avaliar preparação”.

## Approved Physical Resource Landscape

Fundição DC contains five confirmed physical Resources:

- DC01;
- DC02;
- DC03;
- DC04;
- DC05.

In WF-001 these machines are physical context only. They are not Schedule Streams, are not automatically Work Centers, receive no Lot Assignment, represent no Dispatch and have no independent timeline.

**Representation:** COMPACT PHYSICAL RESOURCE LANDSCAPE
**Status:** APPROVED

## Functional Boundary

WF-001 ends with a contextualized Scheduled Requirement, comprehension of the received Production Schedule and a handoff to Production Readiness.

WF-001 does not own:

- detailed Resource Eligibility;
- Resource Availability;
- Production Tool evaluation;
- Setup evaluation;
- Resource Assignment;
- Operational Sequence;
- Dispatch;
- Release;
- Execution.

## Approved Experience Direction

1. WF-001 — Production Scheduling — “O que precisamos produzir?”
2. WF-002 — Production Readiness — “Temos condições de produzir?”
3. WF-003 — Resource Orchestration — “Como vamos organizar os Lots nas máquinas?”
4. Dispatch
5. Release
6. Execution

This is an approved conceptual decomposition. It does not authorize WF-002 or WF-003 implementation. Their next authorized stage is conceptual design, beginning with WF-002.

## Open Domain Question

**ID:** DQ-WF001-001-PARALLEL-SCHEDULE
**Status:** TBD / BUSINESS VALIDATION REQUIRED
**Impact on WF-001:** NON-BLOCKING
**Impact on WF-002:** PARTIAL CONSTRAINT
**Impact on WF-003 / Resource Orchestration:** PARTIAL CONSTRAINT

The question remains unresolved and must not be answered by inference.

## Freeze Rule

Changes to the approved WF-001 functional or visual baseline require a new explicit Product Owner decision and a reviewed replacement baseline. This freeze does not prevent defect correction, but any correction that changes behavior, semantics, hierarchy or visual composition must return through the appropriate governance gate.
