export type DemandDestination = 'ASSEMBLY' | 'SPARE_PARTS' | 'ENGINEERING';

export interface Material {
  id: string;
  code: string;
  name: string;
}

export interface WorkCenter {
  id: string;
  name: string;
  areaLabel: string;
}

export interface PlannedShiftBreak {
  id: string;
  name: 'Café 1' | 'Refeição' | 'Café 2';
  startTime: string;
  endTime: string;
  demonstrative: true;
}

export interface Shift {
  id: 'SHIFT_3' | 'SHIFT_1' | 'SHIFT_2';
  name: 'Turno 3' | 'Turno 1' | 'Turno 2';
  startTime: string;
  endTime: string;
  breaks: readonly PlannedShiftBreak[];
  demonstrative: true;
}

export interface ScheduledSetup {
  id: string;
  resourceId: FoundryResourceId;
  previousMaterialId: Material['id'];
  nextMaterialId: Material['id'];
  scheduledStart: string;
  scheduledFinish: string;
  durationMinutes: number;
  demonstrative: true;
}

export interface Lot {
  id: string;
  lotNumber: string;
  materialId: Material['id'];
  quantity: number;
  scheduledStart: string;
  scheduledFinish: string;
  workCenterId: WorkCenter['id'];
  destination: DemandDestination;
  productionOrderId: string;
  scheduledResourceId: FoundryResourceId;
  materialAttention: boolean;
  state: 'SCHEDULED';
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  source: 'PyMAC';
  materialId: Material['id'];
  quantity: number;
  businessDate: string;
  correlatedLotIds: readonly Lot['id'][];
  receivedAt: string;
}

export interface ScheduleVersion {
  id: string;
  label: string;
  demonstrative: true;
}

export interface ProductionSchedule {
  id: string;
  source: 'Balancing';
  businessDate: string;
  versionId: ScheduleVersion['id'];
  receivedAt: string;
  workCenterId: WorkCenter['id'];
  lotIds: readonly Lot['id'][];
  demonstrative: true;
}

export interface DataFreshness {
  source: 'Balancing' | 'PyMAC';
  businessDate: string;
  receivedAt: string;
  state: 'CURRENT' | 'STALE';
}

export interface BufferPosition {
  materialId: Material['id'];
  onHandQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  holdBlockedQuantity: number;
  currentCoverageDays: number;
  projectedCoverageDays: number;
  targetCoverageDays: number;
  scheduledProductionQuantity: number;
  futurePlannedConsumptionQuantity: number;
}

export interface ProductionSchedulingDefinition {
  materials: readonly Material[];
  workCenters: readonly WorkCenter[];
  lots: readonly Lot[];
  productionOrders: readonly ProductionOrder[];
  schedules: readonly ProductionSchedule[];
  scheduleVersions: readonly ScheduleVersion[];
  bufferPositions: readonly BufferPosition[];
  freshness: readonly DataFreshness[];
  shifts: readonly Shift[];
}
import type { FoundryResourceId } from '../resource/models';
