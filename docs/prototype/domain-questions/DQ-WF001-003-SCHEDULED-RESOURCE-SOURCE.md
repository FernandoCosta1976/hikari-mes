# DQ-WF001-003 — Scheduled Resource Source

**Status:** BUSINESS VALIDATION REQUIRED — NON-BLOCKING FOR DEMONSTRATIVE PROTOTYPE
**Date:** 2026-08-14
**Scope:** WF-001 Scheduled Resource provenance and future WF-003 boundary

## Question

> Quem determina a máquina programada DC01–DC05?

## Candidate Alternatives

1. Balancing supplies the specific machine.
2. HIKARI receives the production requirement and creates a machine-level schedule.
3. Foundry Supervisor/Production Leader defines it in HIKARI.
4. Another process or system determines it.
5. A hybrid model applies.

**Selected alternative:** NONE.

## Confirmed Prototype Rule

WF-001 may show explicit Scheduled Resource values classified as **Cenário demonstrativo**. The prototype must not attribute their origin to Balancing or another owner until business validation is complete.

## Why Non-Blocking

The product decision requires Resource × Time × Lot visualization to validate operational comprehension. Demonstrative assignment is isolated, read-only, eligibility-valid and carries no Dispatch, Release, Execution or Resource Availability semantics.

## Productive Impact

The answer is required before a productive sourcing contract, editable scheduling workflow, assignment governance or definitive WF-003 responsibility can be designed.
