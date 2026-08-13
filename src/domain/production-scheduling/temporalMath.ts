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
