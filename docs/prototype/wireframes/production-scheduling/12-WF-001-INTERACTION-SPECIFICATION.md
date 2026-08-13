# WF-001 — Interaction Specification

## 1. Productive Area selection

Action:
select global area.

Effect:
all WF-001 data context changes consistently.

Persistence:
selected Productive Area persists while navigating HIKARI prototype experiences.

## 2. Date selection

Action:
select Today / adjacent day.

Effect:
timeline, totals, freshness and context update together.

Do not preserve a selected Lot that does not exist in the new date.

## 3. Shift selection

If implemented, selecting a shift filters/highlights the relevant commitment.

Exact shift definitions remain demonstrative until validated.

## 4. Lot selection

Action:
click/tap Lot.

Effect:
- selected visual state;
- open Lot Detail;
- preserve timeline position.

## 5. Lot deselection

Close drawer or select another Lot.

Do not reset the entire schedule.

## 6. Freshness selection

Action:
select freshness indicator.

Effect:
show source-level detail.

Recommended pattern:
popover or small drawer.

## 7. Attention selection

Action:
select attention marker.

Effect:
explain:
- what;
- why;
- affected object;
- operational implication.

## 8. Timeline navigation

May support:

- horizontal scroll;
- controlled zoom;
- “agora” shortcut in Today scenario.

Avoid free-form complex scheduling controls in WF-001.

## 9. Next-step action

Primary flow:

**Avaliar preparação**

The action should preserve selected area/date/Lot context when moving to Production Readiness.

## 10. Prototype state

All interactions are local/demo state.

No persistence to operational data.

## 11. Reset

Demo mode shall support resetting the scenario to its initial state.

Reset should restore:

- selected area;
- scenario date;
- baseline schedule;
- exception states;
- selection.

## 12. Motion

Use subtle transitions only:

- drawer;
- selection;
- state change.

Avoid decorative animation.

## 13. Tooltips

Use for supplemental information.

Do not hide required decision information exclusively in tooltips.
