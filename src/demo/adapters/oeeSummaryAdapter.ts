import { fundicaoDcIdealCycleTimeSecondsFixture } from '../fixtures/fundicaoDcIdealCycleTime';
import { fundicaoDcQualityConfirmationsFixture } from '../fixtures/fundicaoDcQualityConfirmations';
import { aggregateAvailability, aggregatePerformance, aggregateQuality, assessAvailability, assessOee, assessPerformance, classifyShiftStatus, plannedProductionTimeMinutes, resolveShift, topOeeImpacts, type OeeDimension, type ResourceOeeRow, type ShiftStatus } from '../../domain/oee/calculations';
import { currentExecutionForResource, type ProductionExecutionRecord } from '../../domain/production-execution/models';
import { knownRunTimeMinutes, type QualityConfirmation } from '../../domain/production-quality/models';
import type { Lot, ProductionSchedulingDefinition, Shift } from '../../domain/production-scheduling/models';
import { FOUNDRY_RESOURCE_IDS, type FoundryResourceId } from '../../domain/resource/models';

export interface FundicaoDcOeeRow extends ResourceOeeRow {
  resourceId: FoundryResourceId;
  lot: Lot;
  execution: ProductionExecutionRecord;
}

export interface FundicaoDcOeeImpact {
  dimension: OeeDimension;
  resourceId: FoundryResourceId;
  lossFraction: number;
}

export interface FundicaoDcOeeAggregate {
  areaAvailability: number | null;
  areaPerformance: number | null;
  areaQuality: number | null;
  areaOee: number | null;
  producedQuantity: number;
  impacts: readonly FundicaoDcOeeImpact[];
  mainImpact: FundicaoDcOeeImpact | null;
}

export interface FundicaoDcOeeSummary extends FundicaoDcOeeAggregate {
  rows: readonly FundicaoDcOeeRow[];
}

export interface FundicaoDcShiftOeeSummary extends FundicaoDcOeeAggregate {
  shiftId: Shift['id'];
  shiftName: Shift['name'];
  status: ShiftStatus;
  rows: readonly FundicaoDcOeeRow[];
}

function buildRow(lot: Lot, execution: ProductionExecutionRecord, resourceId: FoundryResourceId, definition: ProductionSchedulingDefinition, currentTime: string, confirmationsByLot: Readonly<Record<string, QualityConfirmation>>, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>>): FundicaoDcOeeRow {
  const runTimeMinutes = knownRunTimeMinutes(execution, currentTime);
  const plannedTimeMinutes = plannedProductionTimeMinutes(lot, execution, definition.shifts, currentTime);
  const idealCycleTimeSeconds = idealCycleTimeSecondsByMaterialId[lot.materialId] ?? null;
  const confirmation = confirmationsByLot[execution.lotId];
  const goodQuantity = confirmation?.goodQuantity ?? null;
  const availability = assessAvailability(runTimeMinutes, plannedTimeMinutes);
  const performance = assessPerformance(idealCycleTimeSeconds, execution.producedQuantity, runTimeMinutes);
  const quality = confirmation ? confirmation.goodQuantity / confirmation.producedQuantity : null;
  return { resourceId, lot, execution, runTimeMinutes, plannedTimeMinutes, idealCycleTimeSeconds, producedQuantity: execution.producedQuantity, goodQuantity, availability, performance, quality, oee: assessOee(availability, performance, quality) };
}

/** One row per Resource, tracking only its currently active/most-recent Lot — feeds the live machine tiles and "maior perda" narrative (which resource, which Lot, right now). */
function buildCurrentRows(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, confirmationsByLot: Readonly<Record<string, QualityConfirmation>>, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>>): readonly FundicaoDcOeeRow[] {
  return FOUNDRY_RESOURCE_IDS.map((resourceId) => {
    const execution = currentExecutionForResource(Object.values(executionsByLot), resourceId)!;
    const lot = definition.lots.find((item) => item.id === execution.lotId)!;
    return buildRow(lot, execution, resourceId, definition, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  });
}

/**
 * One row per Lot already due (Scheduled Start <= current time) — feeds the day/Shift OEE
 * totals. A Resource with several requirements across the day (the canonical dataset has up
 * to 10 on one Resource) must have every one of them counted, not just its current Lot —
 * otherwise already-COMPLETED requirements silently vanish from the accumulated total.
 */
function buildAllDueRows(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, confirmationsByLot: Readonly<Record<string, QualityConfirmation>>, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>>): readonly FundicaoDcOeeRow[] {
  return definition.lots
    .filter((lot) => Date.parse(lot.scheduledStart) <= Date.parse(currentTime))
    .map((lot) => {
      const execution = executionsByLot[lot.id];
      if (!execution) return null;
      return buildRow(lot, execution, lot.scheduledResourceId, definition, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
    })
    .filter((row): row is FundicaoDcOeeRow => row !== null);
}

function aggregateRows(allRows: readonly FundicaoDcOeeRow[], currentRows: readonly FundicaoDcOeeRow[]): FundicaoDcOeeAggregate {
  const areaAvailability = aggregateAvailability(allRows);
  const areaPerformance = aggregatePerformance(allRows);
  const areaQuality = aggregateQuality(allRows);
  const areaOee = assessOee(areaAvailability, areaPerformance, areaQuality);
  const producedQuantity = allRows.reduce((sum, row) => sum + row.producedQuantity, 0);
  const impacts: readonly FundicaoDcOeeImpact[] = topOeeImpacts(currentRows).map((impact) => ({ dimension: impact.dimension, resourceId: impact.resourceId as FoundryResourceId, lossFraction: impact.lossFraction }));
  return { areaAvailability, areaPerformance, areaQuality, areaOee, producedQuantity, impacts, mainImpact: impacts[0] ?? null };
}

/** Single source of truth for the Fundição DC OEE figures — reused by the OEE perspective (CAP-09), the Executive Home and Visão Estratégica so none ever drift apart. */
export function computeFundicaoDcOeeSummary(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, qualityConfirmations: readonly QualityConfirmation[] = fundicaoDcQualityConfirmationsFixture, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>> = fundicaoDcIdealCycleTimeSecondsFixture): FundicaoDcOeeSummary {
  const confirmationsByLot = Object.fromEntries(qualityConfirmations.map((confirmation) => [confirmation.lotId, confirmation]));
  const currentRows = buildCurrentRows(definition, executionsByLot, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  const allRows = buildAllDueRows(definition, executionsByLot, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  return { rows: currentRows, ...aggregateRows(allRows, currentRows) };
}

/**
 * Per-Shift OEE (demonstrative allocation rule): every due Lot is attributed to the Shift
 * covering its own Scheduled Start, reusing the same aggregate formulas as the day summary.
 * A Shift with no due Lot inside it reports every dimension as N/A rather than a fabricated
 * zero; `rows` (the live machine tiles) still reflect each Resource's current Lot, filtered
 * to that Shift, for the per-Shift "Situação das Máquinas" narrative.
 */
export function computeFundicaoDcShiftOeeSummaries(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string, qualityConfirmations: readonly QualityConfirmation[] = fundicaoDcQualityConfirmationsFixture, idealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>> = fundicaoDcIdealCycleTimeSecondsFixture): readonly FundicaoDcShiftOeeSummary[] {
  const confirmationsByLot = Object.fromEntries(qualityConfirmations.map((confirmation) => [confirmation.lotId, confirmation]));
  const currentRows = buildCurrentRows(definition, executionsByLot, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  const allRows = buildAllDueRows(definition, executionsByLot, currentTime, confirmationsByLot, idealCycleTimeSecondsByMaterialId);
  return definition.shifts.map((shift) => {
    const shiftAllRows = allRows.filter((row) => resolveShift(definition.shifts, row.lot.scheduledStart)?.id === shift.id);
    const shiftCurrentRows = currentRows.filter((row) => resolveShift(definition.shifts, row.lot.scheduledStart)?.id === shift.id);
    return { shiftId: shift.id, shiftName: shift.name, status: classifyShiftStatus(shift, currentTime), rows: shiftCurrentRows, ...aggregateRows(shiftAllRows, shiftCurrentRows) };
  });
}
