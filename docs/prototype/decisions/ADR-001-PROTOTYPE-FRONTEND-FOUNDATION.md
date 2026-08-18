# ADR-001 — Prototype Frontend Foundation

## 1. Title

Prototype Frontend Foundation for the HIKARI Executive Navigable MES Prototype.

## 2. Status

**ACCEPTED**

The architectural choices recorded in this ADR are formally accepted. Sprint 0 implementation was separately authorized on 2026-08-13 and remains constrained by the implementation gate in section 39.

## 3. Date

2026-08-13

## 4. Context

HIKARI is a greenfield Corporate Framework for MES Platform Deployment and Evolution. The first implementation target is WF-001 — Production Scheduling / Programação da Produção / Plano Hora-Hora, but the frontend foundation must progressively sustain Production Readiness, Resource Orchestration, Operational Rescheduling, Dispatching, Release, Execution, WIP and Events, Adherence and Deviations, Quality, Losses, Performance, OEE, Traceability, executive experiences, strategic views and the Functional Catalog.

The prototype is **HIGH-FIDELITY FRONTEND + LOW-FIDELITY BACKEND**. It initially uses local demonstrative scenarios, fixtures and frontend state. It has no external integrations, production persistence or production database. Its architecture must nevertheless allow demonstrative sources to be replaced incrementally by real services without rewriting the experiences.

## 5. Problem

The project needs a frontend foundation that provides visual control, navigable scenarios, shared state, industrial data visualization, accessibility and testability without:

- optimizing only for WF-001;
- collapsing distinct MES concepts;
- distributing scenario state arbitrarily across components;
- adopting a generic administrative-dashboard appearance;
- exposing proprietary integration or infrastructure details;
- introducing full-stack, remote-data or workflow abstractions before they are required;
- resolving MES domain TBDs through frontend implementation choices.

## 6. Architectural Drivers

- high visual fidelity and HIKARI industrial-premium identity;
- desktop-industrial and executive-notebook use;
- dense timelines, charts, heatmaps, contextual panels and progressive disclosure;
- coherent state across a simulated end-to-end journey;
- deterministic, selectable and resettable demo scenarios;
- standard MES semantics and traceability of identities between experiences;
- isolation between application context, scenario facts and transient UI presentation;
- accessibility by construction;
- unit, interaction, browser and visual-regression testability;
- minimum justified dependencies and controlled lock-in;
- incremental migration from fixtures to real services;
- confidentiality and explicit identification of demonstrative data.

## 7. Constraints

- The reference repository is `/Users/fe/Documents/Hikari-mes`.
- The initial application is a client-side SPA.
- No backend, production database or external integration is part of the initial foundation.
- Internal domain naming uses standard MES English; user-facing content uses governed pt-BR.
- Production Order is not Lot; Work Center is not Resource.
- Scheduled Sequence, Dispatched Sequence and Actual Sequence remain distinct.
- Produced, On-Hand, Reserved and Available Quantity remain distinct.
- Balancing remains the source of the Production Schedule; PyMAC remains the source of Production Orders.
- Resource must not be invented in WF-001.
- Schedule Version is preserved conceptually without an invented technical mechanism.
- Demonstrative data must be isolated, coherent and explicitly labeled.
- Red must never be used. Status cannot depend on color alone.
- This ADR must not resolve MES domain items listed as deferred in section 36.

## 8. Decision

Adopt a React and TypeScript strict client-side SPA built with Vite and routed with React Router Data Mode. Organize the source around application composition, pure MES domain modules, governed features, shared presentation infrastructure, a light design system and isolated demo/scenario capabilities.

Separate state into three categories:

1. **Application Context** — global, typed and feature-independent context;
2. **Demo Scenario State** — transversal facts and actions of the demonstrative narrative;
3. **UI State** — local or URL-based presentation state.

Use Zustand only for transversal Demo Scenario State. Use CSS Modules and CSS Custom Properties for styling. Use Recharts as the only initially approved conventional chart library and custom semantic HTML/CSS/SVG for specialized MES visualizations. Adopt light domain-oriented ports/adapters so fixtures can later be replaced by real services.

## 9. Frontend Stack

Approved foundation:

- **Frontend framework:** React;
- **language:** TypeScript with strict mode;
- **build tool:** Vite for a client-side SPA;
- **routing:** React Router Data Mode;
- **scenario state:** Zustand, restricted as defined in section 12;
- **styling:** CSS Modules and CSS Custom Properties;
- **icons:** Lucide React behind design-system abstractions;
- **accessible primitives:** selective Radix Primitives;
- **conventional charts:** Recharts only;
- **unit tests:** Vitest;
- **component/interaction tests:** React Testing Library and user-event;
- **E2E and browser tests:** Playwright;
- **visual regression:** Playwright screenshots.

Exact dependency versions, package manager and minimum Node version remain deferred.

## 10. Routing Strategy

The demonstrative application is isolated under:

`/demo/:scenarioId/:experience`

Conceptual child experiences may include:

- `production-scheduling`;
- `production-readiness`;
- `resource-orchestration`;
- `operational-rescheduling`;
- `dispatching`;
- `release`;
- `execution`;
- `monitoring`;
- `performance`;
- `oee`;
- `traceability`;
- `executive`;
- `functional-catalog`.

Experience names remain subject to functional governance. Only authorized experiences receive routes. A Demo/Application Shell acts as the layout boundary. `scenarioId` provides reproducibility and deep linking. Navigable or shareable perspectives may use URL search parameters; transient presentation state does not need a route.

React Router Data Mode does not require immediate remote loaders, remote actions or router-based mutations. These abstractions must not be manufactured while the prototype uses local demonstrative data.

## 11. Application Context

Application Context is global, typed, extensible and independent of individual features. It is provided at the Demo/Application Shell boundary.

The first context is **Production Area**, with **Fundição DC** as a demonstrative value. The context architecture must not be named or shaped exclusively around `selectedArea`. Future global context may include locale, demonstrative clock and other governed cross-experience preferences.

Application Context may use `sessionStorage` when useful. Restored identifiers must be validated against the active scenario. Its reset lifecycle is separate from Demo Scenario State.

## 12. Demo Scenario State

Zustand is approved exclusively for transversal demonstrative narrative state. It is not approved as:

- a universal replacement for React state;
- storage for trivial UI State;
- a repository for the whole domain model;
- a substitute for ports, adapters or reference domain modules.

The conceptual model is:

`Scenario Definition → Scenario State → Semantic Actions → Selectors`

Rules:

- divide state by capability/slice when needed;
- expose semantic actions rather than generic setters;
- expose selectors and avoid indiscriminate raw-state access;
- preserve scenario invariants;
- derive values rather than duplicating them when practical;
- keep scenario state in memory initially;
- support atomic reset to an immutable Scenario Definition;
- add actions for later experiences only after their domain and functional gates are approved.

## 13. UI State

UI State remains preferentially local to a component or feature. It may move to the URL when it represents a navigable or shareable perspective.

Examples include drawer, modal, tab, zoom, expanded/collapsed, hover and purely visual selection. These states must not automatically migrate into Zustand. A selection that changes the demonstrative narrative across experiences may instead be Scenario State; the owning feature must make that distinction explicit.

## 14. Domain Organization

Domain models are pure TypeScript modules organized around standard MES domains. They do not depend on:

- React;
- Zustand;
- React Router;
- fixtures;
- components;
- charting or styling libraries;
- API or transport formats.

Domain modules preserve MES identities, value distinctions and invariants. They must not model unapproved TBDs prematurely. External DTOs never become the UI domain model automatically.

## 15. Feature Organization

Features represent governed experiences or capabilities, such as Production Scheduling, Production Readiness, Resource Orchestration and Dispatching. They are not arbitrary page folders.

Features may compose domain models/components and shared UI. Only features authorized by their functional gate should be materialized. A feature owns its experience-specific composition, UI state, interactions and view models without redefining reference domain entities.

## 16. Shared UI Strategy

Shared UI contains reusable presentation components with no MES semantics, such as Button, Badge, Drawer, Surface, Stack, Inline and Tooltip.

Shared UI must not know Lot, Production Order, Work Center, Resource, Buffer Coverage or other MES concepts. It must not import features or demo fixtures. Components are promoted into Shared only after a credible reuse boundary exists.

## 17. Component Taxonomy

Three component categories are approved:

### Shared UI Components

Generic presentation and interaction components without MES meaning.

### Domain Components

Reusable visual representations of standard MES concepts, such as Lot summary, Production Order reference, Data Freshness or Buffer Coverage. They consume reference domain types or explicitly defined view models, never transport payloads.

### Feature Components

Experience-specific compositions that answer a governed business question, such as Hour-by-Hour Schedule or Production Readiness Panel.

Dependency direction:

- Shared UI does not import Domain or Feature;
- Domain Components may use Shared UI;
- Feature Components may compose Domain Components and Shared UI;
- no component imports fixtures directly.

Avoid abstractions created only in anticipation of possible reuse.

## 18. Design System Foundation

Adopt a **LIGHT** internal design system with two token layers:

### Foundations

- color primitives;
- typography;
- spacing;
- radius;
- elevation;
- motion;
- breakpoints and layering when needed.

### Semantics

- surfaces and text;
- borders and focus;
- selected and disabled states;
- `neutral`;
- `informational`;
- `positive`;
- `attention`;
- `unavailable/blocked`.

Red is prohibited, including inherited `danger` or `error` tokens. Attention and unavailable/blocked states use orange/amber, iconography, text, borders, contrast or patterns. No state depends exclusively on color.

The design system progressively includes layout and visualization primitives. T-Systems is a structural/editorial reference; the resulting identity remains HIKARI, industrial and premium.

Lucide React is encapsulated through the design system rather than imported indiscriminately by features. Radix Primitives may be adopted selectively for dialog, drawer, popover, tooltip and focus management when they provide concrete accessibility or interaction value. Radix is not the HIKARI visual framework.

## 19. Styling Strategy

Use CSS Modules for component/feature style isolation and CSS Custom Properties for foundations and semantic tokens. Runtime CSS-in-JS is not part of this foundation.

Global CSS is limited to reset, document defaults, fonts, tokens and truly global accessibility behavior. Feature-specific styling remains colocated with its feature. Arbitrary hard-coded semantic colors are prohibited.

## 20. Visualization Strategy

Recharts is the only initially approved conventional chart library. It is used for charts that fit normal cartesian or composed-chart models, including bars, lines, areas, trends and future aggregate planned-versus-actual or OEE views.

Do not add ECharts, Highcharts, Chart.js, D3 wrappers or another chart framework without architectural review. D3 may later be used as a focused utility for scales or calculations when justified; this does not automatically approve it as a second visualization framework.

Specialized MES visualizations may use semantic HTML, CSS and SVG when they require domain-specific layout, interaction or accessibility.

## 21. Hour-by-Hour Timeline Strategy

Plano Hora-Hora is a custom specialized visualization implemented with:

- semantic HTML;
- CSS;
- SVG when necessary.

It must not be forced into Recharts or automatically delegated to a Gantt library. Its architecture separates:

1. temporal mathematics;
2. rendering;
3. interaction;
4. accessibility.

This separation must allow future representation of Scheduled, Dispatched and Actual information without assuming that those later states are defined for WF-001 and without lock-in to a third-party Gantt model.

Canvas/WebGL and timeline virtualization remain deferred until concrete scale or performance evidence exists.

## 22. Data / Fixture Strategy

Demonstrative fixtures are typed TypeScript and organized by scenario, not by screen. A scenario conceptually contains its definition, initial seed, metadata and expected outcomes.

Rules:

- identify data as demonstrative;
- preserve reference Lot, Production Order and Material identities across experiences;
- maintain mathematical and temporal coherence;
- use a deterministic demonstrative clock;
- separate base facts from derived selectors;
- do not create isolated per-screen JSON copies of the same entities;
- do not include unauthorized industrial information.

## 23. Ports / Adapter Strategy

Adopt a light, domain-oriented boundary between features and replaceable data sources.

Initial direction:

`Feature → Domain-oriented Port → Demo Adapter / Fixture`

Future direction:

`Feature → Domain-oriented Port → Service Adapter → Real API`

Components do not call sources directly. Adapters translate source formats into reference models or view inputs. Ports are introduced only where a genuinely replaceable boundary exists. Do not invent external contracts or construct ceremonial Clean Architecture layers.

## 24. Testing Strategy

- **Vitest:** pure domain logic, temporal mathematics, selectors, reconciliation, calculations, scenario actions and reset behavior;
- **React Testing Library + user-event:** component behavior, keyboard interaction, drawers, filters, freshness, empty states and demonstrative labeling;
- **Playwright:** routed journeys, context continuity, scenario reset, browser behavior, responsive viewports and critical accessibility structure.

Tests should favor observable behavior and reference invariants over internal component implementation.

## 25. Visual Regression Strategy

Use Playwright screenshots in a deterministic environment with controlled viewport, fonts, demonstrative time, fixture scenario and animation behavior.

WF-001 is the first visual-fidelity reference. The approved image guides composition, hierarchy, layout and experience; it is not copied as an unqualified pixel baseline because normative corrections prevail. The first technical golden must contain no red, use governed pt-BR, identify **Cenário demonstrativo** and omit any ungoverned next-automatic-update claim.

Golden updates require explicit review rather than automatic acceptance.

## 26. Accessibility

Accessibility is a foundation concern:

- prefer semantic HTML before ARIA;
- support keyboard navigation and visible focus;
- provide focus management and return focus for overlays;
- use accessible dialogs, drawers, popovers and tooltips;
- preserve sufficient contrast;
- never communicate status by color alone;
- respect reduced-motion preferences;
- provide textual equivalents for decision-critical visualizations;
- use automated accessibility checks such as axe where appropriate;
- include manual keyboard and assistive-technology validation.

## 27. Dependency Policy

Dependencies must be minimal, justified, non-redundant, actively maintained, appropriately licensed and preferably encapsulated at architecture boundaries.

Approved limits:

- one conventional chart library initially;
- one icon library;
- one transversal Demo Scenario State library;
- Radix primitives only when used;
- no complete UI toolkit for convenience;
- no remote-data, form or animation library before a concrete need and review.

## 28. Demo Persistence

Demo Scenario State remains in memory for the session and is not automatically persisted in `localStorage` or as a full serialized scenario.

Application Context may use `sessionStorage` when useful. Persisted identifiers must be demonstrative, minimal and validated before restoration. Persistence beyond the session remains deferred.

## 29. Reset Strategy

Demo Scenario State has an explicit, atomic reset to its Scenario Definition. Reset restores the governed initial facts and removes narrative mutations consistently across experiences.

Application Context has a separate reset lifecycle so resetting a scenario does not silently redefine global-context policy. Partial component resets must not leave the scenario in an inconsistent state.

## 30. Confidentiality

The demo frontend and fixtures must not contain:

- credentials or secrets;
- proprietary APIs or endpoints;
- corporate payloads;
- event contracts;
- production schemas;
- infrastructure details;
- unauthorized industrial identifiers or confidential information.

Fixtures are demonstrative. Configuration exposed to the browser must always be considered public. Source-map policy remains deferred for the future deployment decision.

## 31. Future Migration

Migration follows:

`fixtures → demo adapters → service adapters → real APIs`

Features retain their business-question composition, reference models, actions, selectors and view models. Source-specific DTOs remain inside adapters. Migration occurs incrementally by capability rather than through a duplicated “real application” or a big-bang rewrite.

Remote state libraries, request caching and service lifecycle behavior will be decided only when real remote sources exist.

## Proposed Directory Architecture

The following tree is conceptual and must not be created until implementation is separately authorized:

```text
src/
├── app/
│   ├── bootstrap/
│   ├── providers/
│   ├── routing/
│   └── shell/
├── design-system/
│   ├── foundations/
│   ├── tokens/
│   ├── primitives/
│   └── visualization/
├── shared/
│   ├── ui/
│   ├── layout/
│   ├── accessibility/
│   ├── hooks/
│   └── lib/
├── domain/
│   ├── planning/
│   ├── production/
│   ├── resources/
│   ├── materials/
│   ├── inventory/
│   ├── quality/
│   ├── events/
│   ├── performance/
│   └── traceability/
├── features/
│   ├── production-scheduling/
│   ├── production-readiness/
│   ├── resource-orchestration/
│   ├── operational-rescheduling/
│   ├── dispatching/
│   ├── release/
│   ├── execution/
│   ├── monitoring/
│   ├── quality/
│   ├── performance/
│   ├── oee/
│   ├── traceability/
│   ├── executive-cockpit/
│   └── functional-catalog/
├── demo/
│   ├── application-context/
│   ├── scenario-engine/
│   ├── scenarios/
│   ├── fixtures/
│   └── adapters/
├── ports/
│   ├── planning/
│   ├── production/
│   └── inventory/
└── test/
    ├── builders/
    ├── fixtures/
    └── accessibility/

e2e/
├── flows/
├── visual/
└── accessibility/
```

Only authorized features and necessary boundaries are materialized. The tree is a target organization, not an instruction to create empty folders.

## 32. Positive Consequences

- rapid frontend iteration with strong type safety;
- high visual control without generic-dashboard constraints;
- clear state ownership and reduced accidental coupling;
- coherent demonstrative journeys across experiences;
- domain models protected from UI and transport technologies;
- deterministic tests and visual baselines;
- incremental replacement of demonstrative sources;
- accessibility and confidentiality built into the foundation;
- limited dependency surface and controlled lock-in.

## 33. Negative Consequences / Trade-offs

- specialized timelines and MES visualizations require custom engineering;
- Zustand provides fewer structural guardrails than more ceremonial state solutions;
- the team must actively maintain boundaries between Domain, Feature, Shared and Demo;
- a light internal design system requires consistent governance;
- no SSR, integrated backend or production-ready remote-data layer is provided initially;
- visual regression requires a controlled execution environment.

## 34. Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Demo Scenario State becomes a monolithic universal store | Medium–High | High | Capability slices, semantic actions, selectors and restricted raw-state access. |
| Unapproved MES TBDs become encoded as final frontend states | Medium | Critical | Feature gates, pure reference models and prohibition on premature lifecycle/actions. |
| Custom Hour-by-Hour timeline accumulates accessibility or performance debt | High | High | Separate temporal math, rendering, interaction and accessibility; test each layer; virtualize only with evidence. |
| Light design system becomes inconsistent or overbuilt | Medium | High | Governed tokens, demand-driven primitives and evidence-based promotion to Shared. |
| Fixtures diverge across experiences or contaminate domain models | Medium | High | Scenario-level fixtures, reference IDs, invariant tests and adapter-only source access. |
| Screenshot baselines become unstable | Medium | Medium–High | Fixed viewport, fonts, clock, scenarios and motion behavior; reviewed golden updates. |

## 35. Rejected Alternatives

### Next.js for the initial foundation

Rejected because SSR, SEO, server middleware and backend-for-frontend requirements are not confirmed. It would introduce rendering, hosting and server/client decisions prematurely.

### React Router Framework Mode initially

Rejected in favor of Data Mode because the current prototype needs SPA routing control without framework-level server conventions. It remains an evolutionary option.

### Redux Toolkit initially

Rejected because its additional ceremony is not justified for the demonstrative scenario scope. Reconsider only if state governance needs materially increase.

### XState initially

Rejected because execution workflows and lifecycle semantics contain domain TBDs. A state machine now could falsely formalize unapproved behavior.

### Tailwind CSS as the styling foundation

Rejected in favor of CSS Modules and semantic tokens to preserve explicit, highly controlled HIKARI composition and avoid utility-heavy feature markup.

### Complete visual frameworks such as Material UI or Ant Design

Rejected because they create a substantial risk of generic administrative appearance and visual-system lock-in.

### Multiple chart libraries or a Gantt library for WF-001

Rejected to avoid redundancy and domain lock-in. Recharts covers conventional charts; specialized MES visualizations remain custom.

### Clean Architecture ceremony and direct fixture imports

Both extremes are rejected. The chosen approach uses only light ports/adapters at genuine replacement boundaries.

## 36. Deferred Decisions

### Technical

- exact dependency versions;
- package manager;
- minimum Node version;
- hosting;
- CI/CD;
- deployment base path;
- authentication;
- authorization;
- source-map policy;
- CDN;
- cache strategy;
- SSR;
- prerendering;
- TanStack Query;
- Storybook;
- form library;
- animation library;
- timeline virtualization;
- Canvas/WebGL;
- telemetry;
- observability;
- persistence beyond session;
- real APIs;
- remote configuration;
- final i18n strategy;
- microfrontends.

### MES Domain

- Lot × SFC / Execution Control Unit;
- Operation Activity mapping;
- Release semantics;
- Execution lifecycle;
- detailed Production Confirmation;
- Quality Disposition;
- Reservation Reallocation Governance;
- detailed Genealogy;
- authoritative Inventory System;
- authoritative Material Staging / Floor Stock source;
- Data Freshness SLA;
- external Schedule Version format.

These MES domain TBDs do not block WF-001.

## 37. Relationship with MES Domain Architecture

This ADR defines frontend boundaries and technology choices; it does not redefine MES architecture. Pure domain modules must preserve reference distinctions and defer unresolved semantics to their respective domain gates.

The foundation allows Routing, Operation, Operation Activity, Resource Orchestration, Release, Execution, Quality, Inventory, Events, Performance and Traceability to be represented later without forcing their implementation now. It must not imply that Lot equals SFC, Dispatching equals Release, Produced equals Available or Work Center equals Resource.

## 38. Relationship with WF-001

The foundation immediately supports WF-001 under the dominant question **“O que precisamos produzir?”** through:

- an isolated demonstrative route;
- global Productive Area context;
- a deterministic scenario;
- a custom continuous Hour-by-Hour timeline;
- reference Lot and Production Order identities;
- Data Freshness and Schedule Version extensibility;
- contextual details and progressive disclosure;
- visual-regression testing against the approved reference.

WF-001 must not answer machine assignment, Release, start authorization, efficiency, loss or OEE questions. Resource remains unassigned in Production Scheduling. SFC, Release and Execution TBDs are not prerequisites for WF-001.

## 39. Implementation Gate

This ADR is sufficient for a future Sprint 0 bootstrap after explicit approval of this ADR and separate authorization to implement.

Sprint 0 may establish only the minimum frontend foundation:

- approved React/TypeScript/Vite application bootstrap;
- React Router Data Mode and isolated demo shell/namespace;
- foundational tokens, global styles and essential layout primitives;
- Application Context boundary and independent reset;
- Demo Scenario State boundary with a minimal governed Scenario Definition, semantic action/selectors and atomic reset infrastructure;
- pure domain and feature-boundary conventions needed for WF-001;
- light ports/adapters boundary using only demonstrative sources;
- Vitest, Testing Library and Playwright foundations;
- accessibility and deterministic visual-test foundations;
- dependency-policy and confidentiality checks.

Sprint 0 must not include:

- WF-001 business-screen implementation unless separately authorized;
- future experience routes or empty feature scaffolds without authorization;
- real APIs, backend, database or production persistence;
- authentication/authorization implementation;
- remote loaders/actions manufactured for local data;
- TanStack Query, Storybook or other deferred libraries;
- SFC, Release, Execution, Quality Disposition or other deferred MES behavior;
- production fixtures, proprietary payloads or external contracts.

No code implementation is authorized by the creation of this document. The next governance decision is approval or rejection of ADR-001, followed—if approved—by an explicit Sprint 0 authorization.
