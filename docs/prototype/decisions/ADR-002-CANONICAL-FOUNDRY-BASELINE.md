# ADR-002 — Canonical Foundry Baseline & PowerTrain Context

Status: Accepted
Date: 2026-08-17

## Context

The prototype previously ran two competing Fundição DC universes: an artificial
Material A/B/C scenario (the original demonstrative baseline) and a
source-derived dataset built from real business-validation spreadsheets
(`docs/prototype/source-data/business-validation/foundry/`) — added as a
second, URL-only-reachable scenario (`fundicao-dc-source-derived`) to prove
the pipeline before committing to it as the default experience.

This round promotes the source-derived dataset to be the official runtime
scenario, introduces the PowerTrain production-group hierarchy, and removes
the hardcoded `/demo/fundicao-dc/...` navigation that made a second scenario
unreachable through normal use.

## Decisions

### 1. Scenario promotion (Section 2 / 14)

- `fundicao-dc` (the id resolved by all default routes, the root redirect,
  and every in-app link) now points at the **source-derived** scenario
  (`src/demo/scenarios/fundicaoDcSourceDerivedScenario.ts`).
- The original Material A/B/C scenario is preserved unmodified as a **test
  fixture**, renamed to `fundicao-dc-legacy`
  (`src/demo/scenarios/fundicaoDcScenario.ts`). It is still fully reachable at
  `/demo/fundicao-dc-legacy/...` for historical E2E/unit test regression
  coverage — none of that coverage was deleted, only repointed.
- Rationale for **promoting in place** (Option A of Section 14) rather than
  making the scenario id itself data-driven (Option B): the router already
  treats `scenarioId` as a generic `:scenarioId` param resolved through
  `scenarioDefinitionAdapter.findById`, so "promotion" is a one-line `id`
  swap per scenario file — no router change was needed, and every existing
  test that imports a scenario module directly (16 unit test files) is
  unaffected because they never depended on the `.id` string.

### 2. Scenario-aware navigation (Section 13)

- Added `useScenarioPath()` (`src/app/routing/useScenarioPath.ts`): reads
  `scenarioId` from the current route (`useParams()`) and composes
  `/demo/${scenarioId}${subPath}`, falling back to `fundicao-dc` only when no
  scenario is in the URL at all (e.g. the wildcard 404 route).
- Every hardcoded `/demo/fundicao-dc/...` internal link was replaced with
  `scenarioPath(...)` — sidebar (`OperationalWorkspace`), guided demo journey
  bar, Executive Home (topbar, hero CTAs, capability roadmap links), Plano →
  Preparação handoff, Lot Context Modal (Abrir Execução / Abrir Ordem),
  Release Group Drawer, Order Workspace, Estratégica CTAs, Route error
  fallback. This is what makes `fundicao-dc-legacy` fully browsable end to
  end today, not just via direct URL — the same mechanism keeps any future
  additional scenario reachable without another audit.
- The guided demo journey (`src/app/workspace/demoJourney.ts`) deep-links to
  a specific Lot at its Preparação/Liberação steps; since that Lot id is
  inherently scenario-specific, `demoJourney(scenarioId)` now resolves it per
  scenario instead of hardcoding the legacy Lot 251/252.

### 3. Persistence is scenario-scoped (bug found and fixed this round)

- `localStorage` persistence used a single fixed key
  (`hikari:demo:fundicao-dc:v1`) regardless of which scenario was active.
  Promoting a second scenario onto the same route surfaced a real
  cross-scenario data leak: reloading scenario A rehydrated decisions saved
  under scenario B, producing an immediate runtime crash on unrelated Lot
  ids. Fixed by `scenarioStorageKey(scenarioId)` — every scenario now reads
  and writes its own key (`hikari:demo:<scenarioId>:v1`); the canonical
  scenario's key is unchanged (`hikari:demo:fundicao-dc:v1`), so no existing
  persisted demo state is invalidated.

### 4. PowerTrain domain hierarchy (Section 4 / 5)

- `src/domain/production-group/models.ts` introduces `ProductionGroup`
  (PowerTrain) as a grouping **above** Área Produtiva — never a Resource,
  Work Center, or a peer of Fundição DC.
- `powertrainProductiveAreas` registers the five governed Áreas (Fundição DC,
  Fundição LP, Usinagem Ferrosos, Usinagem Alumínio, Pintura Alumínio) as
  **master data only**. Only Fundição DC is flagged `operational: true`; the
  other four have no execution, readiness, OEE, or adherence data — and none
  was fabricated for them this round.
- DC01–DC05 remain Resources (`FOUNDRY_RESOURCE_IDS`), never registered as
  Áreas Produtivas — enforced by an explicit regression test (Section 19.3).
- UX footprint is deliberately minimal: the sidebar's existing "Área
  Produtiva" label became "PowerTrain · Área Produtiva" (a static text
  change, zero layout height added) — no new interactive PowerTrain screen
  or area switcher was built, per Section 5's explicit "não implementar
  agora" and Section 16.

### 5. Business Date (Section 6)

- The dataset spans ~18 distinct business dates. The baseline demonstrative
  date is **2026-07-09** — the earliest date in the source, and the one with
  the best small, self-contained demonstrative coverage: 8 distinct LINHA C
  source Lots, resolving to 21 Fundição DC Lots across all five machines
  (close to the original 21-Lot legacy narrative) plus 8 Fundição LP
  (Cabeçote) requirements correctly excluded from the DC lanes.
  `docs/prototype/source-data/business-validation/foundry` and
  `src/demo/reference-data/foundry/foundryComponentRequirements.ts` retain
  every other date's resolved requirements — nothing was discarded, only one
  date was selected to materialize as the operational Plano.
  `productionSchedulingViewModel.ts`'s date-offset lookup falls back to
  `definition.schedules[0]` when the legacy hardcoded schedule id doesn't
  exist, so this is a data selection, not a hardcoded assumption a future
  scenario would have to fight.
- No interval without a real, source-derived requirement was padded with an
  invented Lot — DC02/DC03/DC04 legitimately carry far fewer Lots than DC01
  on this date because that is what the source data says.

### 6. Primary / Reserve / Programmed / Assignment semantics (Section 8)

The domain already distinguished `scheduledResourceId` (Programmed) from an
operational override (`organizationsByLotId`) prior to this round. This round
adds the missing distinction the task explicitly asked for: **Primary** and
**Reserve**, sourced directly from `componentResourceMappings` (the "máquina
titular e reserva" business master data), surfaced in the Lot Context Modal
as its own block ("Máquina titular" / "Reserva(s)"). None of the five states
are conflated:

- `scheduledResourceId` — **Programmed** (what the received plan says).
- `componentResourceMappings[...].primaryResource` — **Primary** (preferred
  resource from business master data).
- `componentResourceMappings[...].reserveResources` — **Reserve** (alternative
  eligible resources from the same master data, with their own confirmed/not
  confirmed standard status — never inferred as blocking).
- `organizationsByLotId[...].operationalResourceId` — the closest the
  prototype has to a confirmed assignment, and it is still explicitly
  demonstrative (WF-003 Resource Assignment/Dispatch is out of scope, Section
  16).
- Execution's `resourceId` — **Actual/Dispatched**, only populated once a Lot
  has truly started.

### 7. Actual Production: unknown vs. zero (Section 15)

- `ProductionSchedulingPage`'s commitment line ("Produzido X · Y% atingido")
  now reads as **absent** (hidden entirely) rather than a fabricated "0
  produced / 0% atingido" when no Quality confirmation exists yet for any
  Resource on the active Business Date — the canonical scenario has no
  Quality-confirmation fixture yet (Quality/Losses/OEE are explicitly out of
  scope this round, Section 16), so its true state is "no data", not "zero
  good pieces". The legacy scenario is unaffected: it has real confirmations,
  so the line renders exactly as before.
- This is a narrow, page-local fix (`compromissoProduced` in
  `ProductionSchedulingPage.tsx`) — it does not touch the shared
  `computeFundicaoDcQualitySummary` adapter or the Quality/OEE domain model,
  both out of scope this round.

### 8. Buffer stays demonstrative (Section 12)

Unchanged — the two canonical sources (LINHA C OFC, FUNDIÇÃO/máquina master)
do not carry physical stock/coverage data. The canonical scenario's Buffer
block is explicitly labeled "Critério operacional demonstrativo" and was not
recalculated from the new dataset (see ADR — Section 25 of the prior round's
brief, unchanged).

## Consequences

- The default demo (`/demo/fundicao-dc`) now shows real component codes,
  real machine assignments, and real Linha C traceability end to end for
  WF-001 and WF-002.
- Acompanhamento, Aderência, Qualidade and OEE are **not yet verified** for
  the canonical scenario (see PENDÊNCIAS in the round's final report) — they
  depend on fixtures (quality confirmations, a wider time window) that are
  explicitly out of scope this round (Section 16: no Quality/Losses/OEE
  work). Visiting those perspectives under `/demo/fundicao-dc/...` will not
  crash, but will show sparse/zeroed data until that follow-up round lands.
- A future **PowerTrain Production Control View** (Section 17) can be built
  directly on `powertrainProductiveAreas` without further domain changes —
  it only needs real operational data for the four non-Fundição-DC Áreas,
  which remains explicitly out of scope.

## Related documents

- [ADR-001](ADR-001-PROTOTYPE-FRONTEND-FOUNDATION.md) — frontend foundation.
- `docs/prototype/source-data/business-validation/foundry/` — canonical
  source spreadsheets (never read at runtime) and the derivation pipeline
  (`scripts/data-pipeline/build_foundry_dataset.py`).
- `src/demo/reference-data/foundry/` — the derived, versioned canonical
  dataset (components, aliases, resource mappings, model↔component
  resolution table, full requirement/exclusion set, audit counts).
