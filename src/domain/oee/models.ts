/** Minimum conceptual backbone for a future OEE calculation. No formula is executed here. */
export type OeeDataConfidence = 'AVAILABLE' | 'DEMONSTRATIVE' | 'TBD';

export interface OeeMinimumDataBackbone {
  productionContext: {
    businessDate: string;
    shift: string;
    productiveArea: string;
    workCenter: string;
    resource: string;
    productionOrder: string;
    lot: string;
    material: string;
    operator?: string;
  };
  plan: {
    scheduledStart: string;
    scheduledFinish: string;
    plannedQuantity: number;
    idealCycleTime?: number;
  };
  execution: {
    releasedAt?: string;
    startedAt?: string;
    stoppedAt?: string;
    completedAt?: string;
  };
  production: {
    totalQuantity?: number;
    goodQuantity?: number;
    rejectedQuantity?: number;
    reworkedQuantity?: number;
  };
  events: readonly {
    eventType: string;
    start: string;
    end?: string;
    duration?: number;
    reason?: string;
    planningClassification: 'PLANNED' | 'UNPLANNED' | 'TBD';
  }[];
  derived: {
    plannedProductionTime?: number;
    runTime?: number;
    downtime?: number;
    idealProductionTime?: number;
    availability?: number;
    performance?: number;
    quality?: number;
    oee?: number;
  };
  confidence: Readonly<Record<string, OeeDataConfidence>>;
}
