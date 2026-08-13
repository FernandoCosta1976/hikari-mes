# WF-001 — Production Order Reconciliation

## 1. Purpose

Show that HIKARI understands both the granular Balancing Lots and consolidated PyMAC Production Orders.

## 2. Normal scenario

Example:

**OP 4500123 · 300 peças**

Related Lots:

- Lot 251 · 100
- Lot 252 · 100
- Lot 253 · 100

State:

**Conciliado**

## 3. Attention scenario

Example:

PyMAC:
**OP 4500123 · 300**

Balancing:
**Lots relacionados · 200**

State:

**Quantidade divergente**

The prototype must not automatically invent the missing 100 pieces.

## 4. Unmatched Lot

A Lot may exist without a correlated Production Order in a demonstrative exception.

State:

**Ordem de Produção não identificada**

## 5. Unscheduled order

A PyMAC Production Order may have no scheduled Lots.

State:

**Sem Lots no plano recebido**

## 6. UX location

Reconciliation must not dominate the timeline.

Recommended:

- small attention marker on affected Lot/summary;
- detail in contextual panel;
- optional attention rail item.

## 7. User action

WF-001 is primarily diagnostic.

The user can inspect the discrepancy.

Do not implement data correction, order editing or integration repair.

## 8. Language

Use manufacturing terms, not integration jargon.

Good:
**Quantidade da Ordem de Produção difere dos Lots programados.**

Avoid:
**Payload inconsistency detected.**
