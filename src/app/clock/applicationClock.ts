import { useEffect, useState } from 'react';

declare global {
  interface Window {
    __HIKARI_CLOCK_FIXED_AT__?: string;
  }
}

/**
 * Single source of "now" for the whole app. Real wall-clock time in normal
 * use; a fixed instant when `window.__HIKARI_CLOCK_FIXED_AT__` is set (unit
 * and e2e tests), so demonstrative facts stay deterministic without every
 * page owning its own clock.
 */
export function applicationNow(): Date {
  if (typeof window !== 'undefined' && window.__HIKARI_CLOCK_FIXED_AT__) return new Date(window.__HIKARI_CLOCK_FIXED_AT__);
  return new Date();
}

function isClockFixed(): boolean {
  return typeof window !== 'undefined' && Boolean(window.__HIKARI_CLOCK_FIXED_AT__);
}

/** Live wall-clock hour/minute/second composed onto the demonstrative Business Date, ticking every 15s. */
export function useApplicationScenarioTime(businessDate: string): string {
  const [now, setNow] = useState(applicationNow);
  useEffect(() => {
    if (isClockFixed()) return;
    const id = setInterval(() => setNow(applicationNow()), 15_000);
    return () => clearInterval(id);
  }, []);
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
