# Production Execution — Minimum Demonstrative Model

Capability 05 materializa fatos de execução sem calcular OEE.

Estados: `NOT_STARTED`, `IN_PROGRESS`, `PAUSED`, `COMPLETED`.

Regras: somente `RELEASED` inicia explicitamente; `RELEASED != STARTED`; quantidade planejada não é quantidade produzida; produzido não significa bom, disponível, transferido ou aceito pela Qualidade.

Fatos produzidos: `executionStatus`, `actualStart`, `actualFinish`, `plannedQuantity`, `producedQuantity`, `resourceId`, `lotId`, `productionOrderId`, `scheduleVersionId`, `executedBy`, `pausedAt`, `resumedAt` e `pauseReason` demonstrativo.

## Fundação futura para OEE

| Dimensão | Fatos desta capability | Ainda ausente |
|---|---|---|
| Availability | Scheduled Start, Actual Start/Finish, períodos de pausa | Planned Production Time governado e taxonomia definitiva de downtime |
| Performance | Produced Quantity e tempo decorrido | Ideal Cycle Time governado |
| Quality | Nenhuma inferência | Good, rejected, scrap, rework e disposition |
