# WF-001 — Demonstrative Scenarios

## 1. Purpose

Provide coherent prototype states that can later connect into the end-to-end HIKARI demonstration.

All values below are demonstrative unless replaced by validated data.

## 2. Scenario A — Normal current plan

Area:
**Fundição DC**

Business date:
**13/08/2026**

Balancing updated:
**05:42**

PyMAC updated:
**05:51**

Production Order:
**OP 4500123 · 300 peças**

Lots:
- Lot 251 · Material A · 100 · 15:38–16:43 · Montagem
- Lot 252 · Material A · 100 · 16:43–17:48 · Montagem
- Lot 253 · Material A · 100 · 17:48–18:53 · Montagem

Add additional Lots to make the daily timeline realistic without exposing proprietary real production data.

Expected state:
reconciled.

## 3. Scenario B — Destination reservation

Add:

- Lot 254 · Material B · 100 · Reposição
- Lot 255 · Material C · 100 · Engenharia

The UI must make destination visible.

Their future quantities must not be counted as freely available Montagem stock.

## 4. Scenario C — Buffer recovery

Material A:

- current available buffer: demonstrative low state;
- current coverage: 2.4 days;
- scheduled production increases projected coverage;
- projected coverage: 3.1 days;
- scenario target: 3.0 days.

Narrative:

**“O buffer está abaixo da referência agora, mas o plano de hoje recompõe a cobertura.”**

## 5. Scenario D — Raw-material risk

Material D has insufficient/at-risk raw material for a later Lot.

Narrative:

**“Existe risco antes da execução; o Supervisor consegue vê-lo ainda na programação.”**

## 6. Scenario E — Reconciliation mismatch

PyMAC:
300 pieces.

Balancing correlated Lots:
200 pieces.

HIKARI shows:

**Quantidade divergente**

No automatic correction.

## 7. Scenario F — Previous-day plan

Today plan not received.

HIKARI shows the last available schedule with explicit previous date and timestamp.

Narrative:

**“A plataforma não deixa uma programação antiga parecer atual.”**

## 8. Scenario G — Transition to next experience

Supervisor selects Lot 252.

Lot Detail shows:

- Resource: a definir;
- readiness: a avaliar;
- buffer;
- material context.

User selects:

**Avaliar preparação**

This becomes the entry point to the next wireframe.

## 9. Scenario consistency

The same Lot IDs, Materials, quantities and Production Orders must remain consistent across subsequent prototype screens.

Do not create disconnected demo datasets per screen.
