# HIKARI Prototype — Design System Manifesto

## 1. Visual ambition

The HIKARI prototype must feel industrial, modern, corporate, premium, objective, and credible. It must not resemble an old ERP, generic admin template, or PowerPoint converted into a web application.

## 2. Structural reference: T-Systems

The T-Systems institutional digital presence is the principal structural/editorial visual reference for the prototype. This is a reference for design principles, not a request to clone proprietary components.

Apply the following qualities:

- disciplined grid;
- generous whitespace;
- strong typographic hierarchy;
- editorial composition;
- concise navigation;
- large, confident headings/numbers;
- controlled information density;
- clean cards and panels;
- sophisticated but restrained visual rhythm;
- clear separation of primary and secondary information.

## 3. HIKARI/Yamaha identity

The application identity uses Yamaha-inspired blue as the primary chromatic language, combined with white and neutral grays.

The visual result must remain HIKARI, not a copy of Yamaha or T-Systems.

## 4. Priority colors

Priority order and colors are fixed:

- CORE — dark blue
- ESSENTIAL — light blue
- IMPORTANT — orange
- COMPLEMENTARY — green

These colors represent priority classification. They must not be casually reused to imply unrelated semantic states when that would create ambiguity.

## 5. Red prohibition

Red MUST NOT be used anywhere in the HIKARI prototype.

Criticality and errors must be communicated using combinations of:

- orange/amber;
- iconography;
- high-contrast typography;
- borders;
- patterns;
- labels;
- explicit explanatory text.

Accessibility must not depend on color alone.

## 6. Typography

Typography must be strong, modern, highly legible, and suitable for dense industrial information. Use a clear hierarchy for:

- page title;
- dominant business question;
- KPI/value;
- section heading;
- card title;
- body/microcopy;
- metadata/timestamps.

Avoid excessive font sizes, weights, or decorative styles.

## 7. Layout

Use a responsive grid and strong alignment. The dominant question and primary visualization should receive the most visual weight.

Avoid placing equal-weight cards everywhere. Visual hierarchy must reflect decision hierarchy.

## 8. Graphical preference

Prefer:

- horizontal bars;
- timelines;
- progress bars;
- heatmaps;
- planned-versus-actual flows;
- status cards;
- before/after comparisons;
- modular platform maps;
- OEE composition/gauge where appropriate.

Avoid excessive pie charts.

## 9. Plano Hora-Hora design

The Plano Hora-Hora must be a continuous time-based visualization. Hour marks remain visible, but Lots may start/end at arbitrary minutes and cross hour boundaries.

Each Lot should communicate, at appropriate zoom/detail:

- Lot identifier;
- Material/part;
- quantity;
- Scheduled Start/Finish;
- demand destination;
- relevant status.

Do not overload every timeline block with all metadata. Use selection/hover/detail panel for progressive disclosure.

## 10. Data freshness visual language

Freshness should be visible but not dominate normal operation.

Normal: concise “Dados atualizados · HH:MM” or equivalent.

Attention: orange/amber state with explicit text such as “Plano de hoje ainda não recebido”.

Source-level detail may appear in a popover/panel with Balancing and PyMAC timestamps/statuses.

## 11. Buffer design

Buffer visualization must distinguish:

- physical stock;
- available quantity;
- reserved quantity;
- current coverage;
- projected coverage;
- target reference;
- destination segmentation.

Avoid a single “health score” that hides the underlying operational facts.

## 12. Iconography

Use simple, consistent, industrially understandable icons. Icons support comprehension but do not replace labels for critical actions/statuses.

## 13. Motion

Motion should be restrained and purposeful: sequence change, state transition, panel expansion, current-time marker, or demonstrative scenario progression. Avoid decorative animation.

## 14. Density

Operational screens may have higher information density than executive screens, but must remain scannable. Dense does not mean crowded.

## 15. Accessibility

Status must never be communicated by color alone. Text contrast, keyboard navigation, focus state, readable sizes, and semantic structure should be respected even in prototype code where practical.

## 16. Anti-patterns

Prohibited design outcomes include:

- generic admin-dashboard template;
- wall of KPI cards;
- excessive gradients/decorative effects;
- unstructured data tables as default solution;
- red alerts;
- tiny unreadable industrial dashboards;
- decorative diagrams with no decision value;
- visual metaphors that invent domain concepts;
- inconsistent use of priority colors.
