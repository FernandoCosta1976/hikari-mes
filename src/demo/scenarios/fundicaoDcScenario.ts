import type { DemandDestination, Lot, Shift } from '../../domain/production-scheduling/models';
import type { FoundryResourceId } from '../../domain/resource/models';
import type { ScenarioDefinition } from '../../domain/scenario/ScenarioDefinition';

type BaseScenarioDefinition = Omit<ScenarioDefinition, 'currentResourceStates' | 'materialResourceEligibilities' | 'productionReadiness'>;

const businessDate = '2025-05-15';
const workCenter = { id: 'wc-foundry-dc-casting', name: 'Fundição DC (Vazamento)', areaLabel: 'Fundição DC' } as const;
const materials = [
  { id: 'material-a', code: '2PP-F34A', name: 'Material A' },
  { id: 'material-b', code: '5VK-E11B', name: 'Material B' },
  { id: 'material-c', code: '1WD-C02C', name: 'Material C' },
  { id: 'material-d', code: 'DEMO-D04', name: 'Material D' },
  { id: 'material-e', code: 'DEMO-E05', name: 'Material E' },
] as const;

export const fundicaoDcShifts: readonly Shift[] = [
  { id: 'SHIFT_3', name: 'Turno 3', startTime: '00:00', endTime: '06:59', demonstrative: true, breaks: [
    { id: 'shift-3-coffee-1', name: 'Café 1', startTime: '01:15', endTime: '01:30', demonstrative: true },
    { id: 'shift-3-meal', name: 'Refeição', startTime: '02:45', endTime: '03:30', demonstrative: true },
    { id: 'shift-3-coffee-2', name: 'Café 2', startTime: '05:00', endTime: '05:15', demonstrative: true },
  ] },
  { id: 'SHIFT_1', name: 'Turno 1', startTime: '07:00', endTime: '15:14', demonstrative: true, breaks: [
    { id: 'shift-1-coffee-1', name: 'Café 1', startTime: '08:45', endTime: '09:00', demonstrative: true },
    { id: 'shift-1-meal', name: 'Refeição', startTime: '10:45', endTime: '11:30', demonstrative: true },
    { id: 'shift-1-coffee-2', name: 'Café 2', startTime: '13:15', endTime: '13:30', demonstrative: true },
  ] },
  { id: 'SHIFT_2', name: 'Turno 2', startTime: '15:15', endTime: '23:59', demonstrative: true, breaks: [
    { id: 'shift-2-coffee-1', name: 'Café 1', startTime: '17:00', endTime: '17:15', demonstrative: true },
    { id: 'shift-2-meal', name: 'Refeição', startTime: '19:15', endTime: '20:00', demonstrative: true },
    { id: 'shift-2-coffee-2', name: 'Café 2', startTime: '21:45', endTime: '22:00', demonstrative: true },
  ] },
];

type LotSpec = readonly [number, string, FoundryResourceId, string, string];
const lotSpecs: readonly LotSpec[] = [
  [251, 'material-a', 'DC01', '00:30', '02:00'], [252, 'material-a', 'DC03', '00:45', '02:15'],
  [253, 'material-b', 'DC02', '02:00', '03:15'], [254, 'material-c', 'DC04', '02:30', '04:00'],
  [255, 'material-a', 'DC05', '04:20', '05:40'], [256, 'material-b', 'DC03', '02:45', '05:30'],
  [257, 'material-a', 'DC01', '07:30', '09:20'], [258, 'material-b', 'DC02', '07:45', '09:15'],
  [259, 'material-c', 'DC04', '09:20', '11:50'], [260, 'material-b', 'DC03', '07:30', '09:20'],
  [261, 'material-a', 'DC05', '07:30', '09:00'], [262, 'material-a', 'DC01', '09:20', '10:40'],
  [263, 'material-c', 'DC04', '11:50', '13:15'], [264, 'material-d', 'DC02', '09:45', '11:15'],
  [265, 'material-a', 'DC01', '15:30', '17:30'], [266, 'material-b', 'DC03', '15:30', '17:30'],
  [267, 'material-d', 'DC02', '18:00', '20:20'], [268, 'material-c', 'DC04', '18:30', '20:30'],
  [269, 'material-a', 'DC05', '18:40', '20:20'], [270, 'material-c', 'DC01', '18:00', '20:30'],
  [271, 'material-b', 'DC05', '16:30', '18:00'],
  [280, 'material-a', 'DC01', '05:40', '06:50'], [281, 'material-d', 'DC02', '12:30', '13:40'],
  [282, 'material-b', 'DC03', '10:00', '11:10'], [283, 'material-c', 'DC04', '14:00', '15:10'],
  [284, 'material-a', 'DC05', '12:00', '13:10'], [285, 'material-c', 'DC01', '21:00', '21:50'],
];

const destinationFor = (lotNumber: number): DemandDestination => lotNumber % 10 === 0 ? 'ENGINEERING' : lotNumber % 5 === 0 || lotNumber % 7 === 0 ? 'SPARE_PARTS' : 'ASSEMBLY';
const orderIdFor = (materialId: string) => `po-demo-${materialId.slice(-1)}`;
const timestamp = (time: string) => `${businessDate}T${time}:00-03:00`;

const lots: readonly Lot[] = lotSpecs.map(([lotNumber, materialId, scheduledResourceId, start, finish]) => ({
  id: `lot-${lotNumber}`,
  lotNumber: String(lotNumber),
  materialId,
  quantity: lotNumber <= 254 || (lotNumber >= 257 && lotNumber <= 259) || lotNumber === 265 || lotNumber === 266 ? 100 : lotNumber === 285 ? 50 : lotNumber >= 267 ? 70 : 50,
  scheduledStart: timestamp(start),
  scheduledFinish: timestamp(finish),
  workCenterId: workCenter.id,
  destination: destinationFor(lotNumber),
  productionOrderId: orderIdFor(materialId),
  scheduledResourceId,
  materialAttention: lotNumber === 267,
  state: 'SCHEDULED',
}));

const dayLots = (day: number): readonly Lot[] => lots.map((lot) => {
  const start = new Date(lot.scheduledStart); start.setDate(start.getDate() + day);
  const finish = new Date(lot.scheduledFinish); finish.setDate(finish.getDate() + day);
  return { ...lot, id: `${lot.id}-d${day}`, lotNumber: `${Number(lot.lotNumber) + day * 100}`, scheduledStart: start.toISOString(), scheduledFinish: finish.toISOString() };
});

const futureLots = [1, 2, 3].flatMap((day) => dayLots(day));
const allLots = [...lots, ...futureLots];
const productionOrders = materials.map((material) => {
  const correlatedLots = lots.filter((lot) => lot.materialId === material.id);
  return { id: orderIdFor(material.id), orderNumber: `DEMO-${material.id.slice(-1).toUpperCase()}`, source: 'PyMAC' as const, materialId: material.id, quantity: correlatedLots.reduce((sum, lot) => sum + lot.quantity, 0), businessDate, correlatedLotIds: correlatedLots.map((lot) => lot.id), receivedAt: `${businessDate}T05:51:00-03:00` };
});

/**
 * Cenário legado (Material A/B/C sintéticos) — preservado apenas como fixture
 * de teste histórico. Não é mais o cenário oficial da Fundição DC; ver ADR-002
 * (docs/prototype/decisions/ADR-002-CANONICAL-FOUNDRY-BASELINE.md) para a
 * decisão de promoção do dataset derivado das fontes reais a `fundicao-dc`.
 */
export const fundicaoDcScenario = {
  id: 'fundicao-dc-legacy',
  name: 'Fundição DC — cenário legado (Material A/B/C sintético)',
  productiveAreaId: 'fundicao-dc',
  demonstrative: true,
  currentScenarioTime: `${businessDate}T17:23:00-03:00`,
  productionScheduling: {
    materials,
    workCenters: [workCenter],
    lots: allLots,
    productionOrders,
    schedules: [
      { id: 'schedule-2025-05-15-v08', source: 'Balancing', businessDate, versionId: 'v08', receivedAt: `${businessDate}T05:42:00-03:00`, workCenterId: workCenter.id, lotIds: lots.map((lot) => lot.id), demonstrative: true },
      { id: 'schedule-2025-05-15-v07', source: 'Balancing', businessDate, versionId: 'v07', receivedAt: '2025-05-14T18:30:00-03:00', workCenterId: workCenter.id, lotIds: [lots[1].id, lots[0].id, ...lots.slice(2, -1).map((lot) => lot.id)], demonstrative: true },
      ...[1, 2, 3].map((day) => ({ id: `schedule-day-${day}`, source: 'Balancing' as const, businessDate: `2025-05-${15 + day}`, versionId: 'v08', receivedAt: `${businessDate}T05:42:00-03:00`, workCenterId: workCenter.id, lotIds: futureLots.filter((lot) => lot.id.endsWith(`d${day}`)).map((lot) => lot.id), demonstrative: true as const })),
    ],
    scheduleVersions: [
      { id: 'v08', label: 'Versão demonstrativa 08', demonstrative: true },
      { id: 'v07', label: 'Versão demonstrativa 07', demonstrative: true },
    ],
    bufferPositions: [
      { materialId: 'material-a', onHandQuantity: 320, availableQuantity: 240, reservedQuantity: 60, holdBlockedQuantity: 20, currentCoverageDays: 2.4, projectedCoverageDays: 3.1, targetCoverageDays: 3, scheduledProductionQuantity: 620, futurePlannedConsumptionQuantity: 550 },
      { materialId: 'material-b', onHandQuantity: 260, availableQuantity: 180, reservedQuantity: 80, holdBlockedQuantity: 0, currentCoverageDays: 3.2, projectedCoverageDays: 3.4, targetCoverageDays: 3, scheduledProductionQuantity: 470, futurePlannedConsumptionQuantity: 450 },
      { materialId: 'material-c', onHandQuantity: 150, availableQuantity: 90, reservedQuantity: 40, holdBlockedQuantity: 20, currentCoverageDays: 1.8, projectedCoverageDays: 2.2, targetCoverageDays: 3, scheduledProductionQuantity: 390, futurePlannedConsumptionQuantity: 360 },
      { materialId: 'material-d', onHandQuantity: 220, availableQuantity: 170, reservedQuantity: 50, holdBlockedQuantity: 0, currentCoverageDays: 2.7, projectedCoverageDays: 3.0, targetCoverageDays: 3, scheduledProductionQuantity: 120, futurePlannedConsumptionQuantity: 70 },
      { materialId: 'material-e', onHandQuantity: 140, availableQuantity: 110, reservedQuantity: 30, holdBlockedQuantity: 0, currentCoverageDays: 3.1, projectedCoverageDays: 3.3, targetCoverageDays: 3, scheduledProductionQuantity: 0, futurePlannedConsumptionQuantity: 0 },
    ],
    freshness: [
      { source: 'Balancing', businessDate, receivedAt: `${businessDate}T05:42:00-03:00`, state: 'CURRENT' },
      { source: 'PyMAC', businessDate, receivedAt: `${businessDate}T05:51:00-03:00`, state: 'CURRENT' },
    ],
    shifts: fundicaoDcShifts,
  },
} as const satisfies BaseScenarioDefinition;
