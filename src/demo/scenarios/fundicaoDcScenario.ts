import type { ScenarioDefinition } from '../../domain/scenario/ScenarioDefinition';
import type { Lot } from '../../domain/production-scheduling/models';

const workCenter = { id: 'wc-foundry-dc-casting', name: 'Fundição DC (Vazamento)', areaLabel: 'Fundição DC' } as const;
const materials = [
  { id: 'material-a', code: '2PP-F34A', name: 'Material A' },
  { id: 'material-b', code: '5VK-E11B', name: 'Material B' },
  { id: 'material-c', code: '1WD-C02C', name: 'Material C' },
] as const;

const lots: readonly Lot[] = [
  { id: 'lot-251', lotNumber: '251', materialId: 'material-a', quantity: 100, scheduledStart: '2025-05-15T16:43:00-03:00', scheduledFinish: '2025-05-15T17:48:00-03:00', workCenterId: workCenter.id, destination: 'ASSEMBLY', productionOrderId: 'po-4500123', resourceId: null, materialAttention: false, state: 'SCHEDULED' },
  { id: 'lot-252', lotNumber: '252', materialId: 'material-a', quantity: 100, scheduledStart: '2025-05-15T17:48:00-03:00', scheduledFinish: '2025-05-15T18:53:00-03:00', workCenterId: workCenter.id, destination: 'ASSEMBLY', productionOrderId: 'po-4500123', resourceId: null, materialAttention: false, state: 'SCHEDULED' },
  { id: 'lot-253', lotNumber: '253', materialId: 'material-a', quantity: 100, scheduledStart: '2025-05-15T18:53:00-03:00', scheduledFinish: '2025-05-15T19:58:00-03:00', workCenterId: workCenter.id, destination: 'ASSEMBLY', productionOrderId: 'po-4500123', resourceId: null, materialAttention: false, state: 'SCHEDULED' },
  { id: 'lot-254', lotNumber: '254', materialId: 'material-b', quantity: 100, scheduledStart: '2025-05-15T19:58:00-03:00', scheduledFinish: '2025-05-15T21:03:00-03:00', workCenterId: workCenter.id, destination: 'SPARE_PARTS', productionOrderId: 'po-4500156', resourceId: null, materialAttention: true, state: 'SCHEDULED' },
  { id: 'lot-255', lotNumber: '255', materialId: 'material-b', quantity: 100, scheduledStart: '2025-05-15T21:03:00-03:00', scheduledFinish: '2025-05-15T22:08:00-03:00', workCenterId: workCenter.id, destination: 'SPARE_PARTS', productionOrderId: 'po-4500156', resourceId: null, materialAttention: false, state: 'SCHEDULED' },
  { id: 'lot-256', lotNumber: '256', materialId: 'material-c', quantity: 100, scheduledStart: '2025-05-15T22:08:00-03:00', scheduledFinish: '2025-05-15T23:13:00-03:00', workCenterId: workCenter.id, destination: 'ENGINEERING', productionOrderId: 'po-4500188', resourceId: null, materialAttention: false, state: 'SCHEDULED' },
];

const dayLots = (day: number): readonly Lot[] => lots.map((lot) => {
  const start = new Date(lot.scheduledStart); start.setDate(start.getDate() + day);
  const finish = new Date(lot.scheduledFinish); finish.setDate(finish.getDate() + day);
  return { ...lot, id: `${lot.id}-d${day}`, lotNumber: `${Number(lot.lotNumber) + day * 10}`, scheduledStart: start.toISOString(), scheduledFinish: finish.toISOString() };
});

const futureLots = [1, 2, 3].flatMap((day) => dayLots(day));
const allLots = [...lots, ...futureLots];

export const fundicaoDcScenario = {
  id: 'fundicao-dc',
  name: 'Fundição DC — Fundação demonstrativa',
  productiveAreaId: 'fundicao-dc',
  demonstrative: true,
  productionScheduling: {
    materials,
    workCenters: [workCenter],
    lots: allLots,
    productionOrders: [
      { id: 'po-4500123', orderNumber: '4500123', source: 'PyMAC', materialId: 'material-a', quantity: 300, businessDate: '2025-05-15', correlatedLotIds: ['lot-251', 'lot-252', 'lot-253'], receivedAt: '2025-05-15T05:51:00-03:00' },
      { id: 'po-4500156', orderNumber: '4500156', source: 'PyMAC', materialId: 'material-b', quantity: 200, businessDate: '2025-05-15', correlatedLotIds: ['lot-254', 'lot-255'], receivedAt: '2025-05-15T05:51:00-03:00' },
      { id: 'po-4500188', orderNumber: '4500188', source: 'PyMAC', materialId: 'material-c', quantity: 100, businessDate: '2025-05-15', correlatedLotIds: ['lot-256'], receivedAt: '2025-05-15T05:51:00-03:00' },
    ],
    schedules: [
      { id: 'schedule-2025-05-15-v08', source: 'Balancing', businessDate: '2025-05-15', versionId: 'v08', receivedAt: '2025-05-15T05:42:00-03:00', workCenterId: workCenter.id, lotIds: lots.map((lot) => lot.id), demonstrative: true },
      { id: 'schedule-2025-05-15-v07', source: 'Balancing', businessDate: '2025-05-15', versionId: 'v07', receivedAt: '2025-05-14T18:30:00-03:00', workCenterId: workCenter.id, lotIds: ['lot-251', 'lot-253', 'lot-252', 'lot-254', 'lot-255'], demonstrative: true },
      ...[1, 2, 3].map((day) => ({ id: `schedule-day-${day}`, source: 'Balancing' as const, businessDate: `2025-05-${15 + day}`, versionId: 'v08', receivedAt: '2025-05-15T05:42:00-03:00', workCenterId: workCenter.id, lotIds: futureLots.filter((lot) => lot.id.endsWith(`d${day}`)).map((lot) => lot.id), demonstrative: true as const })),
    ],
    scheduleVersions: [
      { id: 'v08', label: 'Versão demonstrativa 08', demonstrative: true },
      { id: 'v07', label: 'Versão demonstrativa 07', demonstrative: true },
    ],
    bufferPositions: [
      { materialId: 'material-a', onHandQuantity: 320, availableQuantity: 240, reservedQuantity: 60, holdBlockedQuantity: 20, currentCoverageDays: 2.4, projectedCoverageDays: 3.1, targetCoverageDays: 3, scheduledProductionQuantity: 300, futurePlannedConsumptionQuantity: 230 },
      { materialId: 'material-b', onHandQuantity: 260, availableQuantity: 180, reservedQuantity: 80, holdBlockedQuantity: 0, currentCoverageDays: 3.2, projectedCoverageDays: 3.4, targetCoverageDays: 3, scheduledProductionQuantity: 200, futurePlannedConsumptionQuantity: 180 },
      { materialId: 'material-c', onHandQuantity: 150, availableQuantity: 90, reservedQuantity: 40, holdBlockedQuantity: 20, currentCoverageDays: 1.8, projectedCoverageDays: 2.2, targetCoverageDays: 3, scheduledProductionQuantity: 100, futurePlannedConsumptionQuantity: 70 },
    ],
    freshness: [
      { source: 'Balancing', businessDate: '2025-05-15', receivedAt: '2025-05-15T05:42:00-03:00', state: 'CURRENT' },
      { source: 'PyMAC', businessDate: '2025-05-15', receivedAt: '2025-05-15T05:51:00-03:00', state: 'CURRENT' },
    ],
  },
} as const satisfies ScenarioDefinition;
