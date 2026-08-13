# UC-PROD-002 — Reconcile Production Orders and Scheduled Lots

**Primary actor:** Foundry Supervisor / PCP  
**Question:** O plano corresponde às ordens?  
**Status:** PROTOTYPE_BASELINE

## Required information

- PyMAC Production Order;
- Production Order planned quantity;
- Balancing Lots correlated to the Production Order;
- scheduled quantity for each correlated Lot;
- sum of correlated Lot quantities;
- source freshness.

## Main flow

1. HIKARI presents the consolidated Production Order and its associated Lots.
2. HIKARI compares the Production Order quantity with the sum of scheduled Lot quantities.
3. The reconciliation state is made explicit.
4. The user determines whether the planning inputs are trustworthy enough to proceed.

## Alternative flow

If the quantities differ, HIKARI exposes the difference without correcting, completing or inventing missing quantities.

## Outcome

The reconciliation state is understood without collapsing Production Order and Lot.

## Prototype boundary

WF-001 is diagnostic. It does not edit Production Orders, change Lots or repair source information.
