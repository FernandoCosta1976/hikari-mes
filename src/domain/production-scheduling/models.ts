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
  resourceId: null;
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
}
