import type { DemandDestination, Lot, Shift } from '../../domain/production-scheduling/models';
import type { FoundryResourceId } from '../../domain/resource/models';
import type { ScenarioDefinition } from '../../domain/scenario/ScenarioDefinition';
import { demonstrativeComponentCycleTimeSecondsMaster } from '../../domain/production-scheduling/cycleTimeMaster';
import { fundicaoDcShifts } from './fundicaoDcScenario';

/**
 * Cenário demonstrativo derivado do dataset de referência de Fundição
 * (ver src/demo/reference-data/foundry). Substitui os materiais artificiais
 * (Material A/B/C) por códigos de peça reais resolvidos a partir de
 * LINHA C OFC × FUNDIÇÃO × máquina titular e reserva.
 *
 * BUSINESS DATE: 2026-07-10 · SCENARIO CLOCK: 09:15 · Turno 1. Cada Scenario
 * carrega seu próprio relógio determinístico completo (data + hora) via
 * `currentScenarioTime` — não há mais um horário global único (ver
 * src/app/clock/applicationClock.ts) — então este cenário não interfere no
 * relógio do cenário legado (`fundicao-dc-legacy`, preservado como fixture
 * de teste com seu próprio horário histórico).
 *
 * Os horários de início/término de cada bloco NÃO vêm da planilha — a fonte
 * não fornece um horário real de bloco de Fundição (Motor Hora Inicial/Final
 * pertence ao plano da motocicleta, não ao bloco de Fundição). Este módulo
 * aplica a mesma transformação demonstrativa de sempre — sequência por
 * máquina titular, Setup de 30 min só quando o Componente muda — mas agora a
 * DURAÇÃO de cada bloco vem do Demonstrative Component Cycle Time Master
 * (quantity × idealCycleTimeSeconds), não de um bloco fixo. Isso é
 * intencional e documentado — não é dado original da planilha.
 */

type BaseScenarioDefinition = Omit<ScenarioDefinition, 'currentResourceStates' | 'materialResourceEligibilities' | 'productionReadiness'>;

const businessDate = '2026-07-10';
const workCenter = { id: 'wc-foundry-dc-casting-source-derived', name: 'Fundição DC (Vazamento)', areaLabel: 'Fundição DC' } as const;

export const sourceDerivedMaterials = [
  { id: 'component-44c-e5421-w0', code: '44C-E5421-W0', name: '44C-E5421-W0 · Tampa Direita' },
  { id: 'component-1st-e5421-w0', code: '1ST-E5421-W0', name: '1ST-E5421-W0 · Tampa Direita' },
  { id: 'component-5lx-e5421-x0', code: '5LX-E5421-X0', name: '5LX-E5421-X0 · Tampa Direita' },
  { id: 'component-1b2-e5411-w0', code: '1B2-E5411-W0', name: '1B2-E5411-W0 · Tampa Esquerda' },
  { id: 'component-1st-e5111-w0', code: '1ST-E5111-W0', name: '1ST-E5111-W0 · Carcaça Direita' },
  { id: 'component-1s4-e5411-w0', code: '1S4-E5411-W0', name: '1S4-E5411-W0 · Tampa Esquerda' },
  { id: 'component-1st-e5411-w0', code: '1ST-E5411-W0', name: '1ST-E5411-W0 · Tampa Esquerda' },
  { id: 'component-44c-e5111-w0', code: '44C-E5111-W0', name: '44C-E5111-W0 · Carcaça Esquerda' },
  { id: 'component-1st-e1310-w0', code: '1ST-E1310-W0', name: '1ST-E1310-W0 · Cilindro' },
] as const;

/**
 * As 23 requirements FOUNDRY_DC reais resolvidos para 2026-07-10 no dataset
 * de referência (foundryComponentRequirements.json) — nenhum inventado. Horários
 * abaixo = sequência por máquina titular, blocos com duração
 * quantity × idealCycleTime (Cycle Time Master), Setup de 30 min só quando o
 * Componente muda. Verificado por teste (fundicaoDcSourceDerivedScenario.test.ts).
 * [lotNumber, materialId, máquina titular, início, término, qtde, sourceLot, sourceModel, sourceColor, sourceItem, family]
 */
type LotSpec = readonly [number, string, FoundryResourceId, string, string, number, number, string, string, number, string];
const lotSpecs: readonly LotSpec[] = [
  // DC01 — 10 requirements (800 peças)
  [501, 'component-5lx-e5421-x0', 'DC01', '00:30', '01:03', 50, 3, 'BSRP00030A', 'AZ', 18, 'TAMPA_DIR'],
  [502, 'component-1b2-e5411-w0', 'DC01', '01:33', '02:16', 50, 3, 'BSRP00030A', 'AZ', 18, 'TAMPA_ESQ'],
  [503, 'component-5lx-e5421-x0', 'DC01', '02:46', '03:19', 50, 4, 'BSRP00030A', 'AZ', 19, 'TAMPA_DIR'],
  [504, 'component-1b2-e5411-w0', 'DC01', '03:49', '04:32', 50, 4, 'BSRP00030A', 'AZ', 19, 'TAMPA_ESQ'],
  [505, 'component-1st-e5421-w0', 'DC01', '05:02', '06:39', 100, 309, 'BFW600010A', 'PT', 20, 'TAMPA_DIR'],
  [506, 'component-44c-e5421-w0', 'DC01', '07:09', '08:19', 100, 331, 'BC5E00010D', 'CZ', 22, 'TAMPA_DIR'],
  [507, 'component-44c-e5421-w0', 'DC01', '08:19', '09:29', 100, 251, 'B3GB00010D', 'MR', 25, 'TAMPA_DIR'],
  [508, 'component-44c-e5421-w0', 'DC01', '09:29', '10:39', 100, 252, 'B3GB00010D', 'MR', 26, 'TAMPA_DIR'],
  [509, 'component-1st-e5421-w0', 'DC01', '11:09', '12:46', 100, 310, 'BFW600010C', 'VM', 21, 'TAMPA_DIR'],
  [510, 'component-1st-e5421-w0', 'DC01', '12:46', '14:23', 100, 311, 'BFW600010A', 'PT', 33, 'TAMPA_DIR'],
  // DC02 — 3 requirements (300 peças)
  [511, 'component-1st-e5111-w0', 'DC02', '06:00', '07:52', 100, 309, 'BFW600010A', 'PT', 20, 'CARC_DIR'],
  [512, 'component-1st-e5111-w0', 'DC02', '07:52', '09:44', 100, 310, 'BFW600010C', 'VM', 21, 'CARC_DIR'],
  [513, 'component-1st-e5111-w0', 'DC02', '09:44', '11:36', 100, 311, 'BFW600010A', 'PT', 33, 'CARC_DIR'],
  // DC03 — 1 requirement (100 peças)
  [514, 'component-1s4-e5411-w0', 'DC03', '08:00', '09:15', 100, 331, 'BC5E00010D', 'CZ', 22, 'TAMPA_ESQ'],
  // DC04 — 3 requirements (300 peças)
  [515, 'component-1st-e5411-w0', 'DC04', '05:00', '07:02', 100, 309, 'BFW600010A', 'PT', 20, 'TAMPA_ESQ'],
  [516, 'component-1st-e5411-w0', 'DC04', '07:02', '09:04', 100, 310, 'BFW600010C', 'VM', 21, 'TAMPA_ESQ'],
  [517, 'component-1st-e5411-w0', 'DC04', '09:04', '11:06', 100, 311, 'BFW600010A', 'PT', 33, 'TAMPA_ESQ'],
  // DC05 — 6 requirements (600 peças)
  [518, 'component-44c-e5111-w0', 'DC05', '01:00', '03:20', 100, 331, 'BC5E00010D', 'CZ', 22, 'CARC_ESQ'],
  [519, 'component-44c-e5111-w0', 'DC05', '03:20', '05:40', 100, 251, 'B3GB00010D', 'MR', 25, 'CARC_ESQ'],
  [520, 'component-44c-e5111-w0', 'DC05', '05:40', '08:00', 100, 252, 'B3GB00010D', 'MR', 26, 'CARC_ESQ'],
  [521, 'component-1st-e1310-w0', 'DC05', '08:30', '11:08', 100, 309, 'BFW600010A', 'PT', 20, 'CILINDRO'],
  [522, 'component-1st-e1310-w0', 'DC05', '11:08', '13:46', 100, 310, 'BFW600010C', 'VM', 21, 'CILINDRO'],
  [523, 'component-1st-e1310-w0', 'DC05', '13:46', '16:24', 100, 311, 'BFW600010A', 'PT', 33, 'CILINDRO'],
];

const orderIdFor = (materialId: string) => `po-source-derived-${materialId.replace('component-', '')}`;
const timestamp = (time: string) => `${businessDate}T${time}:00-03:00`;

export const sourceDerivedLots: readonly Lot[] = lotSpecs.map(([lotNumber, materialId, scheduledResourceId, start, finish, quantity]) => ({
  id: `lot-sd-${lotNumber}`,
  lotNumber: String(lotNumber),
  materialId,
  quantity,
  scheduledStart: timestamp(start),
  scheduledFinish: timestamp(finish),
  workCenterId: workCenter.id,
  destination: 'ASSEMBLY' as DemandDestination,
  productionOrderId: orderIdFor(materialId),
  scheduledResourceId,
  materialAttention: false,
  state: 'SCHEDULED',
}));

/** Rastreabilidade Peça → Família → Modelo da motocicleta → Lote Linha C → Quantidade — não faz parte do contrato Lot compartilhado. */
export interface FoundrySourceTraceability {
  sourceItem: number;
  sourceModel: string;
  sourceColor: string;
  sourceLot: number;
  family: string;
  componentCode: string;
}

export const sourceDerivedTraceabilityByLotId: Readonly<Record<string, FoundrySourceTraceability>> =
  Object.fromEntries(lotSpecs.map(([lotNumber, materialId, , , , , sourceLot, sourceModel, sourceColor, sourceItem, family]) => {
    const material = sourceDerivedMaterials.find((item) => item.id === materialId)!;
    return [`lot-sd-${lotNumber}`, { sourceItem, sourceModel, sourceColor, sourceLot, family, componentCode: material.code }];
  }));

/** Demonstrative Component Cycle Time Master, keyed by materialId for the OEE/Quality adapters (which key by `lot.materialId`). */
export const sourceDerivedIdealCycleTimeSecondsByMaterialId: Readonly<Record<string, number>> =
  Object.fromEntries(sourceDerivedMaterials.map((material) => [material.id, demonstrativeComponentCycleTimeSecondsMaster[material.code]]));

const productionOrders = sourceDerivedMaterials.map((material) => {
  const correlatedLots = sourceDerivedLots.filter((lot) => lot.materialId === material.id);
  return {
    id: orderIdFor(material.id),
    orderNumber: `OFC-${material.code}`,
    source: 'PyMAC' as const,
    materialId: material.id,
    quantity: correlatedLots.reduce((sum, lot) => sum + lot.quantity, 0),
    businessDate,
    correlatedLotIds: correlatedLots.map((lot) => lot.id),
    receivedAt: `${businessDate}T05:51:00-03:00`,
  };
});

/** Cobertura de material demonstrativa — as duas fontes usadas (LINHA C OFC, FUNDIÇÃO/máquinas) não fornecem estoque físico; ver seção 25 do briefing de dados de referência. */
const bufferPositions = sourceDerivedMaterials.map((material, index) => ({
  materialId: material.id,
  onHandQuantity: 200 + index * 10,
  availableQuantity: 150 + index * 8,
  reservedQuantity: 40,
  holdBlockedQuantity: 0,
  currentCoverageDays: 2.5,
  projectedCoverageDays: 2.8,
  targetCoverageDays: 3,
  scheduledProductionQuantity: sourceDerivedLots.filter((lot) => lot.materialId === material.id).reduce((sum, lot) => sum + lot.quantity, 0),
  futurePlannedConsumptionQuantity: 300,
}));

export const fundicaoDcSourceDerivedShifts: readonly Shift[] = fundicaoDcShifts;

/**
 * Cenário oficial da Fundição DC — promovido a `fundicao-dc` (ver ADR-002).
 * Toda navegação padrão do protótipo ('/demo/fundicao-dc/...') resolve para
 * este cenário; o cenário sintético anterior (Material A/B/C) foi preservado
 * como fixture de teste em fundicaoDcScenario.ts, com id `fundicao-dc-legacy`.
 */
export const fundicaoDcSourceDerivedScenario = {
  id: 'fundicao-dc',
  name: 'Fundição DC',
  productiveAreaId: 'fundicao-dc',
  demonstrative: true,
  currentScenarioTime: `${businessDate}T09:15:00-03:00`,
  productionScheduling: {
    materials: sourceDerivedMaterials,
    workCenters: [workCenter],
    lots: sourceDerivedLots,
    productionOrders,
    schedules: [
      { id: 'schedule-source-derived-2026-07-10-v01', source: 'Balancing', businessDate, versionId: 'v01', receivedAt: `${businessDate}T05:42:00-03:00`, workCenterId: workCenter.id, lotIds: sourceDerivedLots.map((lot) => lot.id), demonstrative: true },
    ],
    scheduleVersions: [
      { id: 'v01', label: 'Versão de referência 01 (fonte real)', demonstrative: true },
    ],
    bufferPositions,
    freshness: [
      { source: 'Balancing', businessDate, receivedAt: `${businessDate}T05:42:00-03:00`, state: 'CURRENT' },
      { source: 'PyMAC', businessDate, receivedAt: `${businessDate}T05:51:00-03:00`, state: 'CURRENT' },
    ],
    shifts: fundicaoDcSourceDerivedShifts,
  },
} as const satisfies BaseScenarioDefinition;
