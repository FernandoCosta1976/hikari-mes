# First Wave — OEE-Driven Capability Roadmap

Objetivo: materializar a fundação operacional necessária para calcular, explicar e disponibilizar OEE. Capability não implica tela.

| # | Capability | Prioridade | Estado atual | Contribuição OEE |
|---:|---|---|---|---|
| 01 | Receber Planejamento da Produção | CORE | MATERIALIZED | contexto planejado |
| 02 | Atualizar Alterações do Plano | ESSENCIAL | MATERIALIZED | baseline/versionamento do plano |
| 03 | Organizar Sequenciamento Operacional da Área | CORE | MATERIALIZED | sequência, Resource programado e impactos conhecidos |
| 04 | Liberar Produção | CORE | MATERIALIZED — DEMONSTRATIVE | `releasedAt`; fronteira pré-execução |
| 05 | Executar Ordens de Produção | CORE | MATERIALIZED — DEMONSTRATIVE | início, pausa, quantidade produzida e conclusão |
| 06 | Acompanhar Status / WIP / Eventos | CORE + ESSENCIAL | MATERIALIZED — DEMONSTRATIVE | estado temporal, eventos e WIP |
| 07 | Controlar Aderência / Desvios / Gargalos | ESSENCIAL | NEXT | interpretação futura dos fatos |
| 08 | Registrar Eventos Operacionais | ESSENCIAL / OEE | NOT MATERIALIZED | runtime/downtime e motivos |
| 09 | Controlar WIP | ESSENCIAL | NOT MATERIALIZED | fluxo e localização |
| 10 | Comparar Planejado × Executado | ESSENCIAL | NOT MATERIALIZED | aderência/baseline |
| 11 | Identificar Desvios Operacionais | ESSENCIAL | NOT MATERIALIZED | explicação de perdas |
| 12 | Monitorar Produção em Tempo Real | ESSENCIAL / OEE | NOT MATERIALIZED | estado corrente |
| 13 | Estruturar Fundação para Indicadores Operacionais | ESSENCIAL / OEE | PARTIAL | modelo mínimo criado; dados críticos TBD |
| 14 | Calcular e Disponibilizar OEE | OEE | NOT MATERIALIZED | Availability, Performance, Quality, OEE |

## Capability 04 — Liberação

A cena reutiliza o Lot Context Modal, Readiness e Resource programado. Estados: `NOT_RELEASED`, `READY_FOR_RELEASE`, `RELEASE_ATTENTION`, `BLOCKED_FOR_RELEASE` e `RELEASED`. A regra centralizada é demonstrativa e `BUSINESS VALIDATION REQUIRED`: readiness `READY`, Lot identificado, horário e Resource organizado permitem a ação. `BLOCKED`, `ATTENTION` e `UNKNOWN` não são liberáveis nesta demonstração.

Cada decisão preserva `lot`, `productionOrder`, `resource`, `scheduleVersion`, `releaseStatus`, `releasedAt` e `releasedBy`. `releasedBy` não representa `executedBy`.

Após a ação, o Lot recebe sinal compacto `LIBERADO` na timeline. Horário e plano não mudam, e nenhuma execução é iniciada. `Ready != Released` e `Released != Started`.

## Capability 06 — Acompanhamento

A perspectiva Acompanhamento reutiliza os fatos da execução e o Current Time único para mostrar `Scheduled != Actual`, o estado corrente das cinco DCs, progresso de quantidade, WIP materializado e eventos operacionais. A taxonomia de eventos é demonstrativa e permanece `BUSINESS VALIDATION REQUIRED`.

Os fatos não calculam aderência, gargalo, Availability, Performance, Quality ou OEE. O início real anterior ao planejado da DC04 é exibido como fato, sem interpretação.

## Congelamento e próxima capability

Capabilities 01–06 não devem continuar evoluindo salvo correção bloqueante. A próxima capability obrigatória é **07 — Controlar Aderência / Desvios / Gargalos**.
