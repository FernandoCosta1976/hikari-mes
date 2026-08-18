# HIKARI Prototype — Domain and Terminology Manifesto

## 1. Purpose

This manifesto governs domain language. HIKARI must speak the language of MES and manufacturing. Codex MUST NOT invent domain terminology for convenience or visual novelty.

## 2. Language policy

Normative domain terms, code identifiers, architecture documentation, and internal technical naming are defined in English.

Prototype user-interface labels and explanatory microcopy are presented in Portuguese (Brazil), using controlled translations of normative terms.

A Portuguese UI label does not replace the normative English domain term.

## 3. Terminology authority

Terminology should be aligned, in descending order of applicability, with:

1. established MES/manufacturing architecture terminology;
2. SAP Digital Manufacturing terminology;
3. ISA-95 concepts where applicable;
4. Yamaha operational terminology when representing a real factory practice.

No Codex-generated synonym becomes normative automatically.

## 4. Term governance states

Every relevant term may be classified as:

- **NORMATIVE** — approved for architecture/domain use;
- **PROVISIONAL** — appropriate working term pending formal validation;
- **TBD** — concept known but normative terminology not yet approved;
- **PROHIBITED** — term that must not be used.

## 5. Core normative terms

The following terms are normative unless superseded by an approved decision:

### Production Order
Formal production order received from PyMAC/MRP. It may represent a consolidated daily requirement.

UI: **Ordem de Produção**.

### Production Schedule
Planned temporal production requirement/sequence received from Balancing.

UI: **Programação da Produção**.

### Short-Term Production Schedule
The short-term planning baseline relevant to the operational horizon.

UI: **Programação de Curto Prazo**.

### Lot
A real production grouping with its own identifier. In the Yamaha context, each group scheduled by Balancing may receive a real Lot identifier and be controlled through production.

UI: **Lote**.

### Material
The material/part/product being planned or produced. UI translation may use **Material** or **Peça** according to context, without changing the normative term.

### Work Center
Organizational/production-center context at which work is planned before assignment to a specific Resource.

UI: **Centro de Trabalho**.

### Resource
Specific production resource/machine/equipment on which execution occurs.

UI: **Recurso**. Where factory comprehension requires, microcopy may clarify “máquina”.

### Scheduled Quantity
Quantity planned for a schedule element/Lot.

UI: **Quantidade Programada**.

### Scheduled Start
Planned start timestamp received in the schedule.

UI: **Início Previsto**.

### Scheduled Finish
Planned finish timestamp received in the schedule.

UI: **Término Previsto**.

### Sequencing
Ordering of planned production requirements.

UI: **Sequenciamento**.

### Rescheduling
Operational reorganization/resequencing of the plan under permitted business rules.

UI: **Reprogramação** or **Reprogramar**, subject to contextual UX validation.

### Dispatching
Operational assignment/release of work for execution, including Resource allocation where applicable.

UI: **Despacho / Liberação**. Final screen wording may prioritize factory comprehension.

### Execution
Actual production execution.

UI: **Execução**.

### Production Confirmation
Production reporting/confirmation that records actual output.

UI: **Apontamento de Produção**.

### WIP
Work in Process.

UI: **Produção em Processo (WIP)** when clarification is needed.

### Setup
Preparation/changeover required to execute production. “Setup” may remain in the pt-BR UI if it matches factory usage.

### Scrap
Quantity lost as scrap.

UI: **Refugo**.

### Rework
Quantity requiring rework.

UI: **Retrabalho**.

### OEE
Overall Equipment Effectiveness.

UI: **OEE**, with Availability, Performance, and Quality translated as **Disponibilidade**, **Performance**, and **Qualidade**.

## 6. Yamaha operational term: Plano Hora-Hora

**Plano Hora-Hora** is an approved Yamaha operational expression for the visual/operational materialization of the short-term Production Schedule.

It MUST NOT replace `Production Schedule` in architecture/domain naming.

The prototype represents the Plano Hora-Hora as a continuous timeline. A Lot has quantity, sequence, Scheduled Start, and Scheduled Finish and may cross hour boundaries. Hours are visual references, not mandatory production buckets.

## 7. Sequence lineage terms

### Scheduled Sequence
Original planning baseline received from Balancing.

UI: **Sequência Planejada**.

### Dispatched Sequence
Operational sequence selected for Resource assignment/execution.

UI: **Sequência Operacional** or **Sequência Liberada**, with final UX wording validated per screen.

### Actual Sequence
Actual executed order.

UI: **Sequência Executada**.

These terms MUST remain distinct.

## 8. Buffer terms

### Finished Goods Buffer
Finished and released Foundry pieces actually available at the Foundry-to-Machining boundary.

UI: **Buffer de Peças Acabadas**.

### Produced Quantity
Quantity produced, regardless of whether it is already available downstream.

UI: **Quantidade Produzida**.

### On-Hand Quantity
Physical quantity present in inventory/buffer.

UI: **Estoque Físico** or **Quantidade Física**, depending on context.

### Reserved Quantity
Quantity committed/reserved to a specific demand destination.

UI: **Quantidade Reservada**.

### Available Quantity
Quantity effectively available for applicable consumption after relevant availability/reservation rules.

UI: **Quantidade Disponível**.

### Current Buffer Coverage
Coverage supported by currently available buffer inventory against future demand.

UI: **Cobertura Atual**.

### Projected Buffer Coverage
Coverage projected using available inventory plus applicable planned production minus future demand/consumption.

UI: **Cobertura Projetada**.

### Target Buffer Coverage
Target coverage policy. For the Foundry demonstration, approximately three days may be used as a demonstrative hypothesis. The definitive policy/granularity remains to be validated.

UI: **Meta de Cobertura**.

## 9. Demand destination terms

The concept of demand destination is confirmed, but the final normative SAP-aligned field name remains **PROVISIONAL/TBD** until formal terminology validation.

Required business values in the prototype are:

- **Final Assembly / Assembly demand** — UI: **Montagem**;
- **Replacement/Spare demand** — UI: **Reposição**;
- **Engineering demand** — UI: **Engenharia**.

Codex MUST NOT invent a new architectural term such as “HIKARI Demand Class”.

## 10. Material readiness terms

### Material Availability
Visibility of whether required raw material is available in sufficient volume for the relevant production horizon.

UI: **Disponibilidade de Matéria-Prima**.

### Material Shortage Risk
Potential insufficiency that may affect execution.

UI: **Risco de Falta de Matéria-Prima**.

## 11. Downstream terms

### Downstream Consumption
Expected consumption by the next productive area.

UI: **Consumo Projetado da Próxima Área**.

### Downstream Capacity
Expected capacity of the next productive area.

UI: **Capacidade Projetada da Próxima Área**.

These are prototype concepts for decision support; detailed calculation rules are not yet defined.

## 12. Data freshness terms

### Data Freshness
State describing how current a data source is relative to expected update behavior.

UI: **Atualização dos Dados** or concise status such as **Dados atualizados**.

### Last Updated At
Date/time of the last received/processed update.

UI: **Última atualização**.

### Expected Update Missing
Condition where the expected current update has not been received.

UI example: **Plano de hoje ainda não recebido**.

## 13. Prohibited terminology behavior

Codex MUST NOT:

- create proprietary names for standard MES objects;
- use “card”, “smart block”, “HIKARI object”, or other UI constructs as domain entities;
- rename Lot as Batch unless an approved domain decision establishes equivalence;
- collapse Production Order and Lot;
- collapse Work Center and Resource;
- collapse Produced Quantity and Available Quantity;
- collapse On-Hand and Available quantities;
- collapse scheduled, dispatched, and actual sequences;
- use “buffer health” as the normative architectural concept when `Buffer Coverage` is intended;
- invent optimization terminology that implies capabilities not validated.

## 14. Glossary change rule

Any new domain term required by implementation must first be added to the normative glossary with status and rationale. If the term is not confirmed, Codex must mark it PROVISIONAL or TBD rather than silently treating it as normative.
