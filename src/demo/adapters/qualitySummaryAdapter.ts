import { fundicaoDcIdealCycleTimeSecondsFixture } from '../fixtures/fundicaoDcIdealCycleTime';
import { fundicaoDcQualityConfirmationsFixture } from '../fixtures/fundicaoDcQualityConfirmations';
import { classifyShiftStatus, resolveShift, type ShiftStatus } from '../../domain/oee/calculations';
import { currentExecutionForResource, type ProductionExecutionRecord } from '../../domain/production-execution/models';
import { assessPerformanceFoundation, mainLosses, qualityRate, qualitySummary, type PerformanceFoundation, type QualityConfirmation } from '../../domain/production-quality/models';
import type { Lot, ProductionSchedulingDefinition, Shift } from '../../domain/production-scheduling/models';
import { FOUNDRY_RESOURCE_IDS, type FoundryResourceId } from '../../domain/resource/models';

export interface FundicaoDcQualityRow {
  resourceId: FoundryResourceId;
  lot: Lot;
  execution: ProductionExecutionRecord;
  confirmation: QualityConfirmation | undefined;
  foundation: PerformanceFoundation;
}

export interface FundicaoDcQualityAggregate {
  produced: number;
  good: number;
  reject: number;
  rework: number;
  qualityRate: number | null;
  losses: readonly QualityConfirmation[];
}

export interface FundicaoDcQualitySummary extends FundicaoDcQualityAggregate {
  rows: readonly FundicaoDcQualityRow[];
  preparedCount: number;
}

export interface FundicaoDcShiftQualitySummary extends FundicaoDcQualityAggregate {
  shiftId: Shift['id'];
  shiftName: Shift['name'];
  status: ShiftStatus;
  rows: readonly FundicaoDcQualityRow[];
}

function buildRows(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string): readonly FundicaoDcQualityRow[] {
  const confirmationsByLot = Object.fromEntries(fundicaoDcQualityConfirmationsFixture.map((confirmation) => [confirmation.lotId, confirmation]));
  return FOUNDRY_RESOURCE_IDS.map((resourceId) => {
    const execution = currentExecutionForResource(Object.values(executionsByLot), resourceId)!;
    const lot = definition.lots.find((item) => item.id === execution.lotId)!;
    const confirmation = confirmationsByLot[execution.lotId];
    const foundation = assessPerformanceFoundation(execution, fundicaoDcIdealCycleTimeSecondsFixture[lot.materialId], currentTime);
    return { resourceId, lot, execution, confirmation, foundation };
  });
}

function aggregate(rows: readonly FundicaoDcQualityRow[]): FundicaoDcQualityAggregate {
  const confirmations = rows.map((row) => row.confirmation).filter((confirmation): confirmation is QualityConfirmation => confirmation !== undefined);
  const totals = qualitySummary(confirmations);
  return { ...totals, qualityRate: qualityRate({ producedQuantity: totals.produced, goodQuantity: totals.good }), losses: mainLosses(confirmations) };
}

/** Single source of truth for the Fundição DC Quality figures — reused by the day summary and the per-Shift breakdown so both never drift apart. */
export function computeFundicaoDcQualitySummary(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string): FundicaoDcQualitySummary {
  const rows = buildRows(definition, executionsByLot, currentTime);
  const preparedCount = rows.filter((row) => row.foundation.status === 'PREPARED').length;
  return { rows, preparedCount, ...aggregate(rows) };
}

export function computeFundicaoDcShiftQualitySummaries(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string): readonly FundicaoDcShiftQualitySummary[] {
  const rows = buildRows(definition, executionsByLot, currentTime);
  return definition.shifts.map((shift) => {
    const shiftRows = rows.filter((row) => resolveShift(definition.shifts, row.lot.scheduledStart)?.id === shift.id);
    return { shiftId: shift.id, shiftName: shift.name, status: classifyShiftStatus(shift, currentTime), rows: shiftRows, ...aggregate(shiftRows) };
  });
}
