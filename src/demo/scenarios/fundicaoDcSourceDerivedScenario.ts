import type { DemandDestination, Lot, Shift } from '../../domain/production-scheduling/models';
import type { FoundryResourceId } from '../../domain/resource/models';
import type { ScenarioDefinition } from '../../domain/scenario/ScenarioDefinition';
import { fundicaoDcShifts } from './fundicaoDcScenario';

/**
 * Cenário demonstrativo derivado do dataset canônico de Fundição
 * (ver src/demo/reference-data/foundry). Substitui os materiais artificiais
 * (Material A/B/C) por códigos de peça reais resolvidos a partir de
 * LINHA C OFC × FUNDIÇÃO × máquina titular e reserva, para a menor data de
 * negócio observada no recorte (2026-07-09).
 *
 * Os horários de início/término de cada bloco NÃO vêm da planilha — a fonte
 * não fornece um horário real de bloco de Fundição (Motor Hora Inicial/Final
 * pertence ao plano da motocicleta, não ao bloco de Fundição). Este módulo
 * aplica uma única transformação demonstrativa centralizada: cada máquina
 * titular recebe seus requirements em sequência, blocos de 70 min, a partir
 * de 00:30 — 10 min de intervalo quando o próximo bloco é da mesma peça
 * (sem troca) e 35 min quando muda de peça (respeita o Setup demonstrativo
 * de 30 min entre peças diferentes na mesma máquina). Isso é intencional e
 * documentado — não é dado original da planilha.
 *
 * O relógio demonstrativo do HIKARI é único para toda a aplicação e fixo em
 * 17:23 (src/app/clock/applicationClock.ts) — apenas a Data de negócio varia
 * por cenário. Por isso o Plano deste cenário termina antes das 17:23: às
 * 17:23 o dia 09/07/2026 já está concluído em todas as máquinas.
 */

type BaseScenarioDefinition = Omit<ScenarioDefinition, 'currentResourceStates' | 'materialResourceEligibilities' | 'productionReadiness'>;

const businessDate = '2026-07-09';
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

/** [lotNumber, materialId, máquina titular, início, término, qtde, sourceLot, sourceModel, sourceColor, sourceItem, family] */
type LotSpec = readonly [number, string, FoundryResourceId, string, string, number, number, string, string, number, string];
const lotSpecs: readonly LotSpec[] = [
  [401, 'component-44c-e5421-w0', 'DC01', '00:30', '01:40', 100, 249, 'B3GB00010D', 'MR', 3, 'TAMPA_DIR'],
  [402, 'component-44c-e5421-w0', 'DC01', '01:50', '03:00', 100, 250, 'B3GB00010D', 'MR', 4, 'TAMPA_DIR'],
  [403, 'component-1st-e5421-w0', 'DC01', '03:35', '04:45', 100, 307, 'BFW600010B', 'AZ', 7, 'TAMPA_DIR'],
  [404, 'component-1st-e5421-w0', 'DC01', '04:55', '06:05', 100, 308, 'BFW600010C', 'VM', 8, 'TAMPA_DIR'],
  [405, 'component-44c-e5421-w0', 'DC01', '06:40', '07:50', 100, 330, 'BC5E00010D', 'CZ', 9, 'TAMPA_DIR'],
  [406, 'component-5lx-e5421-x0', 'DC01', '08:25', '09:35', 50, 8, 'BSRM00010A', 'AZ', 10, 'TAMPA_DIR'],
  [407, 'component-1b2-e5411-w0', 'DC01', '10:10', '11:20', 50, 8, 'BSRM00010A', 'AZ', 10, 'TAMPA_ESQ'],
  [408, 'component-5lx-e5421-x0', 'DC01', '11:55', '13:05', 50, 9, 'BSRM00010A', 'AZ', 11, 'TAMPA_DIR'],
  [409, 'component-1b2-e5411-w0', 'DC01', '13:40', '14:50', 50, 9, 'BSRM00010A', 'AZ', 11, 'TAMPA_ESQ'],
  [410, 'component-44c-e5421-w0', 'DC01', '15:25', '16:35', 100, 50, 'B9L400E000', 'COL', 14, 'TAMPA_DIR'],
  [411, 'component-1st-e5111-w0', 'DC02', '00:30', '01:40', 100, 307, 'BFW600010B', 'AZ', 7, 'CARC_DIR'],
  [412, 'component-1st-e5111-w0', 'DC02', '01:50', '03:00', 100, 308, 'BFW600010C', 'VM', 8, 'CARC_DIR'],
  [413, 'component-1s4-e5411-w0', 'DC03', '00:30', '01:40', 100, 330, 'BC5E00010D', 'CZ', 9, 'TAMPA_ESQ'],
  [414, 'component-1st-e5411-w0', 'DC04', '00:30', '01:40', 100, 307, 'BFW600010B', 'AZ', 7, 'TAMPA_ESQ'],
  [415, 'component-1st-e5411-w0', 'DC04', '01:50', '03:00', 100, 308, 'BFW600010C', 'VM', 8, 'TAMPA_ESQ'],
  [416, 'component-44c-e5111-w0', 'DC05', '00:30', '01:40', 100, 249, 'B3GB00010D', 'MR', 3, 'CARC_ESQ'],
  [417, 'component-44c-e5111-w0', 'DC05', '01:50', '03:00', 100, 250, 'B3GB00010D', 'MR', 4, 'CARC_ESQ'],
  [418, 'component-1st-e1310-w0', 'DC05', '03:35', '04:45', 100, 307, 'BFW600010B', 'AZ', 7, 'CILINDRO'],
  [419, 'component-1st-e1310-w0', 'DC05', '04:55', '06:05', 100, 308, 'BFW600010C', 'VM', 8, 'CILINDRO'],
  [420, 'component-44c-e5111-w0', 'DC05', '06:40', '07:50', 100, 330, 'BC5E00010D', 'CZ', 9, 'CARC_ESQ'],
  [421, 'component-44c-e5111-w0', 'DC05', '08:00', '09:10', 100, 50, 'B9L400E000', 'COL', 14, 'CARC_ESQ'],
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

/** Cobertura de material demonstrativa — as duas fontes usadas (LINHA C OFC, FUNDIÇÃO/máquinas) não fornecem estoque físico; ver seção 25 do briefing de dados canônicos. */
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
  currentScenarioTime: `${businessDate}T17:23:00-03:00`,
  productionScheduling: {
    materials: sourceDerivedMaterials,
    workCenters: [workCenter],
    lots: sourceDerivedLots,
    productionOrders,
    schedules: [
      { id: 'schedule-source-derived-2026-07-09-v01', source: 'Balancing', businessDate, versionId: 'v01', receivedAt: `${businessDate}T05:42:00-03:00`, workCenterId: workCenter.id, lotIds: sourceDerivedLots.map((lot) => lot.id), demonstrative: true },
    ],
    scheduleVersions: [
      { id: 'v01', label: 'Versão canônica 01 (fonte real)', demonstrative: true },
    ],
    bufferPositions,
    freshness: [
      { source: 'Balancing', businessDate, receivedAt: `${businessDate}T05:42:00-03:00`, state: 'CURRENT' },
      { source: 'PyMAC', businessDate, receivedAt: `${businessDate}T05:51:00-03:00`, state: 'CURRENT' },
    ],
    shifts: fundicaoDcSourceDerivedShifts,
  },
} as const satisfies BaseScenarioDefinition;
