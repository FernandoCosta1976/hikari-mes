# Downstream Consumption and Capacity Context

**Document ID:** HIKARI-FM-FOUND-010  
**Status:** PROTOTYPE_FUTURE_CAPABILITY

## 1. Purpose

Define the role of downstream consumption/capacity information in Foundry decision support without overcommitting the first prototype.

## 2. Chain context

Reference flow:

**Foundry → Machining → Aluminum Painting → Engine Assembly → Final Assembly**

The Foundry is at the beginning of the chain and produces parts that will be consumed later by downstream areas.

## 3. Business question

**Se produzirmos esta quantidade, a próxima área conseguirá consumir e qual será o efeito no buffer?**

## 4. Required future capability

HIKARI should evolve to provide a quantitative view of the next area's planned capacity/consumption.

Example demonstrative logic:

- Foundry projected output: 1,200;
- Machining projected consumption: 900;
- projected buffer variation: +300.

Or:

- Foundry projected output: 800;
- Machining projected consumption: 1,100;
- projected buffer variation: -300.

## 5. Source strategy

The user has established that, in the future, HIKARI itself should provide this information as more areas are incorporated into the program.

Therefore, the prototype shall not invent an external source for this future capability.

## 6. First prototype use

For the Foundry demo, downstream capacity/consumption may be represented using simulated HIKARI scenario data.

It must be labeled demonstrative.

## 7. Real-time downstream condition

Future evolution may include:

- current downstream production state;
- downtime;
- reduced capacity;
- operational restrictions.

This is not required for the first wireframe and remains future scope.

## 8. Decision-support use

Downstream context may later influence:

- resequencing;
- buffer replenishment;
- production prioritization;
- excess prevention;
- shortage prevention;
- predictability.

## 9. Boundary

HIKARI shall not be presented as a full APS solely because it exposes downstream context.

The capability exists to improve MES operational decision support and cross-area flow visibility.

## 10. Executive relevance

As HIKARI expands across areas, downstream visibility becomes a foundation for the Director's predictability question:

**“Conseguiremos produzir e sustentar o fluxo necessário para atender a fábrica?”**
