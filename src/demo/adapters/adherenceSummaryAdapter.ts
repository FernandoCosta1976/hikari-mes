import { classifyShiftStatus, resolveShift, type ShiftStatus } from '../../domain/oee/calculations';
import { adherenceSummary, assessDeviation, assessSequenceImpact, byOperationalRelevance, type DeviationClassification, type SequenceImpact } from '../../domain/production-adherence/models';
import { currentExecutionForResource, type ProductionExecutionRecord } from '../../domain/production-execution/models';
import type { Lot, ProductionSchedulingDefinition, Shift } from '../../domain/production-scheduling/models';
import { FOUNDRY_RESOURCE_IDS, type FoundryResourceId } from '../../domain/resource/models';

export interface FundicaoDcAdherenceRow {
  resourceId: FoundryResourceId;
  lot: Lot;
  execution: ProductionExecutionRecord;
  classification: DeviationClassification;
  deviationMinutes: number | null;
  impact: SequenceImpact | null;
}

export interface FundicaoDcAdherenceAggregate {
  onPlan: number;
  total: number;
  ratio: number;
}

export interface FundicaoDcAdherenceSummary extends FundicaoDcAdherenceAggregate {
  rows: readonly FundicaoDcAdherenceRow[];
}

export interface FundicaoDcShiftAdherenceSummary extends FundicaoDcAdherenceAggregate {
  shiftId: Shift['id'];
  shiftName: Shift['name'];
  status: ShiftStatus;
  rows: readonly FundicaoDcAdherenceRow[];
}

export function buildRow(lot: Lot, execution: ProductionExecutionRecord, resourceId: FoundryResourceId, definition: ProductionSchedulingDefinition, currentTime: string): FundicaoDcAdherenceRow {
  const assessment = assessDeviation(execution, lot, currentTime);
  const impact = assessSequenceImpact(definition.lots, lot, assessment.classification);
  return { resourceId, lot, execution, classification: assessment.classification, deviationMinutes: assessment.startDeviationMinutes, impact };
}

/** One row per Resource, tracking only its currently active/most-recent Lot — feeds the live machine tiles and the timeline. */
function buildCurrentRows(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string): readonly FundicaoDcAdherenceRow[] {
  return FOUNDRY_RESOURCE_IDS.map((resourceId) => {
    const execution = currentExecutionForResource(Object.values(executionsByLot), resourceId)!;
    const lot = definition.lots.find((item) => item.id === execution.lotId)!;
    return buildRow(lot, execution, resourceId, definition, currentTime);
  });
}

/**
 * One row per Lot already due (Scheduled Start <= current time) — feeds the day/Shift
 * Adherence ratio. A Resource with several requirements across the day must have every one
 * of them counted, not just its current Lot, otherwise already-COMPLETED requirements
 * silently vanish from the accumulated total.
 */
function buildAllDueRows(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string): readonly FundicaoDcAdherenceRow[] {
  return definition.lots
    .filter((lot) => Date.parse(lot.scheduledStart) <= Date.parse(currentTime))
    .map((lot) => {
      const execution = executionsByLot[lot.id];
      if (!execution) return null;
      return buildRow(lot, execution, lot.scheduledResourceId, definition, currentTime);
    })
    .filter((row): row is FundicaoDcAdherenceRow => row !== null);
}

/** Single source of truth for the Fundição DC Adherence figures — reused by the day summary and the per-Shift breakdown so both never drift apart. */
export function computeFundicaoDcAdherenceSummary(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string): FundicaoDcAdherenceSummary {
  const rows = buildCurrentRows(definition, executionsByLot, currentTime);
  const allRows = buildAllDueRows(definition, executionsByLot, currentTime);
  return { rows, ...adherenceSummary(allRows.map((row) => row.classification)) };
}

export function computeFundicaoDcShiftAdherenceSummaries(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string): readonly FundicaoDcShiftAdherenceSummary[] {
  const rows = buildCurrentRows(definition, executionsByLot, currentTime);
  const allRows = buildAllDueRows(definition, executionsByLot, currentTime);
  return definition.shifts.map((shift) => {
    const shiftRows = rows.filter((row) => resolveShift(definition.shifts, row.lot.scheduledStart)?.id === shift.id);
    const shiftAllRows = allRows.filter((row) => resolveShift(definition.shifts, row.lot.scheduledStart)?.id === shift.id);
    return { shiftId: shift.id, shiftName: shift.name, status: classifyShiftStatus(shift, currentTime), rows: shiftRows, ...adherenceSummary(shiftAllRows.map((row) => row.classification)) };
  });
}

export function rankedExceptions(rows: readonly FundicaoDcAdherenceRow[]): readonly FundicaoDcAdherenceRow[] {
  return rows.filter((row) => row.classification !== 'ON_PLAN').sort((a, b) => byOperationalRelevance(a.classification, b.classification));
}
