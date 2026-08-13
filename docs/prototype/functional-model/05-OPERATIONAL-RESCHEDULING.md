# Operational Rescheduling

**Document ID:** HIKARI-FM-FOUND-005  
**Status:** PROTOTYPE_BASELINE

## 1. Purpose

Define how HIKARI represents the Foundry's operational freedom to reorganize Lots without losing the Balancing baseline.

## 2. Dominant question

**Essa é a melhor sequência operacional para cumprir o compromisso?**

## 3. Actors

Primary:

- Foundry Supervisor;
- Production Leader.

## 4. Confirmed operating principle

Supervisor and Production Leader may change the operational sequence within the shift/day.

They must preserve the required production commitments and protect the Finished Goods Buffer.

Exact Scheduled Start from Balancing is a planning reference and not, by itself, a rigid execution constraint for the Foundry.

## 5. Decision factors

Operational resequencing may consider:

- quantity commitment;
- Final Assembly priority;
- buffer coverage;
- raw-material availability;
- eligible Resources;
- Resource availability;
- installed mold/tooling;
- capacity;
- maintenance;
- previous Lot;
- Setup reduction;
- downstream consumption/capacity.

## 6. Sequence lineage

The prototype shall preserve three concepts:

### Scheduled Sequence
Original baseline received from Balancing.

### Dispatched Sequence
Operational sequence established for execution/Resources.

### Actual Sequence
What actually occurred.

A user action shall never mutate the Scheduled Sequence in place.

## 7. Setup reduction

Setup reduction is a legitimate operational objective.

The operation may group compatible Lots to reduce mold/tooling changes when doing so does not compromise higher-priority commitments.

HIKARI may show Setup implications as decision context.

The prototype shall not claim to calculate a mathematically optimal Setup sequence.

## 8. Impact preview

Before confirming a demonstrative resequencing action, the UX should be capable of showing relevant impacts such as:

- shift/day commitment;
- buffer projection;
- destination priority;
- raw-material risk;
- Setup change;
- downstream effect.

Not every impact needs to be implemented in the first wireframe, but the interaction architecture shall allow progressive inclusion.

## 9. Governance

Resequencing by Supervisor/Leader is confirmed for the prototype scenario.

Other actions, such as reallocating reserved Spare Parts/Engineering stock to Final Assembly, may require cross-area alignment and remain TBD.

Do not merge those governance models.

## 10. Auditability concept

The prototype should preserve enough demonstrative state to show:

- original position;
- new position;
- actor/persona context;
- reason, if included;
- impact.

No production audit trail or persistence is required.

## 11. Prohibited behavior

Codex shall not:

- overwrite the Balancing baseline;
- label every schedule deviation as failure;
- automatically resequence without an explicit prototype scenario;
- invent approval workflows;
- hide impact on priority demand.
