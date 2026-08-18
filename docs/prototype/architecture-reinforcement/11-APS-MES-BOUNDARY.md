# APS–MES Boundary

**Document ID:** HIKARI-ARCH-RF-011  
**Status:** NORMATIVE_BOUNDARY

## 1. Purpose

Prevent HIKARI from unintentionally becoming an APS.

## 2. Planning side

Balancing is responsible for long/medium/short-term planning and supplies the short-term Production Schedule baseline, including Lot sequence and scheduled timing.

PyMAC/MRP is responsible for Production Orders and material-requirement planning.

## 3. HIKARI MES side

HIKARI is responsible for:
- receiving/preserving the baseline;
- Production Order/Lot correlation;
- Readiness;
- shop-floor operational resequencing;
- Resource Orchestration;
- Resource Assignment;
- Dispatching;
- Release;
- Execution;
- Monitoring;
- Confirmation;
- Events;
- Quality;
- WIP;
- Inventory/Buffer visibility;
- Performance/OEE;
- operational projection.

## 4. Operational resequencing

Supervisor/Leader may adjust Lot order inside the shift/day based on real shop-floor conditions. This is not global production-plan optimization.

## 5. Projection versus prediction

Wave 1 may derive deterministic operational projections from schedule, current inventory/buffer and execution state.

Do not call this predictive AI or advanced predictive scheduling.

## 6. Architectural phrase

> HIKARI operationalizes and orchestrates shop-floor execution of the planning baseline; it does not replace enterprise planning or APS.
