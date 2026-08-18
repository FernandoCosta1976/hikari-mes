# Inventory and Buffer Architecture

**Document ID:** HIKARI-ARCH-RF-008  
**Status:** PROTOTYPE_ARCHITECTURE_BASELINE

## 1. Normative structure

Inventory contains concepts such as:
- On-Hand;
- Available;
- Reserved;
- Hold/Blocked;
- destination/allocation context.

HIKARI derives:
- Buffer Coverage;
- Projected Buffer Coverage.

## 2. Foundry boundary

**Foundry → Finished Goods Buffer → Machining**

Only usable Available Quantity contributes to free downstream coverage.

## 3. Destination reservation

Quantities may be reserved for:
- Montagem;
- Reposição;
- Engenharia.

Reserved Reposição/Engenharia quantities must not inflate free Montagem coverage.

## 4. Logical and effective reservation

Future scheduled production may carry logical destination commitment. When it becomes physically available, reservation is effective against physical stock.

## 5. Reallocation

Reserved stock may be exceptionally reallocated to protect Final Assembly. Approval workflow remains TBD. Original reservation and resulting exposure must remain traceable.

## 6. Current coverage

Derived from current relevant Available Quantity against future Balancing consumption.

## 7. Projected coverage

**Current Available + expected available scheduled production − future planned consumption**, considering reservations/status.

## 8. Target coverage

Approximately three days remains a demonstrative Foundry reference; definitive policy granularity remains TBD.

## 9. System of record

Production confirmation updates PyMAC and expected corporate inventory/WMS. Definitive authoritative source for HIKARI remains TBD.
