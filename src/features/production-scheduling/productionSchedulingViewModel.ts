import { reconcileProductionOrder } from '../../domain/production-scheduling/calculations';
import type { DemandDestination, Lot, ProductionSchedulingDefinition } from '../../domain/production-scheduling/models';
import type { ScheduleView, Wf001ScenarioId } from '../../demo/scenario-engine/scenarioStore';
import type { MaterialResourceEligibilityProjection } from '../../domain/material-resource-eligibility/models';
import { shiftWindow } from '../../domain/production-scheduling/shifts';
import { deriveScheduledSetups } from '../../domain/production-scheduling/setups';
import { productionSchedulingDemoConfiguration } from '../../demo/configuration/productionSchedulingDemoConfiguration';

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
  scheduleView: ScheduleView,
) {
  const schedule = definition.schedules.find((item) => item.id === (dateOffset === 0 ? 'schedule-2025-05-15-v08' : `schedule-day-${dateOffset}`))!;
  const allScheduledLots = schedule.lotIds.map((id) => definition.lots.find((lot) => lot.id === id)!).filter(Boolean);
  const selectedShift = scheduleView === '24H' ? null : definition.shifts.find((shift) => shift.id === scheduleView)!;
  const rangeStart = selectedShift ? shiftWindow(schedule.businessDate, selectedShift).start : `${schedule.businessDate}T00:00:00-03:00`;
  const rangeFinish = selectedShift ? shiftWindow(schedule.businessDate, selectedShift).finish : new Date(Date.parse(rangeStart) + 24 * 60 * 60 * 1000).toISOString();
  const scheduledLots = allScheduledLots.filter((lot) => Date.parse(lot.scheduledStart) >= Date.parse(rangeStart) && Date.parse(lot.scheduledFinish) <= Date.parse(rangeFinish));
  const scheduledSetups = deriveScheduledSetups(allScheduledLots, productionSchedulingDemoConfiguration.setupDurationMinutes)
    .filter((setup) => Date.parse(setup.scheduledStart) >= Date.parse(rangeStart) && Date.parse(setup.scheduledFinish) <= Date.parse(rangeFinish));
  const lots = scheduledLots.filter((lot) => destination === 'ALL' || lot.destination === destination);
  const orders = definition.productionOrders.map((order) => {
    const adjusted = scenarioId === 'SCN-WF001-05' && order.id === definition.productionOrders[0]?.id ? { ...order, quantity: order.quantity + 40 } : order;
    return { order: adjusted, reconciliation: reconcileProductionOrder(adjusted, allScheduledLots) };
  });
  const freshness = definition.freshness.map((item) => scenarioId === 'SCN-WF001-06' && item.source === 'Balancing'
    ? { ...item, businessDate: '2025-05-14', receivedAt: '2025-05-14T18:30:00-03:00', state: 'STALE' as const }
    : item);
  return {
    schedule,
    rangeStart,
    rangeFinish,
    periodLabel: selectedShift?.name ?? 'Dia completo · 24h',
    lots,
    scheduledLots,
    scheduledSetups,
    allScheduledLots,
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
