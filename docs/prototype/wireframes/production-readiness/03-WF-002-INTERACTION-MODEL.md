# WF-002 — Interaction Model

**Status:** CONCEPTUAL DESIGN — NO ROUTE OR IMPLEMENTATION AUTHORIZED

## Entry from WF-001

Recommended mechanism:

```text
WF-001 Lot Detail
→ Avaliar preparação
→ WF-002 with selected Scheduled Lot context
```

The transition carries stable context conceptually:

- Area;
- Scenario;
- business date;
- selected Lot;
- Schedule Version.

It must not carry a selected Resource because WF-001 does not assign one. Route shape, state transport and implementation remain outside this design phase.

## Persona Decision Flow

1. Supervisor or Leader selects a Lot in WF-001.
2. User opens **Avaliar preparação**.
3. WF-002 confirms Lot, Material, quantity, scheduled interval and commitment context.
4. User sees structurally Eligible Resources.
5. Ineligible Resources are explained concisely and removed from deeper comparison.
6. User reviews constraints and missing evidence for each Eligible Resource.
7. User compares current and required conditions where applicable.
8. User opens details only for a relevant condition.
9. User understands whether an evidenced path exists and why.
10. User returns to WF-001 or carries the assessment context into a future WF-003 experience.

No step assigns a Resource, changes sequence, confirms readiness as a production status, Dispatches, Releases or starts work.

## Shared Assessment versus Confirmation

WF-002 produces a shared, explainable assessment view. The governed documents do not establish a formal approval/confirmation workflow between Supervisor and Leader.

Therefore:

- both actors consult the same evidence;
- divergence remains visible through reasons and unknown information;
- no “Supervisor approved”, “Leader confirmed” or two-person sign-off is designed;
- any future acknowledgement action requires separate governance.

## Progressive Disclosure

### Level 1 — Readiness Summary

- selected Lot and scheduled interval;
- provisional Lot-level assessment;
- dominant constraint/attention;
- evidence freshness warning;
- number of Eligible Resources, without ranking.

### Level 2 — Resource Comparison

- unranked eligible Resource cards;
- condition summary by dimension;
- current versus required comparison;
- constraint and missing-information reasons.

### Level 3 — Condition Evidence

- exact affected dimension;
- current observation and required condition;
- source/classification;
- Observed At and Received At;
- Freshness;
- explanatory notes within the confidentiality boundary.

Level 3 must not expose APIs, payloads, schemas, event contracts, infrastructure or proprietary engineering details.

## Constraint-First Behavior

- structural ineligibility ends deeper evaluation for that Resource;
- known impediments appear before favorable secondary details;
- unknown evidence is not treated as favorable or adverse;
- attention items remain separate from business urgency;
- cards are not automatically sorted into a recommendation order.

## Explainability Pattern

Every assessment statement answers:

1. **O que?** Dimension and observed/required condition.
2. **Onde?** Scheduled Lot and Resource.
3. **Quando?** Current observation and relevant scheduled interval.
4. **Por quê?** Reason the condition matters.
5. **Confiabilidade?** Source classification and Freshness.

Example conceptual presentation:

```text
DC01 — Elegível
Atenções
- troca de molde requerida;
- material ainda não preparado no contexto da produção.
Dados de ferramenta: informação a validar.
```

The example conveys no real Yamaha condition or fixture authorization.

## Return to WF-001

WF-002 must provide a clear **Voltar ao Plano Hora-Hora** path preserving:

- Area;
- Scenario;
- Date;
- selected Lot;
- Schedule Version;
- prior WF-001 viewing context when technically practical.

Returning must not reset the demonstrative narrative or lose the selected Lot. Exact scroll/zoom restoration is a later interaction decision.

## Handoff to WF-003

The handoff occurs after the user has understood the assessment, not after a fabricated approval. Conceptual handoff:

```text
Scheduled Lot
+ Eligible Resources
+ assessed candidate context
+ constraints and reasons
+ provisional Readiness result
+ Current Resource State
→ WF-003 Resource Orchestration
```

Proposed future action label: **Continuar para organização**.

It must be accompanied by boundary text and must not be implemented before WF-003 conceptual approval and route authorization.

## Accessibility and Visual Semantics

- semantic headings and landmarks;
- keyboard-operable disclosure controls;
- visible focus and focus return;
- textual status/reason equivalents;
- no red;
- no color-only meaning;
- reduced-motion support in any future implementation;
- matrix alternatives must remain comprehensible without two-dimensional visual scanning.
