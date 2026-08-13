# Quality Disposition and Inventory Status

**Document ID:** HIKARI-ARCH-RF-007  
**Status:** REQUIRED_DOMAIN_REINFORCEMENT

## 1. Purpose

Explain why Produced Quantity is not automatically Available Quantity.

## 2. Quality Disposition

Canonical concept: `Quality Disposition`.

Possible conceptual outcomes:
- accepted/released;
- Rework;
- Scrap;
- Hold/Blocked;
- other controlled disposition, TBD.

Exact Yamaha quality states must be validated.

## 3. Inventory Status

Architecture must support at least:
- AVAILABLE;
- RESERVED;
- HOLD / BLOCKED.

## 4. Relationship

**Produced Quantity → Quality/Release decision → Inventory Status → Available Quantity → Buffer Coverage**

## 5. Rework

Rework is not automatically downstream-available until release permits consumption.

## 6. Scrap

Scrap never contributes to Available Quantity or buffer coverage.

## 7. Hold versus Reservation

Reserved means usable but committed to a destination. Hold/Blocked means not currently usable/available.

## 8. WF-001 impact

No full quality disposition is required, but WF-001 must never equate Produced and Available.
