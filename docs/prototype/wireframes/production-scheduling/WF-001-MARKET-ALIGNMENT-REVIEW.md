# WF-001 — Market Alignment Review

**Status:** APPROVED / FROZEN — see `../../governance/WF-001-APPROVAL-RECORD.md`
**Date:** 2026-08-13
**Scope:** WF-001 — Production Scheduling / Plano Hora-Hora

## Decision

The Product Owner approved the following experience principles for the WF-001 refinement:

1. continuous time axis;
2. duration-proportional Lot blocks;
3. contextual detail on selection;
4. explicit Schedule × Dispatch separation;
5. visible schedule changes and revisions;
6. quick reading of known restrictions and attention signals;
7. progressive drill-down.

These principles are inspired by consolidated MES market practices. HIKARI must not visually copy SAP, Siemens or any other product. No proprietary layout, component, icon or product terminology is adopted.

The experience remains specific to the Yamaha/HIKARI process. Yamaha Lot remains the dominant operational visual entity; Balancing remains the source of the Production Schedule; PyMAC remains the source of Production Orders; Work Center remains distinct from Resource; and Resource remains unassigned in WF-001.

## Functional boundary

The refinement does not create a Dispatched Sequence, Resource Assignment, drag-and-drop, machine lanes, Execution, Production Readiness analysis or change management for execution.

WF-001 continues to show the received Scheduled Sequence and answer only:

**“O que precisamos produzir?”**

The UI may explain that operational sequencing will be defined later, but it must not simulate or implement that later decision.

## Disclosure model

- Level 1: context, commitment, freshness, continuous timeline and quick attention signals;
- Level 2: selected Lot and its contextual detail;
- Level 3: source freshness, schedule revision changes, Production Order correlation, buffer context and raw-material attention.

This decision refines presentation and interaction only. It introduces no new MES domain rule or external Schedule Version mechanism.

## Physical Resource Landscape in WF-001

**Product decision date:** 2026-08-13
**Status:** APPROVED / FROZEN

WF-001 presents a secondary physical-resource layer for Fundição DC containing machines `DC01`, `DC02`, `DC03`, `DC04` and `DC05`. This layer communicates the available physical Resource landscape of the Production Area and supports the narrative from received plan to future preparation and operational organization.

The five horizontal lanes are **physical Resource references**, not Schedule lanes or “Schedule Streams”. They contain no Lots, assignments, availability states or interactive allocation behavior. The received Production Schedule remains the dominant layer and each Lot remains without a Resource assignment.

This experience decision does not resolve [DQ-WF001-001-PARALLEL-SCHEDULE](../../domain-questions/DQ-WF001-001-PARALLEL-SCHEDULE.md), which remains `TBD / BUSINESS VALIDATION REQUIRED`. It does not authorize Dispatching, Resource Assignment, Production Readiness evaluation or WF-002 behavior.

### Resource Landscape compaction

**Product decision date:** 2026-08-13
**Status:** COMPACT REPRESENTATION APPROVED / FROZEN FOR WF-001

The physical Resource landscape is represented as a compact, non-temporal list of `DC01`–`DC05`, accompanied by the explicit state “Atribuição dos Lotes: Ainda não realizada” and the Production Readiness handoff. The earlier candidate with five empty time lanes is superseded as an experience direction but remains preserved as a review artifact.

**Temporal Resource Matrix:** DEFERRED TO RESOURCE ORCHESTRATION. A matrix combining Resource × Time × Lot may be introduced only after governed Resource Assignment. WF-001 contains no second time axis, machine schedule, Resource Availability state or assignment interaction.
