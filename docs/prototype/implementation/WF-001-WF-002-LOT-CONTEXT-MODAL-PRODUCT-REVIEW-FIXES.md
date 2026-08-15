# WF-001 / WF-002 — Lot Context Modal and Product Review Fixes

**Status:** CANDIDATE — NOT APPROVED  
**Date:** 2026-08-14

## Implemented refinement

The former lateral Lot detail was replaced by a transversal, modal Lot Context. It preserves the Plan as background context and progressively exposes Overview, Preparation, Resource suitability, and complementary context. The modal does not select, assign, change, dispatch, release, or execute a Resource.

Preparation now exposes Business Date in direct access, uses one exception-first operational queue with a summarized reason, subordinates READY Lots in a collapsed group, and represents non-eligible Resources compactly. The unavailable Organization perspective was removed from the UI while its future architectural boundary remains preserved.

## Readiness semantic honesty

Overall Readiness continues to come directly from the demonstrative fixture. The UI explicitly identifies it as a **demonstrative result** and states that the aggregation rule is not governed. The dominant reason is selected only for presentation from the programmed Resource evidence matching the fixture-provided overall state; this does not create or imply a productive aggregation formula.

## Preserved boundaries

- Programmed Resource is not Confirmed Resource Assignment.
- Eligible is not Available.
- Scheduled is not Ready, Assigned, Dispatched, Released, or Actual.
- WF-003, Resource Assignment, Dispatch, Release, Execution, backend, API, and database remain unimplemented.
