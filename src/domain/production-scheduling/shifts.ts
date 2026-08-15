import type { Lot, PlannedShiftBreak, Shift } from './models';

const atTime = (businessDate: string, time: string) => `${businessDate}T${time}:00-03:00`;

const minuteAfter = (timestamp: string) => new Date(Date.parse(timestamp) + 60_000).toISOString();

export function shiftWindow(businessDate: string, shift: Shift) {
  return {
    start: atTime(businessDate, shift.startTime),
    finish: minuteAfter(atTime(businessDate, shift.endTime)),
  };
}

export function breakWindow(businessDate: string, plannedBreak: PlannedShiftBreak) {
  return {
    start: atTime(businessDate, plannedBreak.startTime),
    finish: atTime(businessDate, plannedBreak.endTime),
  };
}

export function shiftForLot(lot: Lot, shifts: readonly Shift[], businessDate: string): Shift | undefined {
  return shifts.find((shift) => {
    const window = shiftWindow(businessDate, shift);
    return Date.parse(lot.scheduledStart) >= Date.parse(window.start) && Date.parse(lot.scheduledFinish) <= Date.parse(window.finish);
  });
}

export function lotOverlapsBreak(lot: Lot, plannedBreak: PlannedShiftBreak, businessDate: string): boolean {
  const window = breakWindow(businessDate, plannedBreak);
  return Date.parse(lot.scheduledStart) < Date.parse(window.finish) && Date.parse(window.start) < Date.parse(lot.scheduledFinish);
}
