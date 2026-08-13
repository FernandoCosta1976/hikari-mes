# HIKARI Prototype — Persona / Question / Use Case / Experience Traceability

## 1. Purpose

No experience exists because it “looks useful.” Every major experience must trace to a persona, a business question, a use case, a decision, and required information.

| Persona | Business question | Use Case | Experience | Core information | Decision/outcome |
|---|---|---|---|---|---|
| Foundry Supervisor | O que precisamos produzir? | UC-PROD-001 | Programação da Produção / Plano Hora-Hora | Lots, quantity, start/finish, PO, destination, freshness | Understand production commitment |
| Supervisor / PCP | O plano corresponde às ordens? | UC-PROD-002 | Conciliação Plano × Ordens | PO total, Lot totals, divergence | Trust/reconcile planning inputs |
| Foundry Supervisor | Temos condições de produzir? | UC-PROD-003 | Production Readiness | Material, Resource eligibility, availability, setup, buffer | Determine readiness/intervention |
| Supervisor + Production Leader | Essa é a melhor sequência operacional? | UC-PROD-004 | Rescheduling | Scheduled Sequence, setup, buffer, material | Define operational sequence |
| Supervisor + Production Leader | Onde devemos produzir? | UC-PROD-005 | Dispatching | Lot, Work Center, eligible Resources, constraints | Assign Resource |
| Foundry Supervisor | Como está o buffer agora? | UC-BUF-001 | Buffer Coverage | Available, reserved, future demand | Assess current protection |
| Supervisor / Manager / Director | Se cumprirmos o plano, estaremos protegidos? | UC-BUF-002 | Projected Buffer | Available + scheduled − future consumption | Predict future protection |
| Supervisor / Planning | Quanto está reservado por destino? | UC-BUF-003 | Buffer Detail | On-hand, reserved, destination | Understand commitments |
| Cross-area authority TBD | Podemos realocar reserva para evitar parada? | UC-BUF-004 | Future reservation workflow | Reservation, Assembly risk | Cross-area reallocation; workflow TBD |
| Foundry Supervisor | Temos matéria-prima suficiente? | UC-MAT-001 | Production Readiness | Raw-material volume/risk | Prevent shortage impact |
| Foundry Supervisor | A próxima área conseguirá consumir? | UC-FLOW-001 | Downstream Projection | Machining projected capacity/consumption | Avoid imbalance |
| Production Leader | Estamos cumprindo o plano? | UC-EXEC-001 | Execution Monitoring | Scheduled/Dispatched/Actual, quantities | Intervene on deviation |
| Production Manager | Quanto perdemos? | UC-PERF-002 | Loss Analysis | Downtime, scrap, rework, speed loss | Prioritize loss reduction |
| Quality | A produção perdeu qualidade? | UC-QUAL-001 | Quality | Good, scrap, rework, blocked | Protect downstream quality |
| Manager / Engineer | Onde está o gargalo? | UC-PERF-003 | Bottleneck Analysis | Flow, capacity, WIP, deviations | Direct improvement effort |
| Director / Manager | Estamos sendo eficientes? | UC-PERF-001 / UC-OEE-001 | Executive Performance / OEE | OEE, A/P/Q, trends | Direct performance |
| Director / Manager | Vamos conseguir produzir o necessário? | UC-BUF-002 + UC-EXEC-001 | Executive Predictability | Plan, adherence, projection, buffer | Anticipate fulfillment risk |
| Any decision persona | Os dados estão atualizados? | UC-DATA-001 | Global Freshness | Balancing/PyMAC timestamps | Trust decision context |

## 2. Traceability rule

Any new screen/component with decision significance must add or reference a row in this matrix. Decorative components do not require a new use case, but must support an existing experience and must not introduce new domain meaning.
