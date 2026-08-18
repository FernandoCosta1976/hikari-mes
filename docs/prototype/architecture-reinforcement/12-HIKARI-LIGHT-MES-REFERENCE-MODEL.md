# HIKARI Light MES Reference Model

**Document ID:** HIKARI-ARCH-RF-012  
**Status:** NORMATIVE_PROTOTYPE_REFERENCE

## 1. Planning inputs

- Production Schedule — Balancing;
- Production Order — PyMAC;
- Material/BOM context — external/governed, source TBD.

## 2. Core master/context objects

- Material;
- Production Order;
- Lot;
- Routing;
- Operation / Operation Activity;
- Work Center;
- Resource;
- Production Tool.

## 3. Operational capabilities

### Production Scheduling
Understand the baseline.

### Production Readiness
Evaluate execution conditions.

### Resource Orchestration
- Resource Eligibility;
- Resource Availability;
- Production Tool context;
- Setup/Changeover;
- operational Rescheduling;
- Resource Assignment;
- Dispatching.

### Release
Formal authorization to execute.

### Execution
Start, progress, Hold/Resume where applicable, Complete.

### Production Confirmation
Record production execution/output.

### Material Execution
Material Staging, Floor Stock and Consumption where needed.

### Quality
Disposition and usable-output determination.

### Inventory
Available, Reserved, Hold/Blocked.

### Buffer
Current and Projected Coverage.

### Monitoring
WIP, events, adherence and deviations.

### Performance
Availability, Performance, Quality, OEE and losses.

### Traceability
Lot/Operation/Resource/Material history.

## 4. High-level flow

Balancing Schedule + PyMAC Production Orders
→ Production Scheduling
→ Production Readiness
→ Resource Orchestration
→ Release
→ Execution
→ Production Confirmation
→ Quality / Inventory State
→ Finished Goods Buffer
→ Monitoring / Performance / Predictability

## 5. Light rule

Include concepts necessary for domain correctness and future compatibility, but deliberately exclude vendor configuration complexity.
