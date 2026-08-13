# WF-001 — Buffer Context

## 1. Purpose

Provide enough buffer context to improve scheduling interpretation without converting WF-001 into the full Buffer experience.

## 2. Why it matters

The Foundry does not produce only to satisfy an isolated daily order.

It protects downstream flow through a Finished Goods Buffer.

Therefore the user needs to understand whether scheduled production protects or recovers coverage.

## 3. Compact signal

For a selected Material, WF-001 may show:

**Buffer atual · 2,4 dias**  
**Após plano · 3,1 dias**  
**Meta do cenário · 3,0 dias**

All demonstrative values must be labeled.

## 4. Preferred semantics

Use:

- Cobertura atual;
- Cobertura projetada;
- Meta de cobertura.

Avoid a single ambiguous “Estoque” number.

## 5. Quantity detail

Progressive detail may expose:

- Produzido;
- Físico;
- Reservado;
- Disponível;
- produção programada;
- consumo futuro.

## 6. Reservation

Reserved Reposição/Engenharia quantity shall not inflate Montagem availability.

## 7. Visual model

Recommended compact pattern:

current coverage → projected coverage

This directly answers whether today's schedule improves or degrades protection.

## 8. Attention

Examples:

**Cobertura abaixo da referência**

or

**Plano recompõe a cobertura**

No red.

## 9. Full analysis boundary

Detailed multi-Material buffer analytics belong to the future Buffer & Flow Projection experience.

WF-001 only provides contextual evidence for the selected schedule/Lot.

## 10. Three-day target

Approximately three days is a reference scenario, not a finalized universal rule.

The UI must not state:

**Meta corporativa: 3 dias**

unless formally validated later.
