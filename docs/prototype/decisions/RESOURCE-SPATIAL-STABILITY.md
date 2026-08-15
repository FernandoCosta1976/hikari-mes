# Resource Spatial Stability

## Status

Approved UX principle for the HIKARI MES executive prototype.

## Decision

Physical Resource lanes in the Foundry DC Hour-by-Hour plan always use the canonical order:

1. DC01
2. DC02
3. DC03
4. DC04
5. DC05

The order is invariant in Normal, Conditions and Simulation modes and does not change because of Readiness, Eligibility, Availability, Setup, Buffer, selected Lot, drag target or simulated move.

## Rationale

Supervisors and Production Leaders need stable memory of place. A persistent location makes each physical Resource predictable, reduces visual search and prevents moving targets during drag-and-drop.

Condition and simulation meaning must be conveyed through badge, outline, opacity, icon, text and lane highlighting. A Resource may become visually subordinate, but its lane is never removed, collapsed or moved.

## Boundary

Spatial stability is a presentation decision. It does not define Resource Assignment, availability, scheduling optimization, Dispatch, Release or Execution.
