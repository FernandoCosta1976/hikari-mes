# HIKARI Normative Glossary

## Governance

This glossary is normative for prototype domain naming. English is the reference language; pt-BR is the UI translation. Status is NORMATIVE unless explicitly stated otherwise.

| Normative term | pt-BR UI | Status | Definition / rule |
|---|---|---|---|
| Productive Area | Área Produtiva | NORMATIVE | Global application context such as Foundry DC. |
| Production Order | Ordem de Produção | NORMATIVE | Formal order from PyMAC/MRP; may consolidate daily quantity. |
| Production Schedule | Programação da Produção | NORMATIVE | Planned temporal production requirement/sequence. |
| Short-Term Production Schedule | Programação de Curto Prazo | NORMATIVE | Operational-horizon schedule supplied by Balancing. |
| Lot | Lote | NORMATIVE | Real identified production grouping; not merely a visual split. |
| Material | Material / Peça | NORMATIVE | Material/part/product being planned or produced. |
| Work Center | Centro de Trabalho | NORMATIVE | Planning/production-center level before specific Resource assignment. |
| Resource | Recurso / máquina (clarification) | NORMATIVE | Specific machine/equipment used for execution. |
| Scheduled Quantity | Quantidade Programada | NORMATIVE | Quantity planned for the schedule element/Lot. |
| Scheduled Start | Início Previsto | NORMATIVE | Planned start timestamp received from Balancing. |
| Scheduled Finish | Término Previsto | NORMATIVE | Planned finish timestamp received from Balancing. |
| Sequencing | Sequenciamento | NORMATIVE | Ordering of production requirements. |
| Rescheduling | Reprogramação | NORMATIVE | Controlled operational reorganization of the planned sequence. |
| Dispatching | Despacho / Liberação | NORMATIVE | Assignment/release of work to execution, including Resource allocation where applicable. |
| Execution | Execução | NORMATIVE | Actual production execution. |
| Production Confirmation | Apontamento de Produção | NORMATIVE | Reporting/confirmation of actual production. |
| Scheduled Sequence | Sequência Planejada | NORMATIVE | Original sequence baseline from Balancing. |
| Dispatched Sequence | Sequência Operacional | NORMATIVE | Sequence organized/released for execution. |
| Actual Sequence | Sequência Executada | NORMATIVE | Sequence actually executed. |
| Setup | Setup | NORMATIVE | Changeover/preparation required for production. |
| WIP | Produção em Processo (WIP) | NORMATIVE | Work in Process. |
| Scrap | Refugo | NORMATIVE | Scrapped/lost production. |
| Rework | Retrabalho | NORMATIVE | Production requiring rework. |
| OEE | OEE | NORMATIVE | Overall Equipment Effectiveness. |
| Availability | Disponibilidade | NORMATIVE | OEE Availability component / contextual resource availability depending on scope. |
| Performance | Performance | NORMATIVE | OEE Performance component / performance domain according to context. |
| Quality | Qualidade | NORMATIVE | OEE Quality component / Quality discipline according to context. |
| Finished Goods Buffer | Buffer de Peças Acabadas | NORMATIVE | Foundry-finished/released pieces available at downstream boundary. |
| Produced Quantity | Quantidade Produzida | NORMATIVE | Quantity produced, not necessarily downstream-available. |
| On-Hand Quantity | Estoque Físico | NORMATIVE | Physical inventory quantity. |
| Reserved Quantity | Quantidade Reservada | NORMATIVE | Quantity committed to a demand destination. |
| Available Quantity | Quantidade Disponível | NORMATIVE | Quantity effectively available for applicable consumption. |
| Current Buffer Coverage | Cobertura Atual | NORMATIVE | Current temporal protection against future demand. |
| Projected Buffer Coverage | Cobertura Projetada | NORMATIVE | Future coverage after applicable planned production and future consumption. |
| Target Buffer Coverage | Meta de Cobertura | HYPOTHESIS-GRANULARITY | Target policy; Foundry demo uses ~3 days pending Yamaha validation of granularity. |
| Material Availability | Disponibilidade de Matéria-Prima | NORMATIVE | Availability/volume of raw material relevant to executing the plan. |
| Material Shortage Risk | Risco de Falta de Matéria-Prima | NORMATIVE | Potential raw-material insufficiency. |
| Downstream Consumption | Consumo Projetado da Próxima Área | NORMATIVE-CONCEPT | Expected downstream consumption; calculation deferred. |
| Downstream Capacity | Capacidade Projetada da Próxima Área | NORMATIVE-CONCEPT | Expected downstream capacity; calculation deferred. |
| Data Freshness | Atualização dos Dados | NORMATIVE | Currency of data relative to expected update behavior. |
| Last Updated At | Última atualização | NORMATIVE | Timestamp of last received/processed update. |
| Expected Update Missing | Atualização esperada não recebida | NORMATIVE | Expected current update is missing. |
| Corporate Event Service | Serviço Corporativo de Eventos | NORMATIVE | Transversal technical integration mechanism; not the Events discipline. |
| Events Discipline | Disciplina Eventos | NORMATIVE | Functional MES domain for operational events/anomalies/workflows. |

## Yamaha operational terminology

| Operational term | Architectural mapping | Rule |
|---|---|---|
| Plano Hora-Hora | Short-Term Production Schedule visualization | Approved factory-language expression. Continuous timeline; not an architectural replacement term. |

## Demand destination

The business concept and values are confirmed, but the final SAP-aligned normative field name remains PROVISIONAL/TBD.

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
