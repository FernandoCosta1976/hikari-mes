# Executive Demo — Feature Freeze

## Scope frozen

| Field | Value |
|---|---|
| Scenario | `fundicao-dc` (PowerTrain → Fundição DC → DC01–DC05) |
| Reference Day | 10/07/2026 |
| Initial Scenario Clock | 09:15 |
| Shift | Turno 1 |
| Commit | `f34952d` — "fix: unify machine operational state across executive views" |
| Public URL | https://fernandocosta1976.github.io/hikari-mes/demo/fundicao-dc |

This is the exact state validated end to end (unit + integration + Playwright,
axe, keyboard, responsive 1440/1280/1024, terminology, clock consistency,
timeline consistency, machine-state consistency, cross-screen metric
consistency) and confirmed live on GitHub Pages immediately before this
freeze was declared.

Superseded prior baselines: `e1d5e79` (Capability 09), `85c2d28` (Unified
Operational Timeline). Both stability fixes are folded into this freeze.

## Capabilities in scope at freeze

01 through 09 — Plano, Preparação, Liberação, Execução, Acompanhamento,
Confirmação de Produção, Status Operacional, Gestão de Eventos e Paradas,
Qualidade e Perdas — plus Aderência, OEE and Visão Estratégica as the shared
consuming screens. Every screen reads governed, single-source facts
(Production Confirmations, Production Events, Quality Confirmations,
Operational Status) — no screen recomputes its own version of a shared
number.

**Operational Timeline: FROZEN** — Original Plan/Current Plan/Actual/Projected
per Requirement per Resource, computed once (`domain/operational-timeline`)
and consumed identically by Plano, Preparação, Acompanhamento and Aderência.

**Machine Operational State: FROZEN** — one `ResourceOperationalSnapshot` per
Resource (`demo/adapters/resourceOperationalSnapshotAdapter.ts`), consumed
identically by Acompanhamento, Aderência, Qualidade & Desempenho, OEE and
Visão Estratégica. OEE and Quality never determine it — they only annotate it.

**Metrics: FROZEN** — Availability/Performance/Quality/OEE, Adherence, and
Quality Rate all derive from the same governed fact chain documented in
`EXECUTIVE-DEMO-NUMBERS.md`.

## Allowed changes after this freeze

Only:

- **P0 bugs** — the demo is broken or shows something factually wrong.
- **P1 bugs** — a real defect visible in the flow the director will see.
- **Data inconsistency** — a number that disagrees with itself across
  screens, or a demonstrative fact that contradicts another demonstrative
  fact.
- **Presentation blocker** — anything that would visibly fail or embarrass
  the presenter live (e.g. a crash, a broken modal, unreadable overflow at
  the presentation viewport).

## Prohibited after this freeze

- A new Capability.
- Redesign of any existing screen.
- Non-essential refactor.
- New architecture (new domain layering, new state pattern, new adapter
  shape) without a P0/P1 driving it.
- A new dashboard or analytical surface.
- Cosmetic adjustment with no bearing on the presentation.

## Reset guarantee

"Reiniciar cenário" restores, in one action, to the exact 10/07/2026 09:15
Turno 1 baseline: Plano Vigente, Readiness, Release, Execution, Production
Confirmations, Operational Status, Production Events, Quality Confirmations,
Projection, Aderência, OEE and Visão Estratégica. Verified locally
(`scenarioStore.test.ts`, `scenarioStore.persistence.test.ts`) and live on
the public URL as part of this freeze.

## Known non-blocking state

- Several Requirements (DC02/DC03/DC04/DC05's current Lot at 09:15) carry a
  genuine, honest 100% Pending Classification balance — Produced is known
  from Production Confirmations, but no Quality Confirmation has been
  registered for them yet. This is real MES lag (quality classification
  trailing production), not a defect; their OEE Quality and Qualidade &
  Desempenho rate correctly show N/A rather than a fabricated number.
- The bundled JS chunk exceeds Vite's 500kB warning threshold. Cosmetic
  build-tooling note, not a runtime defect — explicitly out of scope for
  this freeze (would require code-splitting, a non-essential refactor).
- Visão Estratégica's machine grid additionally shows each Resource's **Lot
  Health** (`assessLotExecutionHealth`, Capability 05) alongside the
  Operational State/Adherence Qualifier pair every screen now shares. Lot
  Health is an intentionally richer, quantity-aware risk assessment that
  predates this freeze and was left untouched — it is not expected to
  numerically agree with the Adherence Qualifier (e.g. a machine can be
  "No prazo" by Adherence Qualifier while Lot Health flags it "Risco de
  atraso" on projected quantity). Documented, not a defect.

---

**HIKARI EXECUTIVE DEMO FROZEN — READY FOR DIRECTOR PRESENTATION**
