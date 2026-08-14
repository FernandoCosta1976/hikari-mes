import { reconcileProductionOrder } from '../../domain/production-scheduling/calculations';
import type { DemandDestination, Lot, ProductionSchedulingDefinition } from '../../domain/production-scheduling/models';
import type { Wf001ScenarioId } from '../../demo/scenario-engine/scenarioStore';
import type { MaterialResourceEligibilityProjection } from '../../domain/material-resource-eligibility/models';

export const destinationLabels: Record<DemandDestination, string> = {
  ASSEMBLY: 'Montagem',
  SPARE_PARTS: 'Reposição',
  ENGINEERING: 'Engenharia',
};

export const scenarioLabels: Record<Wf001ScenarioId, string> = {
  'SCN-WF001-01': 'Plano atual conciliado',
  'SCN-WF001-02': 'Reservas de Reposição e Engenharia',
  'SCN-WF001-03': 'Cobertura recuperada pelo plano',
  'SCN-WF001-04': 'Atenção de matéria-prima',
  'SCN-WF001-05': 'Divergência Balancing × PyMAC',
  'SCN-WF001-06': 'Plano de hoje ainda não recebido',
  'SCN-WF001-07': 'Comparação de versões',
  'SCN-WF001-08': 'Lote selecionado',
};

export function buildProductionSchedulingViewModel(
  definition: ProductionSchedulingDefinition,
  dateOffset: number,
  destination: DemandDestination | 'ALL',
  scenarioId: Wf001ScenarioId,
) {
  const schedule = definition.schedules.find((item) => item.id === (dateOffset === 0 ? 'schedule-2025-05-15-v08' : `schedule-day-${dateOffset}`))!;
  const scheduledLots = schedule.lotIds.map((id) => definition.lots.find((lot) => lot.id === id)!).filter(Boolean);
  const lots = scheduledLots.filter((lot) => destination === 'ALL' || lot.destination === destination);
  const orders = definition.productionOrders.map((order) => {
    const adjusted = scenarioId === 'SCN-WF001-05' && order.id === 'po-4500123' ? { ...order, quantity: 340 } : order;
    return { order: adjusted, reconciliation: reconcileProductionOrder(adjusted, scheduledLots) };
  });
  const freshness = definition.freshness.map((item) => scenarioId === 'SCN-WF001-06' && item.source === 'Balancing'
    ? { ...item, businessDate: '2025-05-14', receivedAt: '2025-05-14T18:30:00-03:00', state: 'STALE' as const }
    : item);
  return {
    schedule,
    lots,
    scheduledLots,
    orders,
    freshness,
    totalQuantity: scheduledLots.reduce((sum, lot) => sum + lot.quantity, 0),
    destinationQuantities: Object.fromEntries(Object.keys(destinationLabels).map((key) => [key, scheduledLots.filter((lot) => lot.destination === key).reduce((sum, lot) => sum + lot.quantity, 0)])) as Record<DemandDestination, number>,
    hasDivergence: orders.some(({ reconciliation }) => reconciliation.status === 'DIVERGENT'),
  };
}

export function materialFor(definition: ProductionSchedulingDefinition, lot: Lot) {
  return definition.materials.find((material) => material.id === lot.materialId)!;
}

export function eligibilityForMaterial(
  projections: readonly MaterialResourceEligibilityProjection[],
  materialId: string,
) {
  return projections.find((projection) => projection.materialId === materialId);
}

export function formatDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', hour12: false, timeZone: 'America/Sao_Paulo' }).format(new Date(value));
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' }).format(new Date(value));
}
