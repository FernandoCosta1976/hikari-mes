# Production Readiness

**Document ID:** HIKARI-FM-FOUND-004  
**Status:** PROTOTYPE_BASELINE

## 1. Purpose

Define the decision-support layer used before Lots are released to execution.

## 2. Dominant question

**Temos condições de cumprir o plano?**

## 3. Primary actors

- Foundry Supervisor;
- Production Leader.

Supporting roles may include:

- Technician;
- Maintenance-related roles;
- Quality;
- Materials/logistics roles;
- Engineering.

The prototype shall not invent organizational approval authority.

## 4. Readiness dimensions

For the Foundry reference scenario, readiness may consider:

### 4.1 Material Availability
Is sufficient raw material available for the planned commitment?

### 4.2 Resource Eligibility
Which machines are technically capable of producing the part?

### 4.3 Resource Availability
Which eligible Resources are operationally available?

### 4.4 Tooling / Mold
Is the required mold/tooling available or already installed?

### 4.5 Capacity
Can the selected Resource support the required production?

### 4.6 Maintenance Condition
Is there a known maintenance condition that affects assignment?

### 4.7 Setup
What Setup impact results from the chosen sequence/Resource?

### 4.8 Buffer Context
Which Materials require protection or replenishment?

### 4.9 Downstream Context
Will downstream consumption/capacity support the planned output?

## 5. Decision-support principle

HIKARI shall support the decision; it shall not pretend to provide an optimal schedule unless an approved optimization capability exists.

Prototype language should use:

- recomendado;
- elegível;
- restrição;
- risco;
- impacto;
- contexto.

Avoid:

- “sequência ótima”;
- “melhor máquina garantida”;
- “decisão automática”;

unless such capability is explicitly approved later.

## 6. Readiness state

The prototype may use a compact state model such as:

- Pronto;
- Atenção;
- Com restrição;
- Informação indisponível.

These are UX states, not yet normative production-system statuses.

No red color shall be used.

## 7. Explainability

Any readiness warning must answer:

- what is affected;
- why it matters;
- which Lot/Material is affected;
- what information is missing or constrained.

A generic “Não pronto” without explanation is insufficient.

## 8. Relationship with Scheduling

Production Scheduling answers what is required.

Production Readiness enriches the schedule with execution feasibility context.

It must not silently modify the received schedule.

## 9. Relationship with Dispatching

Readiness information is input to Supervisor/Leader Resource assignment and operational resequencing.

A readiness view may precede or be contextually embedded into Dispatching, but its business question must remain distinct.

## 10. Prototype exclusions

Do not implement:

- detailed finite-capacity scheduling engine;
- automatic optimization;
- predictive maintenance;
- complete BOM explosion;
- MRP calculation;
- real maintenance integration;
- real WMS integration.

Use coherent demonstrative states.
