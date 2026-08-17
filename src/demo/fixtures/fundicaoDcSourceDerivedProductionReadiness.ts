import type { DemoLotReadinessRecord } from './fundicaoDcProductionReadiness';

/**
 * Situação de preparação por Lote — sinalizada a partir de dados reais do
 * mapeamento componente→máquina: Lotes 418/419 (1ST-E1310-W0 · Cilindro em
 * DC05) não têm máquina reserva confirmada (reserveResources vazio,
 * "TEM PADRÃO?" reserva = NÃO), por isso ficam ATTENTION. As demais têm
 * reserva confirmada e ficam READY.
 */
export const fundicaoDcSourceDerivedProductionReadinessFixture: readonly DemoLotReadinessRecord[] = [
  { lotId: 'lot-sd-401', status: 'READY' },
  { lotId: 'lot-sd-402', status: 'READY' },
  { lotId: 'lot-sd-403', status: 'READY' },
  { lotId: 'lot-sd-404', status: 'READY' },
  { lotId: 'lot-sd-405', status: 'READY' },
  { lotId: 'lot-sd-406', status: 'READY' },
  { lotId: 'lot-sd-407', status: 'READY' },
  { lotId: 'lot-sd-408', status: 'READY' },
  { lotId: 'lot-sd-409', status: 'READY' },
  { lotId: 'lot-sd-410', status: 'READY' },
  { lotId: 'lot-sd-411', status: 'READY' },
  { lotId: 'lot-sd-412', status: 'READY' },
  { lotId: 'lot-sd-413', status: 'READY' },
  { lotId: 'lot-sd-414', status: 'READY' },
  { lotId: 'lot-sd-415', status: 'READY' },
  { lotId: 'lot-sd-416', status: 'READY' },
  { lotId: 'lot-sd-417', status: 'READY' },
  { lotId: 'lot-sd-418', status: 'ATTENTION' },
  { lotId: 'lot-sd-419', status: 'ATTENTION' },
  { lotId: 'lot-sd-420', status: 'READY' },
  { lotId: 'lot-sd-421', status: 'READY' },
];
