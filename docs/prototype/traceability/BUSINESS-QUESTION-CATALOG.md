# HIKARI MES — Business Question Catalog

**Status:** PROTOTYPE_BASELINE

The HIKARI experience architecture is question-driven.

| ID | Business Question | Primary Persona | Decision Horizon |
|---|---|---|---|
| BQ-001 | O que precisamos produzir? | Supervisor | Today / Shift |
| BQ-002 | O plano está atualizado? | Supervisor | Now |
| BQ-003 | Temos condições de cumprir o plano? | Supervisor | Shift / Day |
| BQ-004 | Essa é a melhor sequência operacional? | Supervisor + Leader | Shift |
| BQ-005 | Onde devemos produzir? | Supervisor + Leader | Immediate |
| BQ-006 | Temos matéria-prima suficiente? | Supervisor | Shift / Day |
| BQ-007 | Temos peças suficientes para proteger a cadeia? | Supervisor | Days / Shifts |
| BQ-008 | O que preciso produzir agora? | Operator | Immediate |
| BQ-009 | Estamos cumprindo o plano? | Leader / Manager | Shift / Day |
| BQ-010 | Quanto perdemos? | Manager / Engineer | Shift / Day / Trend |
| BQ-011 | Minha produção perdeu a qualidade? | Quality | Immediate / Shift |
| BQ-012 | Onde está meu gargalo? | Manager / Engineer | Operational / Trend |
| BQ-013 | Estamos sendo eficientes? | Industrial Director | Executive |
| BQ-014 | Conseguiremos cumprir os próximos compromissos? | Industrial Director | Predictive |
| BQ-015 | A próxima área conseguirá consumir? | Supervisor | Future HIKARI |
| BQ-016 | Onde preciso intervir agora? | Leader / Manager | Immediate |

## Rule

UI titles may use concise labels, but the dominant business question must remain explicit in experience specifications and traceability.

## Open domain-question traceability

| Domain Question | Related Business Questions | Status | Constraint |
|---|---|---|---|
| [DQ-WF001-001-PARALLEL-SCHEDULE](../domain-questions/DQ-WF001-001-PARALLEL-SCHEDULE.md) | BQ-001, BQ-003, BQ-004, BQ-005 | TBD | Production Schedule does not imply Resource Assignment; DC01–DC05 must not be inferred as WF-001 lanes. |
