# Demand Destination and Reservation

**Document ID:** HIKARI-FM-FOUND-009  
**Status:** PROTOTYPE_BASELINE

## 1. Purpose

Define how the Foundry prototype distinguishes production demand by destination and protects reserved quantities.

## 2. Source

Balancing provides the destination classification associated with the planned Lot.

The prototype shall preserve this information through the production journey.

## 3. Required destinations

At minimum:

- **Montagem**
- **Reposição**
- **Engenharia**

The canonical internal field name remains subject to terminology governance; Codex must not invent a permanent domain term without glossary approval.

## 4. Priority

Final Assembly/production-chain demand has the primary operational priority.

This does not mean other destinations are irrelevant.

Their commitments must remain visible and traceable.

## 5. Logical reservation

When Balancing identifies a Lot for Reposição or Engenharia, the future quantity is logically committed to that destination.

This prevents projected assembly coverage from incorrectly counting that future quantity as free assembly supply.

## 6. Effective reservation

When the produced quantity becomes physically available in the Finished Goods Buffer, the reservation becomes effective against the on-hand stock.

Thus:

**planned destination → logical reservation → production → availability → effective reserved stock**

## 7. Physical coexistence

Montagem, Reposição and Engenharia quantities may exist in the same physical buffer.

The system must therefore distinguish physical stock from allocatable stock.

## 8. Coverage presentation

Option B is the approved prototype direction:

For each Material, show assembly coverage and separate reserved quantities.

Example:

### Bloco A

Montagem:
- Available: 3,650;
- Current Coverage: 2.6 days;
- Projected Coverage: 3.1 days.

Reposição:
- Reserved: 120.

Engenharia:
- Reserved: 30.

Physical Total:
- 3,800.

## 9. Exceptional reallocation

Reserved Reposição or Engenharia quantities may be reallocated to Montagem to avoid stopping production.

This action must be explicit and traceable.

The organizational approval/alignment model is not confirmed.

Status:

**TBD — cross-area alignment/authorization workflow**

The prototype shall not invent approvers.

## 10. Reallocation consequence

If reserved stock is consumed by Montagem:

- Montagem availability increases/continues;
- the original reserved commitment becomes exposed;
- HIKARI should preserve the original destination and the reallocation event conceptually;
- the resulting risk to Reposição/Engenharia should be visible.

## 11. Prototype limitation

The first scheduling wireframe only needs to show destination and reservation context.

The complete reallocation interaction can be implemented later after governance is validated.
