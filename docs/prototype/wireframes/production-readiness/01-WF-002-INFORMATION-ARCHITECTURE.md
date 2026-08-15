# WF-002 — Information Architecture

**Status:** CONCEPTUAL DESIGN APPROVED

## Information Hierarchy

### 1. Experience Context

- Área Produtiva: Fundição DC;
- Scenario and explicit **Cenário demonstrativo** classification when applicable;
- business date and shift context;
- Schedule Version;
- selected Lot position in the received plan;
- compact source/freshness summary.

### 2. Selected Scheduled Lot

- Lot;
- Material;
- Scheduled Quantity;
- Início Previsto and Término Previsto;
- Centro de Trabalho;
- destination: Montagem, Reposição or Engenharia;
- Production Order correlation;
- compact Buffer/Operational Attention context.

Destination and Buffer describe business priority or urgency unless a governed rule explicitly makes them readiness conditions.

### 3. Readiness Summary

The summary answers whether there is an evidenced production path and exposes:

- provisional Lot-level result;
- count of structurally Eligible Resources;
- count of Resources with sufficient evidence to continue;
- dominant constraints;
- missing or stale information;
- relevant assessment time.

No count may be presented as ranking or recommendation.

### 4. Structural Eligibility

Show Eligible Resources first. Ineligible Resources may appear in a collapsed explanatory group or concise exclusion summary. Once a Resource is structurally ineligible for the selected Material/context, deeper operational dimensions need not dominate the view.

Eligibility must retain the demonstrative classification when it comes from the approved WF-001 projection.

### 5. Resource Condition Comparison

For each Eligible Resource, present only relevant dimensions:

- Current Resource State;
- Resource Availability for the Scheduled Lot time context;
- current and required Production Tool;
- Setup / Changeover implication;
- maintenance/technical restriction;
- Material Availability and Material Staging;
- minimum capacity context;
- other governed restriction.

### 6. Restrictions and Attention

Group decision-relevant reasons, not generic alerts:

- condition affected;
- Resource and Lot affected;
- why it matters;
- applicable time;
- source/freshness;
- whether information is missing rather than adverse.

### 7. Handoff

The handoff exposes the assessment context for a later WF-003 experience. Proposed future label: **Continuar para organização** with supporting text **“Nenhum Recurso será atribuído nesta etapa.”**

This label requires Product Owner approval and an authorized WF-003 route before implementation. It is not a readiness confirmation or execution authorization.

## Current versus Required

Every temporal operational condition must distinguish:

| Perspective | Question |
|---|---|
| Current condition | O que está observado agora? |
| Required condition | O que o Lot exigirá no horário programado? |
| Assessment | Qual diferença ou restrição precisa ser considerada? |

Example concept only:

```text
Molde atual: [observação]
Molde requerido: [requisito]
Implicação: troca necessária / mesma configuração / informação insuficiente
```

No real tool value or changeover time is authorized.

## Cognitive-Load Rules

- lead with constraints and missing evidence;
- avoid a spreadsheet-like full matrix as the default view;
- do not repeat dimensions eliminated by structural ineligibility;
- keep Lot and scheduled-time context visible while comparing Resources;
- use concise Resource summaries and detail on demand;
- never use color as the only status carrier;
- never use red;
- do not rank cards spatially as “best to worst”.

## Principal Visualization Options

| Option | Strength | Main limitation | Decision |
|---|---|---|---|
| Matrix | Fast cross-Resource field comparison | Becomes a dense digital spreadsheet; weak narratives and freshness detail | Secondary comparison only |
| Resource Cards | Strong Resource-level explanation and responsive behavior | Cross-column scanning is slower | Recommended foundation |
| Constraint-first | Quickly removes irrelevant Resources and prioritizes impediments | Needs a stable route to full evidence | Recommended interaction principle |
| Hybrid | Summary + constraint-first cards + optional compact comparison | Requires disciplined progressive disclosure | RECOMMENDED |

## Recommended Visualization

A hybrid, constraint-first experience:

1. sticky/compact selected-Lot context;
2. Lot Readiness Summary;
3. structural Eligibility strip;
4. unranked Resource cards for eligible Resources;
5. compact comparison only when multiple eligible Resources need scanning;
6. restrictions and missing-information summary;
7. handoff to future WF-003.

The experience compares evidence without choosing a machine.
