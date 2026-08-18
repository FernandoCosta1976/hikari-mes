# Routing and Operation Model

**Document ID:** HIKARI-ARCH-RF-001  
**Status:** REQUIRED_DOMAIN_REINFORCEMENT

## 1. Correction

The initial shortcut `Production Order → Lot → Resource → Execution` is insufficient for a robust MES model.

## 2. Normative structure

**Production Order → Routing → Operation / Operation Activity → Work Center → Resource**

A Lot participates in execution in an Operation context.

## 3. Routing

Normative term: `Routing`  
UI pt-BR: **Roteiro de Produção**

Routing represents the manufacturing route/sequence of operations required for a Material.

WF-001 does not need to expose the Routing, but the architecture must preserve it.

## 4. Operation

Normative term: `Operation`  
UI pt-BR: **Operação**

An Operation is a manufacturing step within a Routing.

## 5. Operation Activity

SAP Digital Manufacturing uses execution-relevant Operation Activity concepts. The exact Yamaha/HIKARI mapping is not confirmed.

**Status:** PROVISIONAL / TBD mapping.

## 6. Foundry light model

A demonstrative conceptual route may be:

Production Order → Lot → Foundry Routing → Casting/Injection Operation → Foundry DC Work Center → selected Resource.

Real Yamaha names must be validated before being represented as master data.

## 7. Prohibited shortcut

Do not make Production Order-to-machine the only execution relationship. It would weaken future alternative-resource assignment, confirmations and genealogy.
