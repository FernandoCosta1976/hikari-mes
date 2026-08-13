# HIKARI MES — Foundry Functional and Operational Model

**Document ID:** HIKARI-FM-FOUND-000  
**Status:** PROTOTYPE_BASELINE  
**Scope:** Executive navigable prototype — Foundry reference scenario  
**Canonical language:** English for domain/architecture; pt-BR for prototype UI  
**Normative dependencies:** Prototype Governance Manifestos, Canonical Glossary, Decision Governance

---

## 1. Purpose

This document establishes the functional and operational model for the Foundry reference scenario of the HIKARI MES prototype. It is not a production-system technical specification and shall not be interpreted as a final architecture, integration contract, physical data model, API specification, event contract, or implementation commitment.

The purpose is to define enough domain behavior to design and validate the first navigable experiences of HIKARI, beginning with the reception and operationalization of the short-term production schedule.

The model must support the business questions:

- O que precisamos produzir?
- Quando está previsto produzir?
- Qual é o compromisso do turno e do dia?
- Essa é a melhor sequência operacional?
- Temos condições de produzir?
- Em qual recurso devemos produzir?
- Temos matéria-prima suficiente?
- Como está o buffer de peças acabadas?
- Se cumprirmos o plano, como ficará o buffer?
- A próxima área conseguirá consumir o que produziremos?
- Estamos cumprindo o plano?
- Quanto produzimos?
- Quanto está realmente disponível para consumo?
- Quanto foi reservado para Montagem, Reposição ou Engenharia?
- Estamos sendo eficientes?
- Quanto perdemos?
- Nossa produção perdeu qualidade?
- Onde está o gargalo?
- Conseguiremos atender os próximos dias?

The first wireframe shall focus on the first group of these questions and shall not attempt to answer all of them on a single screen.

---

## 2. Industrial context

The Foundry is positioned at the beginning of an important manufacturing flow:

**Foundry → Machining → Aluminum Painting → Engine Assembly → Final Assembly**

The Foundry produces injected parts/components that will be consumed by downstream processes before reaching Final Assembly.

The reference factory produces approximately 1,400 motorcycles per day. The Foundry uses a finished-goods buffer strategy to protect downstream consumption. A reference value of approximately three days has been discussed for the Foundry scenario; however, the definitive governance and granularity of the target buffer policy remain subject to validation.

No prototype component may present the three-day value as an immutable corporate rule.

---

## 3. Planning context

The planning chain is conceptually:

**Long/Medium/Short-Term Planning → Balancing → PyMAC/MRP → HIKARI MES → Production**

Balancing provides the short-term production sequence and already provides scheduled production units/lots with:

- Lot identifier;
- material/model;
- quantity;
- sequence;
- scheduled start;
- scheduled finish;
- production destination/category;
- Work Center/line context.

PyMAC/MRP provides Production Orders and may consolidate daily requirements.

A Production Order of 300 pieces may therefore correlate with multiple real Lots of 100 pieces each.

HIKARI shall preserve both views:

- the consolidated Production Order commitment;
- the granular Lot-based short-term schedule.

HIKARI shall not silently replace the Balancing schedule with the PyMAC order sequence.

---

## 4. Hour-by-Hour Plan

The Yamaha operational concept known as **Plano Hora-Hora** shall be represented as the pt-BR operational view of the short-term Production Schedule.

It is not modeled as rigid one-hour buckets.

Each Lot has a scheduled start and scheduled finish and may cross hour boundaries.

Example:

- Lot 252;
- quantity 100;
- scheduled start 16:43;
- scheduled finish 17:48.

Hour markers are visual references on a continuous production timeline.

---

## 5. Operational autonomy

The Balancing sequence is a planning baseline.

Foundry Supervisor and Production Leader may determine the operational production sequence within the shift/day, provided the required quantities and commitments are fulfilled and the finished-goods buffer is protected.

Operational resequencing may consider:

- eligible Resources;
- Resource availability;
- installed mold/tooling;
- capacity;
- maintenance condition;
- previous sequence;
- Setup reduction;
- raw-material availability;
- buffer condition;
- downstream consumption/capacity context.

The prototype shall preserve lineage:

**Scheduled Sequence → Dispatched Sequence → Actual Sequence**

A changed operational sequence must never overwrite or erase the received baseline.

---

## 6. Work Center and Resource responsibility

Balancing schedules the Lot at the Foundry/line/Work Center level.

Balancing does not select the specific machine/Resource.

Resource assignment is performed later by the Foundry Supervisor together with the Production Leader.

Therefore:

- Production Scheduling answers primarily **what/when is required**;
- Production Readiness answers **whether conditions exist**;
- Rescheduling supports **how the operational sequence should be organized**;
- Dispatching answers **where and when the Lot is released for execution**;
- Execution records **what actually happened**.

---

## 7. Buffer model

The Foundry Finished Goods Buffer contains parts already produced, released and effectively available for consumption by Machining.

The model must distinguish at least:

- Produced Quantity;
- On-Hand Quantity;
- Available Quantity;
- Reserved Quantity;
- Current Buffer Coverage;
- Projected Buffer Coverage;
- Target Buffer Coverage.

Produced Quantity is not automatically Available Quantity.

Only pieces effectively available for downstream consumption contribute to available buffer coverage.

Projected coverage considers:

**current available inventory + scheduled/expected available production − future consumption forecast**

Future consumption must use Balancing demand rather than a simplistic historical average whenever the required data is available in the prototype scenario.

---

## 8. Demand destination

Balancing provides the production destination/category.

The prototype shall distinguish at least:

- Final Assembly / production-chain demand;
- Spare Parts;
- Engineering.

Final Assembly is the primary operational priority.

Spare Parts and Engineering quantities may physically enter the same Finished Goods Buffer but remain logically/physically reserved by destination.

The prototype shall distinguish:

- total physical stock;
- quantity available to protect assembly flow;
- reserved Spare Parts quantity;
- reserved Engineering quantity.

A reservation begins logically in planning and becomes effective when the produced quantity is physically available in the buffer.

Reserved quantities may exceptionally be reallocated to protect Final Assembly continuity. The approval workflow and organizational authority are not yet confirmed and must remain TBD.

---

## 9. Raw-material visibility

Supervisor and Production Leader require visibility of the raw-material volume available to execute the schedule and must receive warnings about possible shortage risks.

The first prototype shall not implement MRP.

It shall simulate sufficient information to answer:

**“Há matéria-prima suficiente para executar o compromisso do turno/dia?”**

A risk shall be contextualized against affected Materials/Lots rather than shown as an isolated generic alert.

---

## 10. Downstream context

HIKARI is expected to evolve toward quantitative visibility of downstream capacity and consumption.

For the Foundry reference scenario, the prototype may simulate Machining consumption/capacity information to support the question:

**“Se produzirmos esta quantidade, a próxima área conseguirá consumir e qual será o efeito no buffer?”**

This is a future HIKARI native capability, not an integration promise with an unspecified external system.

Real-time downstream operational condition is future evolution and shall not block the first wireframe.

---

## 11. Data freshness

Production decisions must never be presented without information freshness.

At minimum, the prototype must preserve freshness separately for:

- Balancing Production Schedule;
- PyMAC Production Orders.

The user must be able to see:

- business date of the plan/order information;
- date and time of last update;
- consolidated freshness state;
- source-level freshness details when requested.

If the expected current-day information has not been received, HIKARI must explicitly state that the previous available information is being displayed.

Stale data must never be silently represented as current.

The exact expected-arrival SLA remains TBD.

---

## 12. Functional experience boundaries

The first Foundry journey is decomposed into:

1. **Production Scheduling — Programação da Produção**
   - dominant question: “O que precisamos produzir?”

2. **Production Readiness — Preparação para Produção**
   - dominant question: “Temos condições de cumprir o plano?”

3. **Operational Rescheduling**
   - dominant question: “Essa é a melhor sequência operacional?”

4. **Dispatching**
   - dominant question: “Onde e como vamos liberar para produção?”

5. **Execution**
   - dominant question: “O que está acontecendo agora?”

6. **Buffer and Flow Projection**
   - dominant question: “Conseguiremos proteger o consumo dos próximos dias?”

Later experiences include adherence, losses, quality, bottlenecks, performance and OEE.

---

## 13. Prototype rule

The prototype is HIGH-FIDELITY VISUAL and LOW-FIDELITY BACKEND.

All functional behavior described here may be simulated in isolated frontend state.

No document in this functional-model package authorizes:

- production persistence;
- external integration;
- production database changes;
- API contracts;
- event payloads;
- physical architecture;
- automatic optimization algorithms.

---

## 14. Wireframe authorization criteria

Wireframe WF-001 may begin when it can represent, without ambiguity:

- productive-area context;
- business date;
- data freshness;
- Hour-by-Hour Plan as continuous timeline;
- Lot;
- Material;
- Quantity;
- Scheduled Start/Finish;
- destination;
- Production Order correlation;
- daily/shift commitment;
- current and projected buffer context;
- raw-material risk context;
- demonstrative-data labeling.

Open implementation details must remain TBD rather than being invented.
