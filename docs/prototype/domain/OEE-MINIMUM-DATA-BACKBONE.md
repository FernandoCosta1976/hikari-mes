# OEE Minimum Data Backbone

Status: fundação conceitual demonstrativa. Nenhum OEE é calculado nesta etapa.

## Modelo mínimo

| Categoria | Campo | Estado atual |
|---|---|---|
| Production Context | businessDate, shift, productiveArea, workCenter, resource, productionOrder, lot, material | AVAILABLE |
| Production Context | operator | TBD |
| Plan | scheduledStart, scheduledFinish, plannedQuantity | AVAILABLE |
| Plan | idealCycleTime | TBD — OEE BLOCKER |
| Execution | releaseStatus, releasedAt, releasedBy, Resource, Lot, Production Order e Schedule Version | DEMONSTRATIVE após decisão de liberação |
| Execution | startedAt, stoppedAt, completedAt | TBD — não materializados |
| Production | totalQuantity, goodQuantity, rejectedQuantity, reworkedQuantity | TBD — não materializados |
| Events | eventType, start, end, duration, reason, planned/unplanned | TBD; paradas do plano não são eventos de execução |
| Derived | plannedProductionTime, runTime, downtime, idealProductionTime, availability, performance, quality, oee | TBD; nenhuma fórmula executada |

As fórmulas-alvo permanecem conceituais: Availability = Run Time / Planned Production Time; Performance = Ideal Cycle Time × Total Count / Run Time; Quality = Good Count / Total Count; OEE = Availability × Performance × Quality.

## Regras

- Fixtures são `DEMONSTRATIVE`, nunca verdade produtiva.
- Ideal Cycle Time, taxonomia de motivos, downtime, disposição de qualidade, identidade do operador e regras de tempo planejado exigem validação de negócio.
- `RELEASED != STARTED`. A Capability 04 produz somente `releasedAt` demonstrativo.
- Parada programada no Plano Hora-Hora não significa downtime, falha ou manutenção.

O modelo TypeScript independente de React está em `src/domain/oee/models.ts`.
