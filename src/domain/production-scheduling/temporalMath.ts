export function minutesBetween(start: string, finish: string): number {
  return (Date.parse(finish) - Date.parse(start)) / 60_000;
}

export function timelinePosition(timestamp: string, rangeStart: string, rangeFinish: string): number {
  const total = minutesBetween(rangeStart, rangeFinish);
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (minutesBetween(rangeStart, timestamp) / total) * 100));
}

export function timelineWidth(start: string, finish: string, rangeStart: string, rangeFinish: string): number {
  const clippedStart = Math.max(Date.parse(start), Date.parse(rangeStart));
  const clippedFinish = Math.min(Date.parse(finish), Date.parse(rangeFinish));
  const range = Date.parse(rangeFinish) - Date.parse(rangeStart);
  return range <= 0 ? 0 : Math.max(0, ((clippedFinish - clippedStart) / range) * 100);
}

export function timelineRange(lots: readonly { scheduledStart: string; scheduledFinish: string }[]) {
  if (lots.length === 0) return null;
  return {
    start: new Date(Math.min(...lots.map((lot) => Date.parse(lot.scheduledStart)))).toISOString(),
    finish: new Date(Math.max(...lots.map((lot) => Date.parse(lot.scheduledFinish)))).toISOString(),
  };
}

/**
 * Global rule (single source of truth for every scrollable timeline):
 * Current Time opens at ~10% of the visible temporal viewport from the left
 * — 10% past, 90% future — so it never sits mid-screen or requires a forced
 * scroll to be found.
 */
export const CURRENT_TIME_VIEWPORT_FRACTION = 0.1;

export function calculateCurrentTimeScrollLeft(markerContentX: number, temporalViewportWidth: number, maxScrollLeft: number): number {
  return Math.min(maxScrollLeft, Math.max(0, markerContentX - temporalViewportWidth * CURRENT_TIME_VIEWPORT_FRACTION));
}

/** Scroll offset placing Current Time at the standard viewport fraction, excluding a fixed leading Resource column from the calculation. */
export function scrollLeftForCurrentTime(element: { scrollWidth: number; clientWidth: number }, currentTimePosition: number, resourceColumnWidth: number): number {
  const temporalContentWidth = Math.max(0, element.scrollWidth - resourceColumnWidth);
  const temporalViewportWidth = Math.max(0, element.clientWidth - resourceColumnWidth);
  const markerContentX = temporalContentWidth * (currentTimePosition / 100);
  return calculateCurrentTimeScrollLeft(markerContentX, temporalViewportWidth, element.scrollWidth - element.clientWidth);
}
