# DQ-WF001-001 — Fundição DC Parallel Schedule

**ID:** DQ-WF001-001-PARALLEL-SCHEDULE
**Status:** PARTIALLY CONFIRMED / BUSINESS VALIDATION REQUIRED
**Date:** 2026-08-13
**Scope:** WF-001 boundary, future WF-002 context and Resource Orchestration

## Context

Fundição DC is the Production Area/context for the current experience and contains five confirmed physical Resources: `DC01`, `DC02`, `DC03`, `DC04` and `DC05`. Balancing supplies the short-term Production Schedule with the applicable Foundry, line and Work Center/planning context, but does not assign a specific one of these Resources to a Lot in the currently known scenario.

## Confirmed Facts

- Fundição DC is the Production Area/context; it is not a Resource.
- `DC01`, `DC02`, `DC03`, `DC04` and `DC05` are physical Resources in the Fundição DC operational context.
- The five Resources must not automatically be modeled as Production Areas, Work Centers, schedule lanes, Lots or Balancing lines.
- Work Center is the planned execution context and remains distinct from a specific Resource.
- Balancing is the source of the short-term Production Schedule and Scheduled Sequence.
- Balancing does not currently determine the specific Resource for each Lot.
- Foundry Supervisor and Production Leader perform Resource Assignment later, considering governed eligibility and operational constraints.
- Scheduled Sequence, Dispatched Sequence and Actual Sequence remain distinct.
- Fundição DC can be represented operationally with parallel production across DC01–DC05 in the demonstrative WF-001 scenario.
- The demonstrative machine-level schedule does not confirm the format or semantic owner of the information received from Balancing.

## Reformulated Open Question

Qual formato e semântica de paralelismo o Balancing fornece para a Fundição DC, e essa informação inclui ou não o Scheduled Resource DC01–DC05?

## Why It Matters

The answer determines whether the received Production Schedule has one temporal sequence or multiple simultaneous planning sequences. It may affect the future lane semantics of WF-001, but it does not authorize machine lanes or Resource Assignment.

## Alternatives

### Model A — Single Schedule Stream

Balancing supplies one temporal sequence for Fundição DC. WF-001 retains one planned sequence; distribution to `DC01`–`DC05` occurs later in Resource Orchestration.

### Model B — Parallel Schedule Streams

Balancing supplies two or more simultaneous planned sequences without identifying specific Resources. WF-001 could require multiple planning lanes whose meaning must be validated. “Schedule Stream” is a **PROVISIONAL discussion label**, not a normative glossary term, and these lanes must not be named `DC01`–`DC05` by inference.

### Model C — Other

Yamaha/Balancing uses another mechanism, to be documented only after validation.

**Selected model:** NONE — BUSINESS VALIDATION REQUIRED.

## Impact on WF-001

WF-001 continues to answer “O que precisamos produzir?” and now represents a demonstrative five-lane Scheduled Resource plan. The lane decision is approved for prototype comprehension and does not claim that Balancing supplied the machine assignment. The external format/source semantics remain open under this question and DQ-WF001-003.

## Impact on WF-002

Future Production Readiness must consider the five Resources when evaluating Resource Eligibility, Resource Availability, Production Tool compatibility, Setup/Changeover and technical restrictions. This document does not design or implement WF-002.

## Impact on Resource Orchestration

The five Resources reinforce the future need to transform a Scheduled Requirement into an Operational Resource Assignment and Dispatched Sequence. Foundry Supervisor and Production Leader own that decision; no optimization or dispatch mechanism is defined here.

## Decision Required From Business

Business/Yamaha must validate whether parallel intervals are possible and, if so, which business identifier and operational meaning distinguish the parallel sequences.

## Questions for Yamaha

1. Quando o Balancing envia o Plano Hora-Hora da Fundição DC, ele pode programar dois ou mais lotes para serem produzidos simultaneamente na Fundição, sem indicar se serão executados na DC01, DC02, DC03, DC04 ou DC05?
2. Se houver produções simultâneas, o Balancing envia alguma identificação que permita distinguir essas sequências paralelas?
3. Essa identificação representa uma linha, um centro de trabalho, um fluxo planejado ou outro conceito operacional?

## Non-Blocking Scope

This question does not block the demonstrative WF-001 because parallel machine-level Lots are explicitly classified as scenario data. It blocks claims about Balancing format and partially constrains productive WF-002/WF-003 sourcing and orchestration semantics.

## Related Documents

- `../functional-model/00-FOUNDRY-FUNCTIONAL-MODEL.md`
- `../functional-model/01-PRODUCTION-PLANNING-AND-SCHEDULING.md`
- `../functional-model/06-DISPATCHING-AND-RESOURCE-ASSIGNMENT.md`
- `../architecture-reinforcement/03-RESOURCE-ORCHESTRATION.md`
- `../wireframes/production-scheduling/03-WF-001-HOUR-BY-HOUR-TIMELINE.md`
- `../traceability/BUSINESS-QUESTION-CATALOG.md`
- `../glossary/HIKARI-NORMATIVE-GLOSSARY.md`
