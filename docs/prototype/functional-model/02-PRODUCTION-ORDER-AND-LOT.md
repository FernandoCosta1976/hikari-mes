# Production Order and Lot Model

**Document ID:** HIKARI-FM-FOUND-002  
**Status:** PROTOTYPE_BASELINE

## 1. Purpose

Define the conceptual relationship between Production Order and Lot in the Foundry prototype.

## 2. Production Order

`Production Order` is the canonical internal term.

UI pt-BR: **Ordem de Produção**.

For the prototype, a Production Order represents the formal production requirement provided by PyMAC/MRP and may contain a consolidated quantity for a business date.

The Production Order is not sufficient by itself to express the granular operational sequence required by the Foundry.

## 3. Lot

`Lot` is a real production identifier used by Yamaha.

It is not merely a visual grouping created by the prototype.

In the Foundry, each scheduled group such as 100 + 100 + 100 receives an individual Lot identifier.

A Lot participates in the production lifecycle and must preserve traceability.

## 4. Relationship

For the prototype, support:

**one Production Order → one or more Lots**

Example:

PO-4500123  
Planned Quantity: 300

correlated with:

- Lot 251 — 100;
- Lot 252 — 100;
- Lot 253 — 100.

The sum of correlated Lot quantities should be comparable with the Production Order quantity.

## 5. Lot scheduling attributes

At minimum, a scheduled Lot may expose:

- Lot ID;
- Material;
- Quantity;
- Scheduled Start;
- Scheduled Finish;
- sequence position;
- Work Center;
- Demand Destination;
- Production Order reference;
- freshness/version context inherited from the schedule.

Resource is not required in the received Balancing schedule.

## 6. Resource assignment

A Lot is later assigned to a Resource during operational organization/Dispatching.

Therefore, `Resource` shall not be falsely populated as though it came from Balancing.

Until assigned, UI may use a neutral state such as:

**Recurso ainda não definido**

rather than inventing a machine.

## 7. Lot identity preservation

Operational resequencing changes sequence/allocation, not Lot identity.

A Lot must remain traceable across:

- received schedule;
- operational resequencing;
- Resource assignment;
- dispatch;
- execution;
- production confirmation;
- downstream availability.

## 8. Demand destination

A Lot preserves the destination supplied by Balancing.

Prototype categories:

- Montagem;
- Reposição;
- Engenharia.

These are user-facing labels. Canonical internal naming for the classification field shall remain governed by the glossary and may be PROVISIONAL until validated against the chosen SAP/MES terminology.

## 9. Prohibited simplifications

Codex must not:

- replace Lot with an arbitrary UI card ID;
- merge Lots solely because they share Material;
- assume a Lot equals a Production Order;
- assume Resource assignment is received from Balancing;
- remove destination during aggregation;
- infer a Lot quantity from visual width without explicit data.

## 10. Wireframe implications

Lot is the dominant visual unit of the Hour-by-Hour timeline.

Production Order appears as contextual/correlation information.

This hierarchy allows the user to see how a consolidated MRP requirement becomes an executable short-term schedule.
