# Persona × Business Question × Use Case × Experience Traceability

**Status:** PROTOTYPE_BASELINE

| Persona | Business Question | Use Case | Primary Experience | Decision / Action |
|---|---|---|---|---|
| Operator | O que preciso produzir agora? | UC-EXEC-001 | Execution | Execute released Lot |
| Production Leader | O que precisamos produzir neste turno? | UC-PROD-001 | Production Scheduling | Understand commitment |
| Production Leader | Onde preciso intervir agora? | UC-EXEC-001 | Execution Monitoring | Coordinate execution |
| Supervisor | O que precisamos produzir? | UC-PROD-001 | Production Scheduling | Understand day/shift plan |
| Supervisor | O plano está atualizado? | UC-PROD-001 | Production Scheduling / Freshness | Trust or challenge data |
| Supervisor / PCP | O plano corresponde às ordens? | UC-PROD-002 | Production Scheduling / Reconciliation | Trust the planning inputs |
| Supervisor | Temos condições de cumprir? | UC-PROD-003 | Production Readiness | Prepare execution |
| Supervisor + Leader | Essa é a melhor sequência? | UC-PROD-004 | Operational Rescheduling | Resequence Lots |
| Supervisor + Leader | Onde devemos produzir? | UC-PROD-005 | Dispatching | Assign Resource |
| Supervisor | Temos matéria-prima? | UC-MAT-001 | Production Readiness | Identify shortage risk |
| Supervisor | Temos peças suficientes? | UC-BUF-001 | Buffer & Projection | Protect downstream |
| Technician | O que impede a continuidade? | UC-EXEC-001 | Events / Execution | Technical intervention |
| Engineer | Onde está meu gargalo? | UC-PERF-003 | Performance | Investigate constraint |
| Engineer | Quanto perdemos? | UC-PERF-002 | Loss Analysis | Investigate loss |
| Quality | Minha produção perdeu qualidade? | UC-QUAL-001 | Quality | Assess usable output |
| Production Manager | Estamos cumprindo o plano? | UC-EXEC-001 | Managerial Monitoring | Prioritize intervention |
| Production Manager | Onde está meu gargalo? | UC-PERF-003 | Performance | Escalate constraint |
| Industrial Director | Estamos sendo eficientes? | UC-PERF-001 | Executive Cockpit | Direct attention |
| Industrial Director | Conseguiremos cumprir? | UC-EXEC-002 | Predictability | Anticipate risk |

## Mandatory gate

Before a wireframe is authorized, every dominant component must be traceable to at least one row in this matrix or a newly governed row.
