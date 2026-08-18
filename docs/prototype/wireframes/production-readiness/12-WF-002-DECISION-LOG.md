# WF-002 — Decision Log

**Status:** WIREFRAME DESIGN CANDIDATE

| Decision | Status | Rationale / constraint |
|---|---|---|
| Conceptual Design | APPROVED | Product Owner / Chief Architect decision supplied for this gate. |
| Dominant question | APPROVED | “Temos condições de produzir?” |
| Main visualization | APPROVED | Hybrid Constraint-First. |
| Granularity | APPROVED | Lot × Resource plus consolidated Lot summary. |
| Default comparison | APPROVED | Resource cards; compact comparison on demand. |
| Resource Eligibility | APPROVED | First structural filter. |
| Ineligible Resources | APPROVED | Compact elimination; no deeper readiness evaluation. |
| Current Resource State | APPROVED BOUNDARY | Context only; not Availability, Readiness or Assignment. |
| Current × Required | APPROVED | Compare observed present with condition required for Scheduled Lot. |
| Material Staging | APPROVED FOR WIREFRAME | Show separately from Material Availability. |
| Result vocabulary | PROVISIONAL UX | Not MES lifecycle. Product Owner should validate wording. |
| Consolidated result | APPROVED FOR SCENARIO | Explainable scenario statement; no formula, score or ranking. |
| Future CTA | RECOMMENDED | “Continuar para organização”; inactive until WF-003 authorization. |
| Return action | APPROVED | “Voltar ao Plano Hora-Hora” preserving conceptual context. |
| Red | PROHIBITED | No state relies only on color. |
| Demo values | CONCEPTUAL ONLY | Explicitly demonstrative; not fixture authorization or Yamaha data. |
| MES Function priority | NOT CLAIMED | Catalog absent; Experience Design Priority is separate. |
| Visual image | NOT AUTHORIZED | This package contains no PNG/SVG/HTML. |
| Frontend implementation | NOT AUTHORIZED | No route, component, fixture, state, API or backend. |

## Product Owner Review Points

1. Is the textual composition sufficient to create the first visual candidate?
2. Does **Existe caminho viável** communicate the Lot summary without implying a selected Resource?
3. Are the three eligible Resource cards balanced and free from automatic recommendation cues?
4. Is compact elimination of DC02/DC04 sufficiently clear?
5. Is **Material preparado / Abastecimento da área** the preferred operational wording for Material Staging?
6. Are the provisional result labels acceptable for the visual candidate?
7. Is **Continuar para organização** the correct future handoff CTA?
8. Is Buffer urgency sufficiently separated from technical Readiness?
9. Is freshness visible without excessive timestamp repetition?
10. Are 1440, 1280 and 1024 behaviors appropriate for review?

## Open Questions by Gate

### Blocks Image Design

None structurally. Product Owner review points may refine wording and emphasis before image generation.

### Blocks Demo Fixture

- exact demonstrative dimension values and timestamps;
- explicit scenario-only consolidation rule;
- safe fictional mold/tool labels;
- capacity inclusion;
- detail behavior for the eight scenarios.

### Blocks Productive Model

- eligibility-definition source/effectivity;
- Resource Availability semantics/source;
- tooling, Setup, maintenance and material sources;
- Material Staging/Floor Stock governance;
- productive readiness derivation/lifecycle;
- Data Freshness SLA;
- parallel schedule semantics;
- Operation/Operation Activity and Lot/SFC mapping;
- Standard MES Function Catalog.

## Recommended Next Action

**A — READY TO GENERATE WF-002 VISUAL WIREFRAME**, only after explicit Product Owner authorization. The next artifact must remain a candidate and must not authorize frontend implementation.
