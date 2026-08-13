# WF-001 — Lot Detail

## 1. Interaction pattern

Desktop recommendation: right-side contextual drawer.

The timeline remains visible behind/beside the drawer.

## 2. Header

Example:

**Lot 252**  
Material A · 100 peças

Secondary:

**16:43 → 17:48**

## 3. Sections

### Programação

- sequence position;
- Scheduled Start;
- Scheduled Finish;
- Work Center;
- destination.

### Ordem de Produção

- Production Order;
- planned quantity;
- related Lots;
- reconciliation state.

### Buffer

- current coverage;
- projected coverage;
- target/reference;
- reserved context.

### Matéria-prima

- availability state;
- risk message.

### Preparação

A concise preview only:

- Resource: **a definir**;
- readiness: **a avaliar**.

This reinforces that machine assignment happens later.

## 4. Primary next action

Recommended:

**Avaliar preparação**

This transitions to Production Readiness.

## 5. Secondary future action

When operational resequencing exists:

**Organizar sequência**

Do not place editing actions in the drawer before those experiences are designed.

## 6. No technical metadata

Do not expose source record IDs, database keys, API payloads or integration identifiers.

## 7. Drawer density

Use sections and progressive disclosure.

Do not turn the drawer into a raw record inspector.
