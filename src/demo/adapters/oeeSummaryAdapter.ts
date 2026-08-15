import { fundicaoDcIdealCycleTimeSecondsFixture } from '../fixtures/fundicaoDcIdealCycleTime';
import { fundicaoDcQualityConfirmationsFixture } from '../fixtures/fundicaoDcQualityConfirmations';
import { aggregateAvailability, aggregatePerformance, aggregateQuality, assessAvailability, assessOee, assessPerformance, classifyShiftStatus, plannedProductionTimeMinutes, resolveShift, topOeeImpacts, type OeeDimension, type ResourceOeeRow, type ShiftStatus } from '../../domain/oee/calculations';
import type { ProductionExecutionRecord } from '../../domain/production-execution/models';
import { knownRunTimeMinutes } from '../../domain/production-quality/models';
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

function buildRows(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string): readonly FundicaoDcOeeRow[] {
  const confirmationsByLot = Object.fromEntries(fundicaoDcQualityConfirmationsFixture.map((confirmation) => [confirmation.lotId, confirmation]));
  return FOUNDRY_RESOURCE_IDS.map((resourceId) => {
    const execution = Object.values(executionsByLot).find((item) => item.resourceId === resourceId)!;
    const lot = definition.lots.find((item) => item.id === execution.lotId)!;
    const runTimeMinutes = knownRunTimeMinutes(execution, currentTime);
    const plannedTimeMinutes = plannedProductionTimeMinutes(lot, execution, definition.shifts, currentTime);
    const idealCycleTimeSeconds = fundicaoDcIdealCycleTimeSecondsFixture[lot.materialId] ?? null;
    const confirmation = confirmationsByLot[execution.lotId];
    const goodQuantity = confirmation?.goodQuantity ?? null;
    const availability = assessAvailability(runTimeMinutes, plannedTimeMinutes);
    const performance = assessPerformance(idealCycleTimeSeconds, execution.producedQuantity, runTimeMinutes);
    const quality = confirmation ? confirmation.goodQuantity / confirmation.producedQuantity : null;
    return { resourceId, lot, execution, runTimeMinutes, plannedTimeMinutes, idealCycleTimeSeconds, producedQuantity: execution.producedQuantity, goodQuantity, availability, performance, quality, oee: assessOee(availability, performance, quality) };
  });
}

function aggregateRows(rows: readonly FundicaoDcOeeRow[]): FundicaoDcOeeAggregate {
  const areaAvailability = aggregateAvailability(rows);
  const areaPerformance = aggregatePerformance(rows);
  const areaQuality = aggregateQuality(rows);
  const areaOee = assessOee(areaAvailability, areaPerformance, areaQuality);
  const impacts: readonly FundicaoDcOeeImpact[] = topOeeImpacts(rows).map((impact) => ({ dimension: impact.dimension, resourceId: impact.resourceId as FoundryResourceId, lossFraction: impact.lossFraction }));
  return { areaAvailability, areaPerformance, areaQuality, areaOee, impacts, mainImpact: impacts[0] ?? null };
}

/** Single source of truth for the Fundição DC OEE figures — reused by the OEE perspective (CAP-09) and the Executive Home so both never drift apart. */
export function computeFundicaoDcOeeSummary(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string): FundicaoDcOeeSummary {
  const rows = buildRows(definition, executionsByLot, currentTime);
  return { rows, ...aggregateRows(rows) };
}

/**
 * Per-Shift OEE (demonstrative allocation rule): each Resource's tracked Lot
 * is attributed to the Shift covering its Scheduled Start — reusing the same
 * per-Resource facts and aggregate formulas as the day summary, just grouped
 * differently. A Shift with no tracked Lot inside it reports every dimension
 * as N/A rather than a fabricated zero.
 */
export function computeFundicaoDcShiftOeeSummaries(definition: ProductionSchedulingDefinition, executionsByLot: Readonly<Record<string, ProductionExecutionRecord>>, currentTime: string): readonly FundicaoDcShiftOeeSummary[] {
  const rows = buildRows(definition, executionsByLot, currentTime);
  return definition.shifts.map((shift) => {
    const shiftRows = rows.filter((row) => resolveShift(definition.shifts, row.lot.scheduledStart)?.id === shift.id);
    return { shiftId: shift.id, shiftName: shift.name, status: classifyShiftStatus(shift, currentTime), rows: shiftRows, ...aggregateRows(shiftRows) };
  });
}
