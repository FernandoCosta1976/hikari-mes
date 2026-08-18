declare global {
  interface Window {
    __HIKARI_CLOCK_FIXED_AT__?: string;
  }
}

// Executive demo uses deterministic scenario time.
const DETERMINISTIC_SCENARIO_TIME = '2025-05-15T17:23:00-03:00';

/**
 * Single source of "now" for the whole app. The demonstration is fully
 * deterministic: it never reads the browser's real wall-clock time, so
 * every screen (Current Time Marker, shift classification, Lot Execution
 * Health, OEE, Adherence, Quality) agrees on the same instant.
 */
export function applicationNow(): Date {
  if (typeof window !== 'undefined' && window.__HIKARI_CLOCK_FIXED_AT__) return new Date(window.__HIKARI_CLOCK_FIXED_AT__);
  return new Date(DETERMINISTIC_SCENARIO_TIME);
}

/** Demonstrative hour/minute/second composed onto the given Business Date. Deterministic — does not tick with real time. */
export function useApplicationScenarioTime(businessDate: string): string {
  const now = applicationNow();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${businessDate}T${hh}:${mm}:${ss}-03:00`;
}

/**
 * Each Scenario owns its full deterministic clock (Business Date AND
 * Scenario Clock time-of-day) via its own `currentScenarioTime` — this is
 * still never `Date.now()`, just a fixed value scoped to the Scenario
 * rather than one shared global. Before any Scenario has loaded, falls back
 * to composing the app-wide demonstrative time onto a placeholder date.
 * `window.__HIKARI_CLOCK_FIXED_AT__` (E2E-only override, see `freezeClockAt`
 * in e2e/dynamic-clock.spec.ts) always wins, for every Scenario, so tests can
 * still exercise shift-derivation logic at an arbitrary instant.
 */
export function useLiveScenarioTime(referenceScenarioTime: string | null | undefined): string {
  if (typeof window !== 'undefined' && window.__HIKARI_CLOCK_FIXED_AT__) return window.__HIKARI_CLOCK_FIXED_AT__;
  if (referenceScenarioTime) return referenceScenarioTime;
  return useApplicationScenarioTime('2025-05-15');
}
