# HIKARI MES — Use Case to Experience Map

**Status:** PROTOTYPE_BASELINE

## Operational journey

### Experience 01 — Production Scheduling
Dominant question: **O que precisamos produzir?**

Supports:
- UC-PROD-001
- UC-PROD-002

Secondary context:
- Data Freshness;
- Production Order/Lot reconciliation;
- compact buffer signal;
- compact raw-material risk.

### Experience 02 — Production Readiness
Dominant question: **Temos condições de cumprir o plano?**

Supports:
- UC-PROD-003
- UC-MAT-001
- contextual UC-BUF-001

### Experience 03 — Operational Rescheduling
Dominant question: **Essa é a melhor sequência operacional?**

Supports:
- UC-PROD-004

### Experience 04 — Dispatching
Dominant question: **Onde devemos produzir?**

Supports:
- UC-PROD-005

### Experience 05 — Execution
Dominant question: **O que está acontecendo agora?**

Supports:
- UC-EXEC-001

### Experience 06 — Buffer & Flow Projection
Dominant question: **Conseguiremos proteger o consumo dos próximos dias?**

Supports:
- UC-BUF-001
- future downstream context

## Analytical journey

### Quality
Supports UC-QUAL-001.

### Loss Analysis
Supports UC-PERF-002.

### Bottleneck / Constraints
Supports UC-PERF-003.

### Operational Efficiency
Supports UC-PERF-001.

### Production Predictability
Supports UC-EXEC-002.

## Executive principle

The Director should not navigate the operational journey as an Operator would. Executive experiences consume the evidence produced by operational use cases and summarize it around efficiency and predictability.
