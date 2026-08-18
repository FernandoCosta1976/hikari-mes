# PERSONA-001 — Operator

**Role:** Operator  
**UI reference:** Operador  
**Layer:** Operational  
**Status:** PROTOTYPE_BASELINE

## Mission

Execute the released production safely and correctly, understand the current Lot and required quantity, register execution information and react to operational conditions according to the process.

## Primary questions

- O que preciso produzir agora?
- Qual é o Lot atual?
- Qual Material/peça?
- Quanto preciso produzir?
- Em qual Resource?
- Qual é a próxima atividade?
- Quanto já produzi?
- Existe alguma condição que impede continuar?
- Preciso registrar alguma ocorrência?

## Interaction moments

The Operator primarily enters the HIKARI journey after Dispatching. The Operator is not the primary actor for deciding the original production sequence.

Main interaction moments:

1. receive released work;
2. understand Lot and Material;
3. start execution;
4. register/confirm production;
5. identify or register an operational event;
6. pause/resume when applicable;
7. finish the Lot.

## Required information

- Lot;
- Material;
- Production Order context when useful;
- planned quantity;
- produced quantity;
- Resource;
- execution status;
- instructions/documentation when in scope;
- operational events;
- quality disposition relevant to continuation.

## Decisions/actions

- execute released work;
- confirm quantities;
- signal interruption/occurrence;
- follow authorized operational instructions.

## Must not be overloaded with

- executive OEE analysis;
- full factory buffer strategy;
- catalog governance;
- detailed planning reconciliation;
- strategic pain maps;
- architecture information.

## Experience principle

The Operator experience must minimize cognitive load and emphasize the immediate next action.

The prototype must not require the Operator to understand the entire MES architecture to execute a Lot.
