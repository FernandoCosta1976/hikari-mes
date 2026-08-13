# HIKARI MES — MES Architecture Reinforcement

**Document ID:** HIKARI-ARCH-RF-000  
**Status:** PROTOTYPE_ARCHITECTURE_BASELINE

## 1. Purpose

Prevent HIKARI from becoming a visually strong but semantically weak MES. The prototype remains light, but light means implementing only the necessary subset — not removing fundamental MES concepts.

## 2. Concepts now required in the architecture

- Routing;
- Operation / Operation Activity;
- Execution Control Unit;
- Resource Orchestration;
- Production Tool;
- Setup / Changeover;
- Material Staging;
- Floor Stock;
- Release;
- Execution Status;
- Quality Disposition;
- Inventory Status;
- Schedule Version;
- Traceability / Genealogy;
- APS versus MES boundary.

## 3. Architectural layers

### Planning Layer
Balancing, long/medium/short-term planning, PyMAC/MRP and the short-term planning baseline.

### MES Operations Layer — HIKARI
Production Order contextualization, Lot control, Routing/Operation context, Readiness, Resource Orchestration, Release, Execution, Confirmation, Events, Quality, Inventory, WIP, Performance/OEE and Traceability.

### Shop-Floor / Automation Layer
Machines, controls, signals and equipment state. Technical implementation remains outside the executive prototype.

## 4. Minimal canonical chain

**Production Order → Lot → Routing → Operation / Operation Activity → Production Readiness → Resource Orchestration → Release → Execution Control Unit → Execution → Production Confirmation → Quality Disposition → Inventory State → Finished Goods Buffer → Performance / OEE / Predictability**

Not every node needs a dedicated screen.

## 5. UX rule

HIKARI may simplify what the user sees, but must preserve the correct domain underneath. An Operator may see only “Lote 252 — 100 peças — Iniciar”, while the architecture preserves Order, Operation, Resource, status and execution identity.

## 6. Terminology rule

Codex must not invent proprietary domain vocabulary when a standard MES term exists.
