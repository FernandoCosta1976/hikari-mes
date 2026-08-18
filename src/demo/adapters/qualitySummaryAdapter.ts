import { fundicaoDcIdealCycleTimeSecondsFixture } from '../fixtures/fundicaoDcIdealCycleTime';
import { fundicaoDcProductionConfirmationsFixture } from '../fixtures/fundicaoDcProductionConfirmations';
import { fundicaoDcQualityConfirmationsFixture } from '../fixtures/fundicaoDcQualityConfirmations';
import { classifyShiftStatus, resolveShift, type ShiftStatus } from '../../domain/oee/calculations';
import { confirmedQuantityByLot, groupConfirmationsByRequirement, type ProductionConfirmation } from '../../domain/production-confirmation/models';
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

/**
 * "Produzido" (headline Total Count, Section 24) sums the full confirmed
 * aggregate across the due rows — including Running Requirements that have
 * a confirmed quantity but no Quality classification yet. "Taxa de
 * qualidade" deliberately keeps its existing formula, computed only over
 * rows that already carry a Quality Confirmation (Section 23: a Requirement
 * pending classification neither helps nor hurts the rate — it is not
 * assumed to be good or bad).
 */
function aggregate(rows: readonly FundicaoDcQualityRow[], confirmedQuantityByLotId: Readonly<Record<string, number>>): FundicaoDcQualityAggregate {
  const confirmations = rows.map((row) => row.confirmation).filter((confirmation): confirmation is QualityConfirmation => confirmation !== undefined);
  const classified = qualitySummary(confirmations);
  const produced = rows.reduce((sum, row) => sum + (confirmedQuantityByLotId[row.lot.id] ?? 0), 0);
  return { produced, good: classified.good, reject: classified.reject, rework: classified.rework, qualityRate: qualityRate({ producedQuantity: classified.produced, goodQuantity: classified.good }), losses: mainLosses(confirmations) };
}

/** Single source of truth for the Fundição DC Quality figures — reused by the day summary and the per-Shift breakdown so both never drift apart. */
export function computeFundicaoDcQualitySummary(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, qualityConfirmations: readonly QualityConfirmation[] = fundicaoDcQualityConfirmationsFixture, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>> = fundicaoDcIdealCycleTimeSecondsFixture, productionConfirmations: readonly ProductionConfirmation[] = fundicaoDcProductionConfirmationsFixture): FundicaoDcQualitySummary {
  const confirmationsByLot = Object.fromEntries(qualityConfirmations.map((confirmation) => [confirmation.lotId, confirmation]));
  const confirmedQuantityByLotId = confirmedQuantityByLot(groupConfirmationsByRequirement(productionConfirmations));
  const rows = buildCurrentRows(definition, executionsByLot, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  const allRows = buildAllDueRows(definition, executionsByLot, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  const preparedCount = rows.filter((row) => row.foundation.status === 'PREPARED').length;
  return { rows, preparedCount, ...aggregate(allRows, confirmedQuantityByLotId) };
}

export function computeFundicaoDcShiftQualitySummaries(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, qualityConfirmations: readonly QualityConfirmation[] = fundicaoDcQualityConfirmationsFixture, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>> = fundicaoDcIdealCycleTimeSecondsFixture, productionConfirmations: readonly ProductionConfirmation[] = fundicaoDcProductionConfirmationsFixture): readonly FundicaoDcShiftQualitySummary[] {
  const confirmationsByLot = Object.fromEntries(qualityConfirmations.map((confirmation) => [confirmation.lotId, confirmation]));
  const confirmedQuantityByLotId = confirmedQuantityByLot(groupConfirmationsByRequirement(productionConfirmations));
  const rows = buildCurrentRows(definition, executionsByLot, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  const allRows = buildAllDueRows(definition, executionsByLot, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  return definition.shifts.map((shift) => {
    const shiftRows = rows.filter((row) => resolveShift(definition.shifts, row.lot.scheduledStart)?.id === shift.id);
    const shiftAllRows = allRows.filter((row) => resolveShift(definition.shifts, row.lot.scheduledStart)?.id === shift.id);
    return { shiftId: shift.id, shiftName: shift.name, status: classifyShiftStatus(shift, currentTime), rows: shiftRows, ...aggregate(shiftAllRows, confirmedQuantityByLotId) };
  });
}
