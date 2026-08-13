# UC-PROD-005 — Assign Lot to Resource

**Primary actors:** Foundry Supervisor + Production Leader  
**Question:** Onde devemos produzir?  
**Status:** PROTOTYPE_BASELINE

## Trigger

A scheduled Lot needs a specific machine/Resource before dispatch/execution.

## Required information

- Lot;
- Material;
- eligible Resources;
- availability;
- mold/tooling;
- Setup;
- maintenance/capacity context.

## Main flow

1. User selects Lot.
2. HIKARI displays eligible Resources.
3. Constraints are visible.
4. User compares operational context.
5. User selects Resource.
6. HIKARI updates demonstrative Dispatched Sequence/context.

## Outcome

The Lot has a demonstrative Resource assignment suitable for later dispatch.

## Rule

Resource is not falsely attributed to Balancing.
