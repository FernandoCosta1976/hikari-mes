# WF-001 — Experience Brief

**Experience:** Production Scheduling  
**UI pt-BR:** Programação da Produção  
**Operational concept:** Plano Hora-Hora  
**Version:** V0.1  
**Status:** PROTOTYPE_UX_BASELINE

## 1. Purpose

Materialize the first HIKARI operational decision experience.

The screen must allow a Foundry Supervisor, together with the Production Leader, to understand the short-term production requirement quickly enough to begin organizing execution.

It is not a generic planning dashboard.

## 2. Dominant question

> **O que precisamos produzir?**

The entire visual hierarchy shall be judged against this question.

## 3. Supporting questions

Without leaving the primary context, the experience should progressively answer:

- Para qual dia estou olhando?
- Qual área está selecionada?
- O plano está atualizado?
- Quanto precisamos produzir no turno/dia?
- Quais Lots compõem esse compromisso?
- Em qual ordem foram planejados?
- Quando cada Lot está previsto?
- Qual Production Order está associada?
- Qual o destino de cada produção?
- Existe divergência entre Balancing e PyMAC?
- Existe risco evidente de matéria-prima?
- Como o plano afeta o buffer?
- Qual é o próximo passo operacional?

## 4. Primary persona

**Foundry Supervisor**

The Supervisor is transforming a planning requirement into an executable operational context.

## 5. Supporting persona

**Production Leader**

The Leader needs the same short-term commitment and later collaborates on operational sequence and Resource assignment.

## 6. Experience narrative

The screen should communicate in this order:

**Context → Trust the data → Understand commitment → Read the timeline → Identify attention → Inspect detail → Move to readiness**

Not:

**KPIs → charts → tables → filters → technical metadata**

## 7. Key executive/operational message

For the selected Foundry area:

> “Este é o compromisso de produção recebido para hoje, estes são os Lots e horários planejados, e estas são as condições que merecem atenção antes de organizarmos a execução.”

## 8. Explicit boundary

WF-001 answers **what/when is required**.

It does not own:

- optimal sequencing;
- Resource assignment;
- production execution;
- detailed quality;
- OEE;
- detailed losses;
- maintenance management.

Those belong to subsequent experiences.

## 9. Success criteria

Within seconds, the Supervisor must be able to identify:

1. selected area;
2. plan date;
3. freshness;
4. total commitment;
5. current/next scheduled Lots;
6. main attention signals;
7. whether additional detail is required.

## 10. UX principle

HIKARI shall not replicate the source spreadsheet.

It shall preserve the operational meaning of the Hour-by-Hour Plan while providing a modern MES decision experience.
