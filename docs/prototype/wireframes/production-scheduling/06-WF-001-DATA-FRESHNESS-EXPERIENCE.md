# WF-001 — Data Freshness Experience

## 1. Purpose

Make data trust visible without turning the screen into an integration monitor.

## 2. Compact state

Recommended placement: Page Context area, close to business date.

Example:

**Dados atualizados · 05:51**

with an icon and interaction.

## 3. Progressive detail

On selection, show source-level detail:

### Balancing
Plano Hora-Hora  
Data do plano: 13/08/2026  
Última atualização: 13/08/2026 05:42

### PyMAC
Ordens de Produção  
Data de referência: 13/08/2026  
Última atualização: 13/08/2026 05:51

Values are demonstrative unless validated.

## 4. Stale scenario

If current-day Balancing information has not arrived:

**Plano de hoje ainda não recebido**

Supporting text:

**Exibindo a última programação disponível: 12/08/2026 · atualização 22:14.**

The screen may still show the previous plan, but its date must remain explicit.

## 5. Partial freshness

Example:

**Atenção · fontes com atualizações diferentes**

Detail:

- Balancing: atual;
- PyMAC: atualização anterior.

## 6. Visual severity

No red.

Use neutral + orange attention.

Use explicit language and timestamps.

## 7. Do not expose

- endpoint;
- API status;
- queue;
- broker;
- retry;
- HTTP code;
- technical log.

## 8. Decision implication

When stale data affects confidence, the UI must say what is uncertain.

Example:

**A programação exibida pode não refletir a última necessidade do dia.**

Avoid technical jargon.

## 9. SLA

Do not display “atrasado X minutos” against an expected-arrival SLA until the SLA is formally defined.

Do not display “próxima atualização automática”, an automatic-update frequency or a countdown until a governing domain rule exists. Preserve only source, information date, last reception/update timestamp and current/stale state.
