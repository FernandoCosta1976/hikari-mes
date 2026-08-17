import type { DemandDestination, Lot } from '../../domain/production-scheduling/models';
import type { FoundryResourceId } from '../../domain/resource/models';
import type { ProductionExecutionRecord } from '../../domain/production-execution/models';
import type { ProductionEvent } from '../../domain/production-monitoring/models';
import { sourceDerivedMaterials } from './fundicaoDcSourceDerivedScenario';

/**
 * Acompanhamento — 10/07/2026, Scenario Clock 17:23 (Section 1 of the round
 * brief). Deliberately a DIFFERENT business date than the canonical Plano/
 * Preparação/Liberação scenario (2026-07-09) — this module is scoped to the
 * Acompanhamento capability only and does not change the shared scenario's
 * date. All 23 requirements below are the genuine FOUNDRY_DC records for
 * 2026-07-10 in the canonical dataset (foundryComponentRequirements.json) —
 * component code, family, quantity, source Lot, model, color and item are
 * never invented. Only the intra-day SCHEDULE (block start/finish) and the
 * EXECUTION facts (actual start/finish, produced quantity, the one
 * unplanned-stop event) are demonstrative, exactly like the 2026-07-09
 * scenario's own scheduling transformation — the source data carries no
 * block-level timing for Fundição.
 */
export const monitoringBusinessDate = '2026-07-10';
export const monitoringScenarioClock = `${monitoringBusinessDate}T17:23:00-03:00`;
const workCenterId = 'wc-foundry-dc-casting-source-derived';
const orderIdFor = (materialId: string) => `po-monitoring-1007-${materialId.replace('component-', '')}`;
const timestamp = (time: string) => `${monitoringBusinessDate}T${time}:00-03:00`;

export interface MonitoringSourceTraceability { sourceItem: number; sourceModel: string; sourceColor: string; sourceLot: number; family: string; componentCode: string }

/**
 * [lotNumber, materialId, resource, schedStart, schedFinish, qty,
 *  sourceLot, sourceModel, sourceColor, sourceItem, family,
 *  actualStart?, actualFinish?, producedQuantity?]
 * Rows with neither actualStart nor actualFinish are NOT_STARTED/SCHEDULED
 * facts (Section 24 — Unknown != 0: no appointment means no execution
 * record has started yet, never a produced quantity of 0).
 */
type Row = readonly [number, string, FoundryResourceId, string, string, number, number, string, string, number, string, string?, string?, number?];

const rows: readonly Row[] = [
  // DC01 — 10 requirements: 7 completed, 1 running, 2 scheduled ahead.
  [501, 'component-5lx-e5421-x0', 'DC01', '05:35', '06:45', 50, 3, 'BSRP00030A', 'AZ', 18, 'TAMPA_DIR', '05:34', '06:43', 50],
  [502, 'component-1b2-e5411-w0', 'DC01', '07:20', '08:30', 50, 3, 'BSRP00030A', 'AZ', 18, 'TAMPA_ESQ', '07:20', '08:30', 50],
  [503, 'component-5lx-e5421-x0', 'DC01', '09:05', '10:15', 50, 4, 'BSRP00030A', 'AZ', 19, 'TAMPA_DIR', '09:07', '10:17', 50],
  [504, 'component-1b2-e5411-w0', 'DC01', '10:50', '12:00', 50, 4, 'BSRP00030A', 'AZ', 19, 'TAMPA_ESQ', '10:52', '12:02', 50],
  [505, 'component-1st-e5421-w0', 'DC01', '12:35', '13:45', 100, 309, 'BFW600010A', 'PT', 20, 'TAMPA_DIR', '12:38', '13:53', 100],
  [506, 'component-44c-e5421-w0', 'DC01', '14:20', '15:30', 100, 331, 'BC5E00010D', 'CZ', 22, 'TAMPA_DIR', '14:21', '15:31', 100],
  [507, 'component-44c-e5421-w0', 'DC01', '15:40', '16:50', 100, 251, 'B3GB00010D', 'MR', 25, 'TAMPA_DIR', '15:41', '16:51', 100],
  [508, 'component-44c-e5421-w0', 'DC01', '17:00', '18:10', 100, 252, 'B3GB00010D', 'MR', 26, 'TAMPA_DIR', '17:02', undefined, 30],
  [509, 'component-1st-e5421-w0', 'DC01', '18:45', '19:55', 100, 310, 'BFW600010C', 'VM', 21, 'TAMPA_DIR'],
  [510, 'component-1st-e5421-w0', 'DC01', '20:05', '21:15', 100, 311, 'BFW600010A', 'PT', 33, 'TAMPA_DIR'],
  // DC02 — 3 requirements: 2 completed, 1 scheduled ahead (next up).
  [511, 'component-1st-e5111-w0', 'DC02', '08:00', '09:10', 100, 309, 'BFW600010A', 'PT', 20, 'CARC_DIR', '08:03', '09:12', 100],
  [512, 'component-1st-e5111-w0', 'DC02', '09:20', '10:30', 100, 310, 'BFW600010C', 'VM', 21, 'CARC_DIR', '09:22', '10:33', 100],
  [513, 'component-1st-e5111-w0', 'DC02', '17:45', '18:55', 100, 311, 'BFW600010A', 'PT', 33, 'CARC_DIR'],
  // DC03 — 1 requirement: running past its scheduled finish because of the unplanned stop below.
  [514, 'component-1s4-e5411-w0', 'DC03', '16:00', '17:10', 100, 331, 'BC5E00010D', 'CZ', 22, 'TAMPA_ESQ', '16:03', undefined, 93],
  // DC04 — 3 requirements: 1 completed, 1 should already have started (no appointment), 1 scheduled behind it.
  [515, 'component-1st-e5411-w0', 'DC04', '07:00', '08:10', 100, 309, 'BFW600010A', 'PT', 20, 'TAMPA_ESQ', '07:02', '08:12', 100],
  [516, 'component-1st-e5411-w0', 'DC04', '17:00', '18:10', 100, 310, 'BFW600010C', 'VM', 21, 'TAMPA_ESQ'],
  [517, 'component-1st-e5411-w0', 'DC04', '18:20', '19:30', 100, 311, 'BFW600010A', 'PT', 33, 'TAMPA_ESQ'],
  // DC05 — 6 requirements: 5 completed, 1 scheduled ahead (next up).
  [518, 'component-44c-e5111-w0', 'DC05', '06:00', '07:10', 100, 331, 'BC5E00010D', 'CZ', 22, 'CARC_ESQ', '06:00', '07:10', 100],
  [519, 'component-44c-e5111-w0', 'DC05', '07:20', '08:30', 100, 251, 'B3GB00010D', 'MR', 25, 'CARC_ESQ', '07:19', '08:29', 100],
  [520, 'component-44c-e5111-w0', 'DC05', '08:40', '09:50', 100, 252, 'B3GB00010D', 'MR', 26, 'CARC_ESQ', '08:42', '09:52', 100],
  [521, 'component-1st-e1310-w0', 'DC05', '10:25', '11:35', 100, 309, 'BFW600010A', 'PT', 20, 'CILINDRO', '10:26', '11:36', 100],
  [522, 'component-1st-e1310-w0', 'DC05', '11:45', '12:55', 100, 310, 'BFW600010C', 'VM', 21, 'CILINDRO', '11:47', '12:57', 100],
  [523, 'component-1st-e1310-w0', 'DC05', '18:30', '19:40', 100, 311, 'BFW600010A', 'PT', 33, 'CILINDRO'],
];

export const monitoringLots: readonly Lot[] = rows.map(([lotNumber, materialId, scheduledResourceId, start, finish, quantity]) => ({
  id: `lot-mon-${lotNumber}`,
  lotNumber: String(lotNumber),
  materialId,
  quantity,
  scheduledStart: timestamp(start),
  scheduledFinish: timestamp(finish),
  workCenterId,
  destination: 'ASSEMBLY' as DemandDestination,
  productionOrderId: orderIdFor(materialId),
  scheduledResourceId,
  materialAttention: false,
  state: 'SCHEDULED',
}));

export const monitoringTraceabilityByLotId: Readonly<Record<string, MonitoringSourceTraceability>> =
  Object.fromEntries(rows.map(([lotNumber, materialId, , , , , sourceLot, sourceModel, sourceColor, sourceItem, family]) => {
    const material = sourceDerivedMaterials.find((item) => item.id === materialId)!;
    return [`lot-mon-${lotNumber}`, { sourceItem, sourceModel, sourceColor, sourceLot, family, componentCode: material.code }];
  }));

export const monitoringExecutionsByLotId: Readonly<Record<string, ProductionExecutionRecord>> =
  Object.fromEntries(rows.map(([lotNumber, materialId, resourceId, , , quantity, , , , , , actualStart, actualFinish, producedQuantity]) => {
    const lotId = `lot-mon-${lotNumber}`;
    const status = actualFinish ? 'COMPLETED' : actualStart ? 'IN_PROGRESS' : 'NOT_STARTED';
    const record: ProductionExecutionRecord = {
      lotId,
      productionOrderId: orderIdFor(materialId),
      resourceId,
      scheduleVersionId: 'v-monitoring-1007',
      plannedQuantity: quantity,
      producedQuantity: producedQuantity ?? 0,
      scheduledStart: timestamp(rows.find((row) => row[0] === lotNumber)![3]),
      status,
      actualStart: actualStart ? timestamp(actualStart) : undefined,
      actualFinish: actualFinish ? timestamp(actualFinish) : undefined,
      executedBy: status !== 'NOT_STARTED' ? 'Operador da Fundição · demonstrativo' : undefined,
      pauses: [],
      demonstrative: true,
    };
    return [lotId, record];
  }));

/** The one demonstrative event required by Section 11 — a 15-min unplanned stop on DC03 that delays lot-mon-514's own completion. */
export const monitoringEvents: readonly ProductionEvent[] = [
  { eventId: 'event-mon-dc03-001', resourceId: 'DC03', lotId: 'lot-mon-514', eventType: 'MACHINE_ADJUSTMENT', startedAt: timestamp('16:42'), endedAt: timestamp('16:57'), status: 'CLOSED', demonstrative: true, ruleStatus: 'BUSINESS_VALIDATION_REQUIRED' },
];

export const monitoringDowntimeMinutesByLotId: Readonly<Record<string, number>> = { 'lot-mon-514': 15 };
