# WF-002 — Accessibility Specification

**Status:** WIREFRAME REQUIREMENT

## Structure

- one page-level heading for **Preparação da Produção**;
- dominant question exposed as a meaningful heading;
- landmarks for navigation, main assessment and complementary detail;
- headings for Selected Lot, Readiness Summary, Eligibility, Resources, Attentions and Actions;
- Resource cards represented as grouped sections/articles, not interactive cards unless they contain an explicit action.

## Status Communication

- every result has visible text;
- iconography and semantic treatment supplement text;
- color is never the only carrier;
- red is never used;
- insufficient information is distinct from attention and known impediment;
- current-state context includes text that it does not imply readiness.

## Keyboard and Focus

Conceptual focus order:

1. return to WF-001;
2. freshness/detail controls in context order;
3. Eligibility explanation;
4. each Resource condition-detail action in document order;
5. comparison action;
6. attention-detail actions;
7. future handoff.

Opening condition detail or comparison must move focus to its heading and return focus to the triggering control when closed. Returning to WF-001 must restore the selected Lot context when implementation is later authorized.

## Comparison Accessibility

- provide semantic row/column headers if a table is used;
- provide a linear per-Resource alternative at narrow widths;
- never encode comparison solely by card position or color;
- announce that the comparison does not rank or select;
- allow dimension labels and values to be read in a logical sequence.

## Detail on Demand

The accessible name for detail controls must include Resource and condition, such as **“Ver condições da DC03”**. Source, observation/evaluation time, freshness, reason and impact must be textually available.

## Motion and Density

- future implementation must respect reduced motion;
- disclosure should not cause unexpected focus/scroll jumps;
- touch/click targets must remain operable at supported desktop widths;
- zoom and text enlargement must not hide decision-critical content.
