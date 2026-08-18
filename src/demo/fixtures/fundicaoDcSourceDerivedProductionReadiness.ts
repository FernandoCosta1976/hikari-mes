import type { DemoLotReadinessRecord } from './fundicaoDcProductionReadiness';

/**
 * Situação de preparação por Lote — sinalizada a partir de dados reais do
 * mapeamento componente→máquina: os requirements de 1ST-E1310-W0 · Cilindro
 * em DC05 (lot-sd-521/522/523) não têm máquina reserva confirmada
 * (reserveResources vazio, "TEM PADRÃO?" reserva = NÃO), por isso ficam
 * ATTENTION. Os demais têm reserva confirmada e ficam READY.
 */
export const fundicaoDcSourceDerivedProductionReadinessFixture: readonly DemoLotReadinessRecord[] = [
  { lotId: 'lot-sd-501', status: 'READY' },
  { lotId: 'lot-sd-502', status: 'READY' },
  { lotId: 'lot-sd-503', status: 'READY' },
  { lotId: 'lot-sd-504', status: 'READY' },
  { lotId: 'lot-sd-505', status: 'READY' },
  { lotId: 'lot-sd-506', status: 'READY' },
  { lotId: 'lot-sd-507', status: 'READY' },
  { lotId: 'lot-sd-508', status: 'READY' },
  { lotId: 'lot-sd-509', status: 'READY' },
  { lotId: 'lot-sd-510', status: 'READY' },
  { lotId: 'lot-sd-511', status: 'READY' },
  { lotId: 'lot-sd-512', status: 'READY' },
  { lotId: 'lot-sd-513', status: 'READY' },
  { lotId: 'lot-sd-514', status: 'READY' },
  { lotId: 'lot-sd-515', status: 'READY' },
  { lotId: 'lot-sd-516', status: 'READY' },
  { lotId: 'lot-sd-517', status: 'READY' },
  { lotId: 'lot-sd-518', status: 'READY' },
  { lotId: 'lot-sd-519', status: 'READY' },
  { lotId: 'lot-sd-520', status: 'READY' },
  { lotId: 'lot-sd-521', status: 'ATTENTION' },
  { lotId: 'lot-sd-522', status: 'ATTENTION' },
  { lotId: 'lot-sd-523', status: 'ATTENTION' },
];
