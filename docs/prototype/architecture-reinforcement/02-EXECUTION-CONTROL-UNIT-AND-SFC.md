# Execution Control Unit and SFC

**Document ID:** HIKARI-ARCH-RF-002  
**Status:** CRITICAL_TBD_BEFORE_EXECUTION_IMPLEMENTATION

## 1. Purpose

Resolve later the relationship between the real Yamaha Lot and the MES execution-control unit.

## 2. SAP reference

SAP Digital Manufacturing uses `SFC — Shop Floor Control` as an execution-control entity associated with status, Material, Order, Routing and routing steps.

## 3. HIKARI current knowledge

A PyMAC Production Order may be 300 pieces while Balancing supplies three real Lots of 100 pieces. Each Lot retains a real Yamaha identifier.

## 4. Do not assume Lot = SFC

Possible future mappings:

- one Lot = one execution-control unit;
- one Lot contains multiple execution-control units;
- another Yamaha identifier is the execution unit and Lot remains a grouping.

## 5. Prototype rule

For WF-001, WF-002 and early Dispatching, Lot remains the user-facing operational unit. No synthetic SFC identifier shall be invented.

## 6. Execution gate

Before production Execution is engineered, answer:

> What is the smallest entity that HIKARI starts, tracks, holds, resumes and completes?

This decision affects partial quantities, WIP, confirmation, rework, Hold and genealogy.
