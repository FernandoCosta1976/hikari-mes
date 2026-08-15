# Executive Questions to Capabilities

| Pergunta | Capabilities contribuintes | Dados necessários | Estado | Lacuna restante |
|---|---|---|---|---|
| O que foi planejado? | 01, 02, 03 | Schedule Version, Lot, Material, quantidade, tempo, Resource programado | FULL | Fonte da escolha do Resource: BUSINESS VALIDATION REQUIRED |
| O que está sendo produzido? | 05, 07, 12 | estado de execução, Lot, Resource, tempo atual | NOT COVERED | Capabilities 05, 07 e 12 |
| Estou aderente ao plano? | 02, 07, 10 | planejado e executado comparáveis | NOT COVERED | execução e comparação |
| Qual o status da produção? | 04, 05, 07, 12 | release e ciclo de execução | PARTIAL | release demonstrativo; execução ausente |
| Onde estão os materiais? | 09 | localização e estado de WIP | NOT COVERED | modelo/localização WIP |
| Quais recursos impactam? | 03, 08, 11, 12 | Resource, conditions, eventos e desvios | PARTIAL | conditions demonstrativas; eventos ausentes |
| Por que a eficiência variou? | 08, 10, 11, 13, 14 | perdas, eventos, baseline e OEE | NOT COVERED | classificação de perdas e cálculo |
| Quanto perdi? | 08, 10, 11, 13, 14 | duração, quantidade e classificação de perda | NOT COVERED | eventos e regras de perda |
| Qualidade impactou? | 06, 07, 11, 13, 14 | total, good, rejected/scrap, disposição | NOT COVERED | quantidades e regra de qualidade |
| Quem executou? | 05, 06 | executor e vínculo temporal | NOT COVERED | identidade do operador/executor |
| Os dados estão integrados? | 01, 02, 06, 08, 13 | fontes, freshness, identidade e consolidação | PARTIAL | plano identificado; execução não integrada |

## Enabling gaps

### OEE-CRITICAL

- Good Quantity, Total Quantity, Ideal Cycle Time, Planned Production Time, Run Time e durações de downtime/eventos: **OEE BLOCKER**.
- Rejected/Scrap Quantity e Quality Impact: caminho ainda não materializado.

### DIAGNOSTIC

- Event Reason, Loss Classification e taxonomia planned/unplanned.
- Material/WIP Location e estado operacional do Resource.

### TRACEABILITY

- Operator/Executor Identification.
- Data Integration/Consolidation para fontes de execução.
