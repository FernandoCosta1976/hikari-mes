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

function buildRows(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string): readonly FundicaoDcAdherenceRow[] {
  return FOUNDRY_RESOURCE_IDS.map((resourceId) => {
    const execution = currentExecutionForResource(Object.values(executionsByLot), resourceId)!;
    const lot = definition.lots.find((item) => item.id === execution.lotId)!;
    const assessment = assessDeviation(execution, lot, currentTime);
    const impact = assessSequenceImpact(definition.lots, lot, assessment.classification);
    return { resourceId, lot, execution, classification: assessment.classification, deviationMinutes: assessment.startDeviationMinutes, impact };
  });
}

/** Single source of truth for the Fundição DC Adherence figures — reused by the day summary and the per-Shift breakdown so both never drift apart. */
export function computeFundicaoDcAdherenceSummary(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string): FundicaoDcAdherenceSummary {
  const rows = buildRows(definition, executionsByLot, currentTime);
  return { rows, ...adherenceSummary(rows.map((row) => row.classification)) };
}

export function computeFundicaoDcShiftAdherenceSummaries(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string): readonly FundicaoDcShiftAdherenceSummary[] {
  const rows = buildRows(definition, executionsByLot, currentTime);
  return definition.shifts.map((shift) => {
    const shiftRows = rows.filter((row) => resolveShift(definition.shifts, row.lot.scheduledStart)?.id === shift.id);
    return { shiftId: shift.id, shiftName: shift.name, status: classifyShiftStatus(shift, currentTime), rows: shiftRows, ...adherenceSummary(shiftRows.map((row) => row.classification)) };
  });
}

export function rankedExceptions(rows: readonly FundicaoDcAdherenceRow[]): readonly FundicaoDcAdherenceRow[] {
  return rows.filter((row) => row.classification !== 'ON_PLAN').sort((a, b) => byOperationalRelevance(a.classification, b.classification));
}
