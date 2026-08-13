# HIKARI Prototype — Interaction Manifesto

## 1. Purpose

Interactions must correspond to real decision moments and preserve domain lineage. The prototype may simulate actions, but simulated actions must behave consistently with the agreed operating model.

## 2. Global Productive Area

Productive Area is global state. Selecting Foundry DC persists across screens until explicitly changed/reset.

## 3. Demonstration state

Prototype state is local/isolated and resettable. Exiting demo mode must not persist demonstrative operational changes to official data.

## 4. Schedule selection

Selecting a Lot in the Plano Hora-Hora should reveal contextual detail without forcing navigation away from the timeline. A side panel/drawer is preferred for V0.1.

Relevant detail may include Lot, Material, quantity, Production Order, Scheduled Start/Finish, Work Center, demand destination, reconciliation status, and concise buffer/material context.

## 5. Rescheduling

Rescheduling must be explicit. The prototype must not silently mutate the Scheduled Sequence.

The interaction must preserve:

Scheduled Sequence → proposed/Dispatched Sequence → Actual Sequence later.

Where a user changes sequence, a before/after representation or equivalent lineage must remain available.

## 6. Resource assignment

Resource assignment belongs to Dispatching. The prototype should not assign a Resource during the initial schedule-reception view unless explicitly entering the Dispatching interaction.

Resource choice must reflect eligibility and relevant constraints. Ineligible Resources must not appear as equivalent valid choices.

## 7. Setup context

When operational resequencing or Resource assignment is simulated, Setup context should be visible enough to explain why grouping similar production may be advantageous.

The system must not claim to have mathematically optimized Setup unless such capability is explicitly implemented and validated later.

## 8. Material availability

Potential raw-material risk must be visible before an action that would make the plan appear executable. The prototype may use qualitative/simulated risk states rather than full MRP logic.

## 9. Buffer interaction

Users should be able to distinguish current and projected coverage and inspect destination segmentation.

Reserved Replacement/Engineering stock must not be visually presented as freely available Assembly stock.

## 10. Reservation reallocation

The prototype may explain that reserved stock can be exceptionally reallocated to protect Final Assembly. It MUST NOT implement a fabricated approval interaction while authority/workflow is TBD.

## 11. Data freshness

Freshness interaction has two levels:

1. consolidated state visible in the main screen;
2. source detail on demand.

If today's expected data is missing, the user must be explicitly informed and the last available plan/order date/time must remain visible.

## 12. Demonstration controls

The executive demo supports:

- Previous;
- Next;
- direct access to major narrative stages;
- reset scenario where needed.

The demonstration should not depend on discovering hidden menus.

## 13. Status interaction

Status labels must use explicit language. Avoid color-only semantics.

## 14. Progressive detail

Hover may enrich, but critical information/action must not require hover because touch devices and accessibility may not support it. Click/selection should provide durable detail.

## 15. Error and incomplete-data behavior

Missing information must remain visible as missing/TBD/unavailable. Codex must not substitute invented values to keep a component visually complete unless the value is explicitly demonstrative and labeled.

## 16. Action auditability concept

Actions that materially change operational intent—such as resequencing or future reservation reallocation—should conceptually preserve who/what/when/reason context. The prototype does not need a production audit subsystem, but must not design interactions that imply changes disappear without trace.
