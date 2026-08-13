# Material Availability

**Document ID:** HIKARI-FM-FOUND-007  
**Status:** PROTOTYPE_BASELINE

## 1. Purpose

Define how raw-material availability supports Foundry production decisions.

## 2. Business question

**Temos matéria-prima suficiente para executar o plano?**

## 3. Operational requirement

Supervisor and Production Leader require visibility of the volume of raw material available to work and warnings about possible risks.

The prototype shall not reduce this to a binary generic status if more useful context can be shown.

## 4. Contextual model

For a planned Material/Lot, the experience should be capable of relating:

- production requirement;
- raw-material requirement/context;
- available volume;
- risk state;
- affected Lots/commitments.

The exact BOM and conversion logic are not yet authorized for implementation.

## 5. Prototype calculation policy

If demonstrative quantities are used, they must be internally coherent and explicitly labeled as simulated.

The prototype shall not claim that a simulated raw-material calculation is the official PyMAC/MRP result.

## 6. Risk states

Possible UX states:

- Suficiente;
- Atenção;
- Risco de insuficiência;
- Informação indisponível.

No red.

A warning must explain what commitment may be affected.

## 7. Relationship with Production Readiness

Material Availability is one readiness dimension.

It may influence:

- operational sequence;
- Lot prioritization;
- Resource assignment timing;
- ability to meet shift/day commitment.

## 8. Relationship with MRP

PyMAC performs MRP/material-requirement planning.

HIKARI shall not reproduce MRP in the prototype.

HIKARI consumes or simulates the operationally relevant availability context needed to make MES decisions.

## 9. BOM

BOM information may be necessary to connect a produced Material to required inputs.

For the first prototype:

- use only the minimum demonstrative structure required;
- do not expose full proprietary BOMs;
- do not create a complete product structure unless required;
- do not expose technical detail beyond executive/operational demonstration needs.

## 10. Data freshness

Material-availability information should eventually have its own freshness context.

If freshness is not known in the first prototype, mark it as TBD rather than implying real-time accuracy.
