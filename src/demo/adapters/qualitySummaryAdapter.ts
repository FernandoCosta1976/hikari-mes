import { fundicaoDcIdealCycleTimeSecondsFixture } from '../fixtures/fundicaoDcIdealCycleTime';
import { fundicaoDcProductionConfirmationsFixture } from '../fixtures/fundicaoDcProductionConfirmations';
import { fundicaoDcQualityConfirmationsFixture } from '../fixtures/fundicaoDcQualityConfirmations';
import { classifyShiftStatus, resolveShift, type ShiftStatus } from '../../domain/oee/calculations';
import { confirmedQuantityByLot, groupConfirmationsByRequirement, type ProductionConfirmation } from '../../domain/production-confirmation/models';
import { currentExecutionForResource, type ProductionExecutionRecord } from '../../domain/production-execution/models';
import { accumulatedQuality, assessPerformanceFoundation, classifiedQuantity, groupQualityConfirmationsByRequirement, pendingClassification, qualityRate, sortByQualityLossDescending, type PerformanceFoundation, type ProductionQualityConfirmation, type QualityTotals } from '../../domain/production-quality/models';
import type { Lot, ProductionSchedulingDefinition, Shift } from '../../domain/production-scheduling/models';
import { FOUNDRY_RESOURCE_IDS, type FoundryResourceId } from '../../domain/resource/models';

export interface FundicaoDcQualityRow {
  resourceId: FoundryResourceId;
  lot: Lot;
  execution: ProductionExecutionRecord;
  /** Produced Quantity — always SUM(Production Confirmations, Capability 06), never a field on Quality Confirmation. */
  producedQuantity: number;
  quality: QualityTotals;
  classified: number;
  pending: number;
  confirmations: readonly ProductionQualityConfirmation[];
  foundation: PerformanceFoundation;
}

export interface FundicaoDcQualityLossRow {
  resourceId: FoundryResourceId;
  lot: Lot;
  reject: number;
  rework: number;
}

export interface FundicaoDcQualityAggregate {
  produced: number;
  good: number;
  reject: number;
  rework: number;
  classified: number;
  pending: number;
  qualityRate: number | null;
  losses: readonly FundicaoDcQualityLossRow[];
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

function buildRow(lot: Lot, execution: ProductionExecutionRecord, resourceId: FoundryResourceId, currentTime: string, confirmedQuantityByLotId: Readonly<Record<string, number>>, qualityConfirmationsByLot: Readonly<Record<string, readonly ProductionQualityConfirmation[]>>, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>>): FundicaoDcQualityRow {
  const confirmations = qualityConfirmationsByLot[execution.lotId] ?? [];
  const quality = accumulatedQuality(confirmations);
  const classified = classifiedQuantity(quality);
  const producedQuantity = confirmedQuantityByLotId[execution.lotId] ?? 0;
  const foundation = assessPerformanceFoundation(execution, idealCycleTimeSecondsByMaterialId[lot.materialId], currentTime);
  return { resourceId, lot, execution, producedQuantity, quality, classified, pending: pendingClassification(producedQuantity, classified), confirmations, foundation };
}

/** One row per Resource, tracking only its currently active/most-recent Lot — feeds the live machine tiles. */
function buildCurrentRows(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, confirmedQuantityByLotId: Readonly<Record<string, number>>, qualityConfirmationsByLot: Readonly<Record<string, readonly ProductionQualityConfirmation[]>>, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>>): readonly FundicaoDcQualityRow[] {
  return FOUNDRY_RESOURCE_IDS.map((resourceId) => {
    const execution = currentExecutionForResource(Object.values(executionsByLot), resourceId)!;
    const lot = definition.lots.find((item) => item.id === execution.lotId)!;
    return buildRow(lot, execution, resourceId, currentTime, confirmedQuantityByLotId, qualityConfirmationsByLot, idealCycleTimeSecondsByMaterialId);
  });
}

/**
 * One row per Lot already due (Scheduled Start <= current time) — feeds the day/Shift
 * Quality totals. A Resource with several requirements across the day must have every
 * confirmed one of them counted, not just its current Lot, otherwise already-COMPLETED
 * requirements silently vanish from the accumulated total.
 */
function buildAllDueRows(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, confirmedQuantityByLotId: Readonly<Record<string, number>>, qualityConfirmationsByLot: Readonly<Record<string, readonly ProductionQualityConfirmation[]>>, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>>): readonly FundicaoDcQualityRow[] {
  return definition.lots
    .filter((lot) => Date.parse(lot.scheduledStart) <= Date.parse(currentTime))
    .map((lot) => {
      const execution = executionsByLot[lot.id];
      if (!execution) return null;
      return buildRow(lot, execution, lot.scheduledResourceId, currentTime, confirmedQuantityByLotId, qualityConfirmationsByLot, idealCycleTimeSecondsByMaterialId);
    })
    .filter((row): row is FundicaoDcQualityRow => row !== null);
}

/**
 * "Produzido" (headline Total Count, Section 3) sums the SAME Production
 * Confirmation total every other screen reads — including Running
 * Requirements that have produced quantity but are still Pending
 * Classification. "Taxa de qualidade" is Good / Classified (Section 18) —
 * a Requirement Pending Classification neither helps nor hurts the rate.
 */
function aggregate(rows: readonly FundicaoDcQualityRow[]): FundicaoDcQualityAggregate {
  const produced = rows.reduce((sum, row) => sum + row.producedQuantity, 0);
  const good = rows.reduce((sum, row) => sum + row.quality.good, 0);
  const reject = rows.reduce((sum, row) => sum + row.quality.reject, 0);
  const rework = rows.reduce((sum, row) => sum + row.quality.rework, 0);
  const classified = rows.reduce((sum, row) => sum + row.classified, 0);
  const pending = rows.reduce((sum, row) => sum + row.pending, 0);
  const losses = sortByQualityLossDescending(rows.map((row) => ({ resourceId: row.resourceId, lot: row.lot, reject: row.quality.reject, rework: row.quality.rework })));
  return { produced, good, reject, rework, classified, pending, qualityRate: qualityRate(good, classified), losses };
}

/** Single source of truth for the Fundição DC Quality figures — reused by the day summary and the per-Shift breakdown so both never drift apart. */
export function computeFundicaoDcQualitySummary(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, qualityConfirmations: readonly ProductionQualityConfirmation[] = fundicaoDcQualityConfirmationsFixture, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>> = fundicaoDcIdealCycleTimeSecondsFixture, productionConfirmations: readonly ProductionConfirmation[] = fundicaoDcProductionConfirmationsFixture): FundicaoDcQualitySummary {
  const qualityConfirmationsByLot = groupQualityConfirmationsByRequirement(qualityConfirmations);
  const confirmedQuantityByLotId = confirmedQuantityByLot(groupConfirmationsByRequirement(productionConfirmations));
  const rows = buildCurrentRows(definition, executionsByLot, currentTime, confirmedQuantityByLotId, qualityConfirmationsByLot, idealCycleTimeSecondsByMaterialId);
  const allRows = buildAllDueRows(definition, executionsByLot, currentTime, confirmedQuantityByLotId, qualityConfirmationsByLot, idealCycleTimeSecondsByMaterialId);
  const preparedCount = rows.filter((row) => row.foundation.status === 'PREPARED').length;
  return { rows, preparedCount, ...aggregate(allRows) };
}

export function computeFundicaoDcShiftQualitySummaries(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, qualityConfirmations: readonly ProductionQualityConfirmation[] = fundicaoDcQualityConfirmationsFixture, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>> = fundicaoDcIdealCycleTimeSecondsFixture, productionConfirmations: readonly ProductionConfirmation[] = fundicaoDcProductionConfirmationsFixture): readonly FundicaoDcShiftQualitySummary[] {
  const qualityConfirmationsByLot = groupQualityConfirmationsByRequirement(qualityConfirmations);
  const confirmedQuantityByLotId = confirmedQuantityByLot(groupConfirmationsByRequirement(productionConfirmations));
  const rows = buildCurrentRows(definition, executionsByLot, currentTime, confirmedQuantityByLotId, qualityConfirmationsByLot, idealCycleTimeSecondsByMaterialId);
  const allRows = buildAllDueRows(definition, executionsByLot, currentTime, confirmedQuantityByLotId, qualityConfirmationsByLot, idealCycleTimeSecondsByMaterialId);
  return definition.shifts.map((shift) => {
    const shiftRows = rows.filter((row) => resolveShift(definition.shifts, row.lot.scheduledStart)?.id === shift.id);
    const shiftAllRows = allRows.filter((row) => resolveShift(definition.shifts, row.lot.scheduledStart)?.id === shift.id);
    return { shiftId: shift.id, shiftName: shift.name, status: classifyShiftStatus(shift, currentTime), rows: shiftRows, ...aggregate(shiftAllRows) };
  });
}
