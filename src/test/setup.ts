import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// No global clock override here: each Scenario now owns its own deterministic clock via
// `currentScenarioTime` (see src/app/clock/applicationClock.ts). Before any Scenario has
// loaded, `useApplicationScenarioTime`'s own DETERMINISTIC_SCENARIO_TIME fallback already
// provides the same '2025-05-15T17:23:00-03:00' default.

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});
