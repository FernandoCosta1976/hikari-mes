# WF-001 Vertical Sidebar Refinement Report

Status: candidate for Product Review. This record does not approve or replace any previous visual baseline.

## Implemented

- Compact 60 px application header with the sidebar toggle, HIKARI MES identity, Programação context, productive area, and demonstrative-scenario identification on one line.
- Persistent, collapsible left sidebar integrated with the application shell.
- Disclosure hierarchy for Período, Visão, Filtros, Plano, and Cenário.
- Destino and Variação demonstrativa moved to the second level under Filtros, with an active-filter indicator.
- Schedule comparison, revision access, and scenario reset moved out of the workspace.
- Compact date and view context retained in the Hour-by-Hour header.
- Responsive overlay-drawer behavior, Escape handling, focus return, accessible labels, and selected states that do not depend on color alone.

## Dimensions and behavior

- Expanded sidebar: 240 px.
- Collapsed sidebar: 64 px.
- Small viewport: fixed overlay drawer with backdrop; no global horizontal overflow.
- The timeline retains its own internal horizontal overflow.

## Above-the-fold measurement

Measurement viewport: 1440 × 900 px.

| Metric | Before | After | Result |
| --- | ---: | ---: | ---: |
| Timeline heading Y | 389 px | 330 px | 59 px gain |
| Total top occupation before timeline | 389 px | 330 px | 59 px reduction |
| Visible Resource lanes without vertical scroll | 5 | 5 | DC01–DC05 preserved |

The global header remains 60 px high. Measurements are rounded to the nearest pixel and refer to the initial demonstrative state.

## Preserved scope

The continuous 24-hour timeline, DC01–DC05 lanes, proportional Lots, scheduled setups, planned breaks, current-scenario time and automatic 2/9 positioning, Lot selection and detail, internal horizontal scrolling, and the 1,600-piece demonstrative plan remain unchanged. No MES domain decision or fixture was changed by this refinement.

## Verification

- TypeScript and production build: passed.
- Unit/component/integration tests: 45 passed.
- Browser/E2E flow, responsive sidebar, accessibility scan, reduced motion, timeline overflow, and visual candidate: passed.
- Source scan found no red semantic or literal styling introduced in the frontend.

## Candidate artifact

`e2e/wf001-production-scheduling.spec.ts-snapshots/WF-001-VERTICAL-SIDEBAR-CANDIDATE-chromium-darwin.png`
