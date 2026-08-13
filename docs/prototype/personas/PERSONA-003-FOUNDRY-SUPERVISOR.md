# PERSONA-003 — Foundry Supervisor

**Canonical role:** Foundry Supervisor  
**UI reference:** Supervisor da Fundição  
**Layer:** Tactical / Operational  
**Status:** PROTOTYPE_BASELINE

## Mission

Transform the short-term production requirement into an executable Foundry plan, balancing delivery commitment, buffer protection, Resource constraints, raw material, Setup and downstream flow.

## Strategic importance in prototype

The Foundry Supervisor is the principal decision persona of the first operational prototype.

## Primary questions

- O que precisamos produzir hoje?
- O que precisamos produzir neste turno?
- O plano recebido está atualizado?
- PyMAC e Balancing estão coerentes?
- Essa é a melhor sequência operacional?
- Qual Resource deve produzir cada Lot?
- Posso reduzir Setup sem comprometer o plano?
- Tenho matéria-prima suficiente?
- Quais Materials estão com buffer em risco?
- O plano de hoje recompõe o buffer?
- O que está reservado para Montagem, Reposição e Engenharia?
- A próxima área conseguirá consumir?
- Conseguiremos cumprir o compromisso do dia?

## Interaction moments

1. receive/review schedule;
2. verify freshness;
3. reconcile Production Orders and Lots;
4. assess Production Readiness;
5. assess buffer;
6. resequence Lots;
7. assign Resources with Production Leader;
8. release/dispatch;
9. monitor execution;
10. respond to deviations;
11. assess completion and projection.

## Decision factors

- shift/day quantity commitment;
- Final Assembly priority;
- Lot destination;
- buffer coverage;
- raw-material availability;
- Resource eligibility;
- Resource availability;
- mold/tooling;
- maintenance condition;
- capacity;
- previous sequence;
- Setup;
- downstream context.

## Decisions/actions

- accept operational baseline as received;
- create operational sequence without erasing baseline;
- jointly assign Resources;
- prioritize Lots;
- protect Final Assembly continuity;
- react to risks;
- evaluate projected coverage.

## Experience principle

The Supervisor should move from question to decision, not from module to module.

The core flow is:

**What must be produced → Can we produce it → How should we organize it → Where should it run → Are we meeting the commitment?**
