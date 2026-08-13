# Sprint 000 — Frontend Foundation

**Status:** PASSED — READY FOR WF-001 IMPLEMENTATION AUTHORIZATION  
**Date:** 2026-08-13  
**Governing decision:** `docs/prototype/decisions/ADR-001-PROTOTYPE-FRONTEND-FOUNDATION.md`

## Scope

Sprint 0 creates only the minimum navigable frontend foundation required before WF-001. It includes the SPA bootstrap, demo routing namespace, neutral App Shell, Application Context, minimal Demo Scenario State, a light visual foundation, test infrastructure and a placeholder for the authorized Production Scheduling route.

WF-001 functional behavior is explicitly excluded.

## Operational bootstrap decisions

These are Sprint 0 implementation decisions, not permanent architectural amendments:

- detected runtime: Node 24.14.1;
- adopted baseline: Node >=22.12;
- detected package managers: npm 11.11.0 and pnpm 11.19.0;
- selected package manager: npm, because it is bundled with the detected Node runtime and adds no package-manager dependency;
- dependency versions are locked by `package-lock.json`;
- no lint tool was introduced because TypeScript strict, build and tests provide the required minimum checks without adding another toolchain in this sprint.

## Installed stack

Runtime:

- React;
- React DOM;
- React Router;
- Zustand.

Development and validation:

- TypeScript;
- Vite and the React plugin;
- Vitest;
- jsdom;
- React Testing Library, DOM Testing Library, jest-dom and user-event;
- Playwright;
- axe-core integration for Playwright;
- React and React DOM type definitions.

Resolved versions:

- React / React DOM 19.2.8;
- React Router 8.3.0;
- Zustand 5.0.15;
- TypeScript 7.0.2;
- Vite 8.2.1 and React plugin 6.0.5;
- Vitest 4.1.10 and jsdom 29.1.1;
- React Testing Library 16.3.2, DOM Testing Library 10.4.1, jest-dom 7.0.1 and user-event 14.6.4;
- Playwright 1.62.1 and axe-core Playwright integration 4.13.0.

Lucide React, Radix Primitives and Recharts were not installed because no Sprint 0 component requires them.

## Structure created

- `src/app`: providers, routing and shell;
- `src/design-system`: foundation tokens and global styles;
- `src/domain`: only Productive Area and Scenario Definition;
- `src/features/production-scheduling`: architectural placeholder only;
- `src/shared/ui`: Button, Badge, Surface, Stack and route message, all used in Sprint 0;
- `src/demo/scenarios`: minimal Fundição DC definition;
- `src/demo/adapters`: scenario definition adapter;
- `src/demo/scenario-engine`: isolated Zustand store with initialization, selectors and atomic reset;
- `src/test`: shared component-test setup;
- `e2e`: smoke, accessibility and visual-baseline tests.

## Routes

- `/` redirects to `/demo/fundicao-dc/production-scheduling`;
- `/demo/:scenarioId/:experience` validates the scenario and authorized experience;
- wildcard route provides a neutral not-found response;
- only `production-scheduling` is recognized, and only as a non-functional placeholder.

## State boundaries

Application Context is implemented with React Context and optional validated `sessionStorage` for Productive Area. Its reset is independent.

Demo Scenario State is implemented with Zustand and limited to scenario definition, initialization and atomic reset. It remains in memory.

The shell context-panel visibility is local React UI State, demonstrating that trivial UI State is not placed in Zustand.

## Design system foundation

The initial tokens cover typography, spacing, radius, elevation, motion, neutral and brand colors, informational, positive, attention, unavailable, background, surface, text, border and focus.

There are no red color tokens. Semantic state components retain text labels and borders in addition to color.

## Tests and checks

Final results:

- `npm run typecheck`: PASS, zero TypeScript errors;
- `npm run build`: PASS, 97 modules transformed;
- `npm test`: PASS, 3 test files and 4 tests;
- `npm run e2e`: PASS, 2 Chromium tests including axe and screenshot comparison;
- `npm audit`: PASS, zero vulnerabilities;
- lint: not configured by deliberate minimum-tooling decision.

Playwright includes a deterministic Chromium project, an axe accessibility check and an App Shell screenshot baseline.

## Limitations

- The Production Scheduling route is only a placeholder.
- No MES operational state beyond scenario metadata exists.
- No real data source, API client, backend or persistence exists.
- Only one demonstrative Productive Area and scenario are available.
- Hosting, CI/CD, authentication, authorization and production configuration remain deferred.

## Deferred

All technical and MES-domain deferred decisions listed in ADR-001 remain deferred unless explicitly resolved as an operational bootstrap choice above. Node baseline, npm and exact locked versions apply to Sprint 0 implementation and do not amend ADR-001.

## Next gates

Before WF-001 implementation:

1. Sprint 0 quality checks must pass.
2. Architectural boundaries and dependency usage must pass auto-audit.
3. Chief Architect must approve the Sprint 0 report.
4. WF-001 implementation must receive a new explicit authorization.

## Auto-audit result

- ADR-001 respected: yes;
- WF-001 implemented prematurely: no;
- Application Context, Scenario State and UI State separated: yes;
- Zustand restricted to Scenario State: yes;
- Domain framework dependencies: zero;
- feature imports of fixtures: zero;
- unused/redundant direct dependencies: zero identified;
- red tokens or color values: zero;
- confidential production data: none;
- premature MES TBD models: none;
- deep link, context, scenario reset, build, typecheck, tests, Playwright and screenshot: pass.
