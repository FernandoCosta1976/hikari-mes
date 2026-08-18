# WF-002 — Terminology

**Status:** WIREFRAME TERMINOLOGY CANDIDATE

Internal concepts remain standard English. UI labels use governed pt-BR where available. These labels do not create Standard MES Function Priorities.

| Internal Concept | UI Label pt-BR | Meaning in WF-002 |
|---|---|---|
| Production Readiness | Preparação da Produção | Experience that evaluates whether conditions exist to produce. |
| Resource Eligibility | Máquinas elegíveis | Structural set technically capable of producing the Material in the applicable context. |
| Resource Availability | Condição para receber o Lote no intervalo | Time-relevant operational availability evidence; not merely free now. |
| Production Tool | Molde / Ferramental | Tool required or currently associated with the production context. |
| Setup / Changeover | Setup / Troca de molde | Preparation/change required between current and required condition. |
| Material Availability | Disponibilidade de matéria-prima | Known usable material context for the Scheduled Lot. |
| Material Staging | Material preparado / Abastecimento da área | Material prepared in the relevant production context. Final operational term requires validation. |
| Maintenance Restriction | Restrição de manutenção | Known technical/maintenance condition affecting the assessed interval. |
| Capacity | Condição de capacidade | Minimum known capacity constraint context; not APS calculation. |
| Readiness Result | Resultado da preparação | Provisional explainable UX summary, not lifecycle status. |
| Current Condition | Condição atual / Agora | Observed current context. |
| Required Condition | Condição necessária para o Lote | Condition required in the Scheduled Lot interval. |
| Scheduled Lot | Lote programado | Real Lot received in the Production Schedule. |
| Scheduled Interval | Intervalo previsto | Scheduled Start → Scheduled Finish. |
| Data Freshness | Atualização dos dados | Currency and reliability context of contributing information. |
| Constraint | Restrição | Known condition affecting a potential path. |
| Attention | Atenção | Condition requiring preparation or review without automatic impediment. |
| Insufficient Information | Informação insuficiente | Missing, stale or unevaluated evidence that prevents a safe conclusion. |
| Resource Assignment | Atribuição de Recurso | Explicitly outside WF-002. |

## Priority Governance

`PRIMARY FOR WF-002`, `SECONDARY FOR WF-002`, `LATER` and `TBD` are **Experience Design Priority** labels only.

They are not `Standard MES Function Priority`. Until the Standard MES Function Catalog is available, WF-002 documentation must not claim official `CORE`, `ESSENTIAL`, priority, theme or capability classification.
