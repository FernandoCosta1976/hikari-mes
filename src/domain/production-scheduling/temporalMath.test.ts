import { describe, expect, test } from 'vitest';
import { minutesBetween, timelinePosition, timelineRange, timelineWidth } from './temporalMath';

describe('temporal math', () => {
  const rangeStart = '2025-05-15T16:00:00-03:00';
  const rangeFinish = '2025-05-15T20:00:00-03:00';

  test('calculates duration across hour boundaries', () => {
    expect(minutesBetween('2025-05-15T16:43:00-03:00', '2025-05-15T17:48:00-03:00')).toBe(65);
  });

  test('calculates start position and width in the visible range', () => {
    expect(timelinePosition('2025-05-15T17:00:00-03:00', rangeStart, rangeFinish)).toBe(25);
    expect(timelineWidth('2025-05-15T17:00:00-03:00', '2025-05-15T18:00:00-03:00', rangeStart, rangeFinish)).toBe(25);
  });

  test('clips boundaries and derives the lot range', () => {
    expect(timelineWidth('2025-05-15T15:30:00-03:00', '2025-05-15T16:30:00-03:00', rangeStart, rangeFinish)).toBe(12.5);
    expect(timelineRange([{ scheduledStart: '2025-05-15T17:00:00Z', scheduledFinish: '2025-05-15T18:00:00Z' }, { scheduledStart: '2025-05-15T16:00:00Z', scheduledFinish: '2025-05-15T19:00:00Z' }])).toEqual({ start: '2025-05-15T16:00:00.000Z', finish: '2025-05-15T19:00:00.000Z' });
  });
});
