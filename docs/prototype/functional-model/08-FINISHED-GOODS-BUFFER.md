# Finished Goods Buffer

**Document ID:** HIKARI-FM-FOUND-008  
**Status:** PROTOTYPE_BASELINE

## 1. Purpose

Define the Foundry Finished Goods Buffer model and its use in operational decision support and production predictability.

## 2. Buffer boundary

The Foundry Finished Goods Buffer contains parts produced and released by Foundry that are effectively available for consumption by Machining.

Conceptual chain:

**Foundry → Finished Goods Buffer → Machining**

## 3. Quantity distinctions

The prototype must distinguish:

### Produced Quantity
Quantity physically produced/confirmed by Foundry.

### On-Hand Quantity
Physical quantity present in the relevant buffer/stock context.

### Reserved Quantity
On-hand quantity committed to a specific demand destination.

### Available Quantity
Quantity effectively available for the relevant consumption/destination after considering release and reservation rules.

Produced does not automatically mean Available.

## 4. Availability rule

A piece enters the usable buffer for coverage purposes when it is effectively available for consumption by the next area.

If produced quantity is not yet released/available, it must not inflate downstream coverage.

## 5. Current Buffer Coverage

Current coverage uses currently available quantity and future demand/consumption.

The model should use future Balancing demand rather than a simplistic average whenever the scenario data supports it.

## 6. Projected Buffer Coverage

Projected coverage considers:

- current Available Quantity;
- planned/scheduled production expected to become available;
- future consumption forecast.

Conceptually:

**Projected Availability = Current Available + Expected Available Production − Future Consumption**

The prototype may show coverage as:

- days;
- shifts;
- “protected until” timestamp/date;
- combination of these.

The final visualization is a UX decision.

## 7. Target Buffer Coverage

The reference Foundry scenario uses approximately three days as a demonstrative target.

The definitive rule regarding whether target coverage is defined by factory, area, family or Material remains subject to validation.

Therefore:

- do not hard-code three days as corporate truth;
- label the prototype target as scenario/reference where appropriate;
- keep target configurable in demonstrative state.

## 8. Decision use

Buffer supports questions:

- Qual material está protegido?
- Qual material está em risco?
- O plano de hoje recompõe o buffer?
- Se mudarmos a sequência, qual será o efeito?
- Até quando conseguiremos atender o consumo previsto?
- Estamos produzindo excesso para algo que a próxima área não consumirá?

## 9. Visual hierarchy

The first schedule wireframe may show a compact buffer context.

Detailed buffer analysis should be a separate progressive disclosure or experience.

Do not overload the Hour-by-Hour timeline.

## 10. Example demonstrative view

Material A:

- Produzido: 3,200;
- Físico no buffer: 3,800;
- Reservado Reposição: 120;
- Reservado Engenharia: 30;
- Disponível Montagem: 3,650;
- Cobertura atual: 2.6 days;
- Cobertura projetada: 3.1 days;
- Meta demonstrativa: 3.0 days.

Numbers are illustrative and must be labeled accordingly.

## 11. Downstream relationship

Buffer is a protection mechanism between Foundry output and Machining consumption.

As HIKARI expands, projected coverage should become increasingly based on native HIKARI production/consumption information across areas.
