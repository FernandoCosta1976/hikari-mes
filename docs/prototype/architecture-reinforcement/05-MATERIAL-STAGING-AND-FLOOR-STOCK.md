# Material Staging and Floor Stock

**Document ID:** HIKARI-ARCH-RF-005  
**Status:** REQUIRED_DOMAIN_REINFORCEMENT

## 1. Problem

“Material available” is too coarse for a mature MES model.

## 2. Canonical concepts

- Material Availability;
- Material Staging;
- Floor Stock;
- Consumed Quantity.

## 3. Critical distinction

Material existing somewhere in inventory does not necessarily mean it is staged or available at the execution point.

## 4. HIKARI light semantics

### Inventory Availability
Material exists in the relevant inventory context.

### Staged Quantity
Material has been prepared/moved for production.

### Floor Stock
Material is operationally available at the shop-floor/execution context.

### Consumed Quantity
Material actually consumed during execution.

## 5. PyMAC boundary

PyMAC performs MRP. HIKARI shall not reproduce MRP.

## 6. WF-001

May continue to show a compact **Matéria-prima: suficiente / atenção** signal.

## 7. WF-002

Readiness should progressively answer whether material is available/staged/sufficient for the Lot/commitment.

## 8. Source of record

TBD. Do not assume WMS, PyMAC or HIKARI as authoritative until validated.
