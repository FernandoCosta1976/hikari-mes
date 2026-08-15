# WF-001 — What-If Resource Simulation and Buffer Decision Support

## Status

Product Review candidate. No commit or push was performed.

## Delivered

- fixed DC01–DC05 Resource order in Normal, Conditions and Simulation modes;
- read-only condition overlay without lane reordering;
- local, discardable one-move What-If simulation by vertical HTML drag or fixed-order keyboard controls;
- immutable received-plan baseline with original-position ghost;
- Setup delta engine for origin, destination and net impact;
- temporal conflict detection against Lots; planned breaks are not blockers;
- compact comparison, undo and discard;
- Buffer Decision Support with current, demonstrative target, baseline projection, simulated projection and target delta;
- compact daily buffer trajectory;
- demonstrative Buffer-Critical Lot 255 with +0.2 day contribution and 2.9-day projection without the Lot;
- Lot Context Modal buffer and Plan-versus-Simulation context.

## Governed boundaries

The simulation never overwrites Scheduled Resource, persists the plan, confirms Resource Assignment, schedules automatically, optimizes, Dispatches, Releases or starts Execution. Moving only Resource while preserving Lot, quantity and time has neutral direct buffer impact. A conflict involving the demonstrative Buffer-Critical Lot is disclosed as risk to the target.

## Gates

- Vitest: 56/56 PASS
- TypeScript/Vite build: PASS
- Playwright WF-001/WF-002: 22/22 PASS
- keyboard alternative: PASS
- fixed order through select, drag, drop, undo and discard: PASS
- accessibility and forbidden-red checks: PASS

## Product Review candidates

- `WF-001-FIXED-RESOURCE-CONDITION-VIEW-CANDIDATE.png`
- `WF-001-BUFFER-DECISION-WORKSPACE-CANDIDATE.png`
- `WF-001-SIMULATION-MODE-CANDIDATE.png`
- `WF-001-SIMULATION-IMPACT-PREVIEW-CANDIDATE.png`
- `WF-001-SIMULATION-BUFFER-RISK-CANDIDATE.png`

All candidates remain unapproved and preserve previous screenshots.
