import { test, expect } from '@playwright/test';

// No global clock override here: each Scenario now owns its own deterministic clock via
// `currentScenarioTime` (see src/app/clock/applicationClock.ts) — a blanket override would
// win over every Scenario's own time (including the reference 2026-07-10 · 09:15 one) and
// silently show the wrong clock. Before any Scenario has loaded, `useApplicationScenarioTime`'s
// own DETERMINISTIC_SCENARIO_TIME fallback already provides the same
// '2025-05-15T17:23:00-03:00' default that the legacy Scenario's own `currentScenarioTime` uses.

export { test, expect };
