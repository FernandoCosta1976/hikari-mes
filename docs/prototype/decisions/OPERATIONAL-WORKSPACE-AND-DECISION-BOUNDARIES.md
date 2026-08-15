# OPERATIONAL-WORKSPACE-AND-DECISION-BOUNDARIES

**Status:** APPROVED  
**Scope:** Product architecture for the HIKARI MES navigable prototype  
**Decision date:** 2026-08-14

## Context

The prototype originally used workflow identifiers as convenient implementation boundaries. Product governance now defines a workflow as a governed operational decision, not as a page. The experience must remain continuous while capabilities and domain states remain independently governed.

## Decision

1. **WF = Operational Decision.** WF-001 governs Production Scheduling, WF-002 governs Production Readiness, and the future WF-003 will govern Resource Orchestration.
2. **WF is not a Screen.** A representation may expose one decision in summary, contextual, detailed, or exception-oriented form. A screen may naturally support multiple decisions without merging their semantics.
3. **Operational Workspace.** The product uses one reusable workspace shell, Application Context, Scenario State, and navigation model. Features remain modular; no mega component or independent application is introduced.
4. **Perspectives.** Primary user labels are **Plano**, **Preparação**, and future **Organização**. Workflow IDs remain governance identifiers and are not primary navigation labels. Perspectives are not wizard steps and remain directly accessible.
5. **Transversal Lot Context.** Lot is a stable contextual navigation object. Its context progressively exposes identity, schedule, quantity, destination, readiness, restrictions, and Resource suitability as those semantics become governed.
6. **Role-based access.** Scheduling and preparation personas may enter their predominant perspective directly. The architecture does not assume that one person completes the whole operational journey.
7. **Exception-based work.** Preparation supports direct aggregate entry and exception-first investigation without requiring prior navigation through Plano or silently selecting a Lot.
8. **Progressive disclosure.** Readiness appears as a compact Plan signal, a Lot Context summary, detailed evidence, and an exception workbench. All representations consume the same canonical Readiness projection.
9. **Scenes of evolution.** The architecture supports incremental scenes: Plan; Lot detail; Readiness signal; Readiness investigation; eligible Resource comparison; future Resource Assignment; future operational sequencing; future Dispatch/Release; future Execution/Actual. Only governed scenes are implemented.
10. **Decision boundaries.** `Scheduled != Ready != Resource Assigned != Dispatched != Released != Actual`. `Programmed Resource != Confirmed Resource Assignment`. Eligibility and Availability also remain distinct.
11. **Routing is not product fragmentation.** Routes provide deep links, history, restoration, testing, and sharing. Route changes preserve the same Operational Workspace and applicable Application, Scenario, and Lot context.
12. **State semantics remain separated.** Application Context, demonstrative Scenario State, canonical domain projections, journey restoration, and local UI State retain distinct ownership. Routing does not redefine domain state.

## Implementation consequences

- `OperationalWorkspace` is the shared visual/navigation shell for Plano and Preparação.
- Production Scheduling and Production Readiness remain separate feature modules.
- The canonical `production-readiness` domain model and scenario projection feed every Readiness representation.
- Lot Context may link to specialized preparation without implementing Resource Assignment.
- Organização is visible only as a future perspective; WF-003 behavior is not implemented.

## Explicit exclusions

This decision does not implement or define Resource Assignment, Dispatch, Release, Execution, backend integration, productive data sources, or productive lifecycle rules.

## Deferred decisions

- Authority and productive source of Scheduled Resource.
- Productive Readiness aggregation, mandatory evidence, and lifecycle vocabulary.
- Availability, tooling, Setup, maintenance, material, and staging authoritative sources and rules.
- WF-003 interaction, authorization, Resource Assignment semantics, and orchestration presentation.
