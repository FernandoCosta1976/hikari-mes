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

/** Convenience wrapper: derives the Business Date from a demonstrative reference timestamp (fixture) and composes it with the live clock. */
export function useLiveScenarioTime(referenceScenarioTime: string | null | undefined): string {
  const businessDate = (referenceScenarioTime ?? '2025-05-15T00:00:00-03:00').slice(0, 10);
  return useApplicationScenarioTime(businessDate);
}
