# Dispatching and Resource Assignment

**Document ID:** HIKARI-FM-FOUND-006  
**Status:** PROTOTYPE_BASELINE

## 1. Purpose

Define the transition from a Work Center-level Production Schedule to Resource-level execution preparation.

## 2. Dominant question

**Onde e como vamos produzir este Lot?**

## 3. Responsibility boundary

Balancing provides Work Center/line context.

Balancing does not provide the specific Resource for the Foundry scenario.

Foundry Supervisor and Production Leader jointly select the Resource.

## 4. Resource eligibility

A given Material/part may only be produced on certain Resources.

The prototype shall distinguish:

- eligible Resource;
- ineligible Resource;
- eligible but currently constrained Resource;
- information unavailable.

Eligibility is not the same as availability.

## 5. Resource selection context

The decision may consider:

- Material-to-Resource compatibility;
- Resource availability;
- mold/tooling;
- capacity;
- maintenance;
- previous sequence;
- Setup.

Future context may include:

- operator competency;
- detailed technical parameters;
- predictive conditions.

These future dimensions shall not be invented in the first prototype.

## 6. Dispatching

Dispatching is the operational act of preparing/releasing the Lot to a selected execution context.

The prototype may simulate states such as:

- Programado;
- Preparado;
- Liberado;
- Em execução;
- Concluído;
- Em espera.

Before these labels become production-system statuses, they must be reconciled with the standard SAP/MES terminology.

## 7. Separation from Scheduling

Scheduling:
- what;
- quantity;
- baseline timing;
- Work Center.

Dispatching:
- Resource assignment;
- operational sequence;
- readiness context;
- release toward execution.

The UI shall not make Resource assignment appear to originate from Balancing.

## 8. Setup context

When selecting a Resource, the user should be able to understand whether the selection:

- keeps current mold/tooling;
- requires Setup;
- increases or reduces changeover burden.

Exact Setup duration may be simulated only when clearly labeled demonstrative.

## 9. Prototype behavior

The prototype may allow:

1. select Lot;
2. view eligible Resources;
3. compare constraints;
4. select Resource;
5. preview operational impact;
6. confirm demonstrative assignment.

No real dispatch message, machine command or production transaction shall occur.

## 10. Future integration

Resource execution and events may later be integrated through HIKARI's modular architecture and corporate event mechanisms.

This document does not define event contracts or technical integration.
