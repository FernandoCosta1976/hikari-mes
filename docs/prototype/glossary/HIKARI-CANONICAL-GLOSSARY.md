# HIKARI Canonical Glossary

## Governance

This glossary is normative for prototype domain naming. English is canonical; pt-BR is the UI translation. Status is CANONICAL unless explicitly stated otherwise.

| Canonical term | pt-BR UI | Status | Definition / rule |
|---|---|---|---|
| Productive Area | Área Produtiva | CANONICAL | Global application context such as Foundry DC. |
| Production Order | Ordem de Produção | CANONICAL | Formal order from PyMAC/MRP; may consolidate daily quantity. |
| Production Schedule | Programação da Produção | CANONICAL | Planned temporal production requirement/sequence. |
| Short-Term Production Schedule | Programação de Curto Prazo | CANONICAL | Operational-horizon schedule supplied by Balancing. |
| Lot | Lote | CANONICAL | Real identified production grouping; not merely a visual split. |
| Material | Material / Peça | CANONICAL | Material/part/product being planned or produced. |
| Work Center | Centro de Trabalho | CANONICAL | Planning/production-center level before specific Resource assignment. |
| Resource | Recurso / máquina (clarification) | CANONICAL | Specific machine/equipment used for execution. |
| Scheduled Quantity | Quantidade Programada | CANONICAL | Quantity planned for the schedule element/Lot. |
| Scheduled Start | Início Previsto | CANONICAL | Planned start timestamp received from Balancing. |
| Scheduled Finish | Término Previsto | CANONICAL | Planned finish timestamp received from Balancing. |
| Sequencing | Sequenciamento | CANONICAL | Ordering of production requirements. |
| Rescheduling | Reprogramação | CANONICAL | Controlled operational reorganization of the planned sequence. |
| Dispatching | Despacho / Liberação | CANONICAL | Assignment/release of work to execution, including Resource allocation where applicable. |
| Execution | Execução | CANONICAL | Actual production execution. |
| Production Confirmation | Apontamento de Produção | CANONICAL | Reporting/confirmation of actual production. |
| Scheduled Sequence | Sequência Planejada | CANONICAL | Original sequence baseline from Balancing. |
| Dispatched Sequence | Sequência Operacional | CANONICAL | Sequence organized/released for execution. |
| Actual Sequence | Sequência Executada | CANONICAL | Sequence actually executed. |
| Setup | Setup | CANONICAL | Changeover/preparation required for production. |
| WIP | Produção em Processo (WIP) | CANONICAL | Work in Process. |
| Scrap | Refugo | CANONICAL | Scrapped/lost production. |
| Rework | Retrabalho | CANONICAL | Production requiring rework. |
| OEE | OEE | CANONICAL | Overall Equipment Effectiveness. |
| Availability | Disponibilidade | CANONICAL | OEE Availability component / contextual resource availability depending on scope. |
| Performance | Performance | CANONICAL | OEE Performance component / performance domain according to context. |
| Quality | Qualidade | CANONICAL | OEE Quality component / Quality discipline according to context. |
| Finished Goods Buffer | Buffer de Peças Acabadas | CANONICAL | Foundry-finished/released pieces available at downstream boundary. |
| Produced Quantity | Quantidade Produzida | CANONICAL | Quantity produced, not necessarily downstream-available. |
| On-Hand Quantity | Estoque Físico | CANONICAL | Physical inventory quantity. |
| Reserved Quantity | Quantidade Reservada | CANONICAL | Quantity committed to a demand destination. |
| Available Quantity | Quantidade Disponível | CANONICAL | Quantity effectively available for applicable consumption. |
| Current Buffer Coverage | Cobertura Atual | CANONICAL | Current temporal protection against future demand. |
| Projected Buffer Coverage | Cobertura Projetada | CANONICAL | Future coverage after applicable planned production and future consumption. |
| Target Buffer Coverage | Meta de Cobertura | HYPOTHESIS-GRANULARITY | Target policy; Foundry demo uses ~3 days pending Yamaha validation of granularity. |
| Material Availability | Disponibilidade de Matéria-Prima | CANONICAL | Availability/volume of raw material relevant to executing the plan. |
| Material Shortage Risk | Risco de Falta de Matéria-Prima | CANONICAL | Potential raw-material insufficiency. |
| Downstream Consumption | Consumo Projetado da Próxima Área | CANONICAL-CONCEPT | Expected downstream consumption; calculation deferred. |
| Downstream Capacity | Capacidade Projetada da Próxima Área | CANONICAL-CONCEPT | Expected downstream capacity; calculation deferred. |
| Data Freshness | Atualização dos Dados | CANONICAL | Currency of data relative to expected update behavior. |
| Last Updated At | Última atualização | CANONICAL | Timestamp of last received/processed update. |
| Expected Update Missing | Atualização esperada não recebida | CANONICAL | Expected current update is missing. |
| Corporate Event Service | Serviço Corporativo de Eventos | CANONICAL | Transversal technical integration mechanism; not the Events discipline. |
| Events Discipline | Disciplina Eventos | CANONICAL | Functional MES domain for operational events/anomalies/workflows. |

## Yamaha operational terminology

| Operational term | Architectural mapping | Rule |
|---|---|---|
| Plano Hora-Hora | Short-Term Production Schedule visualization | Approved factory-language expression. Continuous timeline; not an architectural replacement term. |

## Demand destination

The business concept and values are confirmed, but the final SAP-aligned canonical field name remains PROVISIONAL/TBD.

| pt-BR value | Working English value | Status |
|---|---|---|
| Montagem | Assembly / Final Assembly demand | PROVISIONAL naming, confirmed concept |
| Reposição | Replacement / Spare demand | PROVISIONAL naming, confirmed concept |
| Engenharia | Engineering demand | PROVISIONAL naming, confirmed concept |

## Prohibited conflations

- Production Order ≠ Lot.
- Work Center ≠ Resource.
- Scheduled Sequence ≠ Dispatched Sequence ≠ Actual Sequence.
- Produced Quantity ≠ Available Quantity.
- On-Hand Quantity ≠ Available Quantity.
- Events Discipline ≠ Corporate Event Service.
- Plano Hora-Hora is not a replacement name for the architectural Production Schedule.
