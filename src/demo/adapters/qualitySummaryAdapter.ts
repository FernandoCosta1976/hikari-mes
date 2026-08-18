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

function buildRow(lot: Lot, execution: ProductionExecutionRecord, resourceId: FoundryResourceId, currentTime: string, confirmationsByLot: Readonly<Record<string, QualityConfirmation>>, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>>): FundicaoDcQualityRow {
  const confirmation = confirmationsByLot[execution.lotId];
  const foundation = assessPerformanceFoundation(execution, idealCycleTimeSecondsByMaterialId[lot.materialId], currentTime);
  return { resourceId, lot, execution, confirmation, foundation };
}

/** One row per Resource, tracking only its currently active/most-recent Lot — feeds the live machine tiles. */
function buildCurrentRows(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, confirmationsByLot: Readonly<Record<string, QualityConfirmation>>, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>>): readonly FundicaoDcQualityRow[] {
  return FOUNDRY_RESOURCE_IDS.map((resourceId) => {
    const execution = currentExecutionForResource(Object.values(executionsByLot), resourceId)!;
    const lot = definition.lots.find((item) => item.id === execution.lotId)!;
    return buildRow(lot, execution, resourceId, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  });
}

/**
 * One row per Lot already due (Scheduled Start <= current time) — feeds the day/Shift
 * Quality totals. A Resource with several requirements across the day must have every
 * confirmed one of them counted, not just its current Lot, otherwise already-COMPLETED
 * requirements silently vanish from the accumulated total.
 */
function buildAllDueRows(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, confirmationsByLot: Readonly<Record<string, QualityConfirmation>>, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>>): readonly FundicaoDcQualityRow[] {
  return definition.lots
    .filter((lot) => Date.parse(lot.scheduledStart) <= Date.parse(currentTime))
    .map((lot) => {
      const execution = executionsByLot[lot.id];
      if (!execution) return null;
      return buildRow(lot, execution, lot.scheduledResourceId, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
    })
    .filter((row): row is FundicaoDcQualityRow => row !== null);
}

function aggregate(rows: readonly FundicaoDcQualityRow[]): FundicaoDcQualityAggregate {
  const confirmations = rows.map((row) => row.confirmation).filter((confirmation): confirmation is QualityConfirmation => confirmation !== undefined);
  const totals = qualitySummary(confirmations);
  return { ...totals, qualityRate: qualityRate({ producedQuantity: totals.produced, goodQuantity: totals.good }), losses: mainLosses(confirmations) };
}

/** Single source of truth for the Fundição DC Quality figures — reused by the day summary and the per-Shift breakdown so both never drift apart. */
export function computeFundicaoDcQualitySummary(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, qualityConfirmations: readonly QualityConfirmation[] = fundicaoDcQualityConfirmationsFixture, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>> = fundicaoDcIdealCycleTimeSecondsFixture): FundicaoDcQualitySummary {
  const confirmationsByLot = Object.fromEntries(qualityConfirmations.map((confirmation) => [confirmation.lotId, confirmation]));
  const rows = buildCurrentRows(definition, executionsByLot, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  const allRows = buildAllDueRows(definition, executionsByLot, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  const preparedCount = rows.filter((row) => row.foundation.status === 'PREPARED').length;
  return { rows, preparedCount, ...aggregate(allRows) };
}

export function computeFundicaoDcShiftQualitySummaries(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, qualityConfirmations: readonly QualityConfirmation[] = fundicaoDcQualityConfirmationsFixture, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>> = fundicaoDcIdealCycleTimeSecondsFixture): readonly FundicaoDcShiftQualitySummary[] {
  const confirmationsByLot = Object.fromEntries(qualityConfirmations.map((confirmation) => [confirmation.lotId, confirmation]));
  const rows = buildCurrentRows(definition, executionsByLot, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  const allRows = buildAllDueRows(definition, executionsByLot, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  return definition.shifts.map((shift) => {
    const shiftRows = rows.filter((row) => resolveShift(definition.shifts, row.lot.scheduledStart)?.id === shift.id);
    const shiftAllRows = allRows.filter((row) => resolveShift(definition.shifts, row.lot.scheduledStart)?.id === shift.id);
    return { shiftId: shift.id, shiftName: shift.name, status: classifyShiftStatus(shift, currentTime), rows: shiftRows, ...aggregate(shiftAllRows) };
  });
}
