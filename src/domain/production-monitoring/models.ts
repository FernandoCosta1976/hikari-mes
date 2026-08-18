import type { DemonstrativePauseReason, ProductionExecutionRecord } from '../production-execution/models';

export type ProductionEventStatus = 'ACTIVE' | 'CLOSED';
export type ProductionEventType =
  | 'MATERIAL' | 'MACHINE_ADJUSTMENT' | 'TOOLING' | 'QUALITY' | 'OTHER' | 'EQUIPMENT_FAILURE'
  | 'SETUP' | 'SCHEDULED_BREAK' | 'MEAL_BREAK'
  | 'MICROSTOP';

/**
 * Capability 08 — Gestão de Eventos e Paradas. Preserve, always: Execution
 * Status != Production Event != OEE Classification (Section 1). A Requirement
 * can be Execution PAUSED with a Production Event "Falha de equipamento"
 * that classifies as UNPLANNED_DOWNTIME for OEE — three different facts,
 * never collapsed into one.
 */
export type EventCategory = 'UNPLANNED_STOP' | 'PLANNED_STOP' | 'MICROSTOP';
export type OeeEventClassification = 'UNPLANNED_DOWNTIME' | 'PLANNED_TIME_EXCLUSION';
export type EventDataOrigin = 'DEMONSTRATIVE_EVENT' | 'USER_SIMULATION' | 'PLANNED_CALENDAR_EVENT';

/**
 * DEMONSTRATIVE EVENT TAXONOMY · BUSINESS_VALIDATION_REQUIRED (Section 3).
 * Deliberately minimal: five Unplanned reasons an operator can register
 * live for a RUNNING Requirement (Section 5/6), three Planned reasons
 * reserved for calendar/seeded facts (Setup, Pausa programada, Refeição —
 * not offered interactively this round, Section 46 "poucas ações"), and
 * Microparada.
 */
const EVENT_CATEGORY_BY_TYPE: Record<ProductionEventType, EventCategory> = {
  MATERIAL: 'UNPLANNED_STOP',
  MACHINE_ADJUSTMENT: 'UNPLANNED_STOP',
  TOOLING: 'UNPLANNED_STOP',
  QUALITY: 'UNPLANNED_STOP',
  OTHER: 'UNPLANNED_STOP',
  EQUIPMENT_FAILURE: 'UNPLANNED_STOP',
  SETUP: 'PLANNED_STOP',
  SCHEDULED_BREAK: 'PLANNED_STOP',
  MEAL_BREAK: 'PLANNED_STOP',
  MICROSTOP: 'MICROSTOP',
};

export function eventCategoryFor(eventType: ProductionEventType): EventCategory {
  return EVENT_CATEGORY_BY_TYPE[eventType];
}

/**
 * Single Event Source extends to presentation too (Section 24) — every
 * screen (Acompanhamento, Aderência, Execução, OEE) shows the SAME label
 * for the SAME reason, never a screen-local dictionary that can drift.
 */
export const eventTypeLabel: Record<ProductionEventType, string> = {
  EQUIPMENT_FAILURE: 'Falha de equipamento',
  MATERIAL: 'Aguardando material',
  TOOLING: 'Ferramental',
  MACHINE_ADJUSTMENT: 'Ajuste operacional',
  QUALITY: 'Qualidade',
  OTHER: 'Outro motivo demonstrativo',
  SETUP: 'Setup',
  SCHEDULED_BREAK: 'Pausa programada',
  MEAL_BREAK: 'Refeição',
  MICROSTOP: 'Microparada',
};

/**
 * DEMONSTRATIVE POLICY (Section 20) — a Microparada counts as Unplanned
 * Downtime this round, exactly like any other unplanned stop. A real
 * threshold between "counts against Availability" and "operational noise"
 * requires governance and is not decided here.
 */
export function oeeClassificationFor(eventType: ProductionEventType): OeeEventClassification {
  return eventCategoryFor(eventType) === 'PLANNED_STOP' ? 'PLANNED_TIME_EXCLUSION' : 'UNPLANNED_DOWNTIME';
}

export interface ProductionEvent {
  eventId: string;
  resourceId: string;
  /** The Production Requirement this Event belongs to — optional only for a future Resource-level Event with no active Requirement (Section 7), not used this round. */
  lotId: string;
  executionId?: string;
  eventType: ProductionEventType;
  /** Session Operational Clock instant — never Date.now() (Section 27). */
  startedAt: string;
  endedAt?: string;
  status: ProductionEventStatus;
  operator?: string;
  observation?: string;
  dataOrigin: EventDataOrigin;
  demonstrative: true;
  ruleStatus: 'BUSINESS_VALIDATION_REQUIRED';
}

export function eventDurationMinutes(event: ProductionEvent, currentTime: string) {
  const finish = event.status === 'CLOSED' && event.endedAt ? event.endedAt : currentTime;
  return Math.max(0, Math.round((Date.parse(finish) - Date.parse(event.startedAt)) / 60_000));
}

export function pauseReasonToEventType(reason: DemonstrativePauseReason): ProductionEventType {
  return reason === 'MATERIAL_SHORTAGE' ? 'MATERIAL' : reason;
}

export function monitoringCounts(records: readonly ProductionExecutionRecord[]) {
  return records.reduce((counts, record) => {
    if (record.status === 'NOT_STARTED') counts.waiting += 1;
    if (record.status === 'IN_PROGRESS') counts.running += 1;
    if (record.status === 'PAUSED') counts.paused += 1;
    if (record.status === 'COMPLETED') counts.completed += 1;
    return counts;
  }, { waiting: 0, running: 0, paused: 0, completed: 0 });
}

export function eventsNewestFirst(events: readonly ProductionEvent[]) {
  return [...events].sort((left, right) => Date.parse(right.startedAt) - Date.parse(left.startedAt));
}

export function activeEventForLot(events: readonly ProductionEvent[], lotId: string): ProductionEvent | undefined {
  return events.find((event) => event.lotId === lotId && event.status === 'ACTIVE');
}

/**
 * Unplanned Downtime (Section 9/17) — the ONLY input Availability may use
 * for downtime, derived exclusively from Events classified
 * UNPLANNED_DOWNTIME for this Requirement. Never sums every execution pause
 * blindly — a Planned Stop (Setup, Pausa programada, Refeição) never counts
 * here (Section 18).
 */
export function unplannedDowntimeMinutes(events: readonly ProductionEvent[], lotId: string, currentTime: string): number {
  return events
    .filter((event) => event.lotId === lotId && oeeClassificationFor(event.eventType) === 'UNPLANNED_DOWNTIME')
    .reduce((sum, event) => sum + eventDurationMinutes(event, currentTime), 0);
}

export function openEvent(params: { eventId: string; resourceId: string; lotId: string; executionId?: string; eventType: ProductionEventType; startedAt: string; operator?: string; observation?: string; dataOrigin: EventDataOrigin }): ProductionEvent {
  return { ...params, status: 'ACTIVE', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' };
}

export function closeEvent(event: ProductionEvent, endedAt: string): ProductionEvent {
  if (event.status !== 'ACTIVE') return event;
  return { ...event, status: 'CLOSED', endedAt };
}

/** Groups a flat Event list (e.g. a static seed fixture) by Requirement — the shape the live Scenario Store's `productionEvents` slice expects (mirrors `groupConfirmationsByRequirement`). */
export function groupEventsByLot(events: readonly ProductionEvent[]): Readonly<Record<string, readonly ProductionEvent[]>> {
  const byLot = new Map<string, ProductionEvent[]>();
  for (const event of events) byLot.set(event.lotId, [...(byLot.get(event.lotId) ?? []), event]);
  return Object.fromEntries(byLot);
}
