# Data Freshness

**Document ID:** HIKARI-FM-FOUND-011  
**Status:** PROTOTYPE_BASELINE

## 1. Purpose

Define how the HIKARI prototype communicates whether production-planning information is current enough to support decisions.

## 2. Business risk

A visually correct schedule based on yesterday's information can produce a wrong operational decision.

Therefore, freshness is part of decision quality and not merely technical metadata.

## 3. Required sources

At minimum, track separately:

### Balancing
Information:
- Production Schedule;
- Hour-by-Hour Plan;
- Lots;
- scheduled timing;
- destination.

### PyMAC
Information:
- Production Orders;
- consolidated quantities and related planning context.

Other sources may be added later.

## 4. Required metadata

For each relevant source, the prototype should support:

- source name;
- business date;
- last received/updated date;
- last received/updated time;
- freshness state;
- optional expected update state.

## 5. Consolidated status

The main screen should show a compact consolidated state, for example:

**Dados atualizados · 05:51**

with progressive disclosure for source-level detail.

## 6. Source detail example

| Fonte | Informação | Última atualização | Situação |
|---|---|---|---|
| Balancing | Plano Hora-Hora | 13/08 05:42 | Atualizado |
| PyMAC | Ordens de Produção | 13/08 05:51 | Atualizado |

These values are demonstrative unless validated.

## 7. Previous-day scenario

If today's expected schedule has not been received, HIKARI must explicitly state:

**Plano de hoje ainda não recebido. Exibindo última programação disponível.**

And show:

- displayed plan business date;
- last update date/time.

The previous plan must never masquerade as today's plan.

## 8. Partial freshness

Balancing and PyMAC may have different freshness.

Example:

- Balancing updated today;
- PyMAC still previous version/day.

The UI shall allow the user to understand that the combined view may be partially stale.

## 9. Expected arrival

A future rule may define expected receipt time/SLA.

Example concept:

- expected by 05:30;
- current time 06:00;
- update not received.

The exact SLA is TBD and must not be invented.

Until a domain rule is approved, WF-001 must not display a next automatic update time, automatic-update frequency or countdown. The approved visual reference does not override this restriction.

## 10. UX severity

No red.

Use:

- neutral/current state;
- orange attention;
- iconography;
- explicit language;
- timestamp;
- source detail.

Color alone must not communicate freshness.

## 11. Prototype scenarios

The demonstrative dataset shall include:

1. both sources current;
2. Balancing stale;
3. PyMAC stale;
4. today's plan not received;
5. previous-day plan displayed;
6. source timestamps different.

## 12. Interaction

Selecting/clicking the freshness indicator should expose source-level details without forcing the user away from the Production Schedule.

## 13. Future technical implementation

This document does not define:

- polling;
- messaging;
- API health;
- integration monitoring;
- broker topics;
- retry policies;
- observability infrastructure.

Those belong to later engineering.
