# UC-PROD-004 — Operationally Resequence Lots

**Primary actors:** Foundry Supervisor + Production Leader  
**Question:** Essa é a melhor sequência operacional?  
**Status:** PROTOTYPE_BASELINE

## Trigger

The received schedule can be executed more effectively by changing operational order while preserving commitments.

## Required information

- Scheduled Sequence;
- shift/day commitment;
- destination priority;
- buffer;
- raw material;
- eligible/available Resources;
- mold/tooling;
- Setup;
- downstream context.

## Main flow

1. User reviews baseline.
2. User identifies candidate Lots for resequencing.
3. HIKARI preserves original Scheduled Sequence.
4. User creates/adjusts Dispatched Sequence.
5. HIKARI shows relevant demonstrative impacts.
6. User confirms simulated operational sequence.

## Outcome

An operational sequence is created without destroying planning traceability.

## Mandatory lineage

**Scheduled Sequence → Dispatched Sequence → Actual Sequence**

## Exclusion

No optimization algorithm is implied.
