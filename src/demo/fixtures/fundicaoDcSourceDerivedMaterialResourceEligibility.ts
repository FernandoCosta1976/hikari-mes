import type { DemoMaterialResourceEligibilityRecord } from './fundicaoDcMaterialResourceEligibility';

/** Elegibilidade real: máquina titular + reservas, derivada de componentResourceMappings (máquina titular e reserva). */
export const fundicaoDcSourceDerivedMaterialResourceEligibilityFixture: readonly DemoMaterialResourceEligibilityRecord[] = [
  { materialId: 'component-44c-e5421-w0', eligibleResourceIds: ['DC01', 'DC02', 'DC03'] },
  { materialId: 'component-1st-e5421-w0', eligibleResourceIds: ['DC01', 'DC02'] },
  { materialId: 'component-5lx-e5421-x0', eligibleResourceIds: ['DC01', 'DC03'] },
  { materialId: 'component-1b2-e5411-w0', eligibleResourceIds: ['DC01', 'DC03'] },
  { materialId: 'component-1st-e5111-w0', eligibleResourceIds: ['DC02', 'DC01', 'DC04'] },
  { materialId: 'component-1s4-e5411-w0', eligibleResourceIds: ['DC03', 'DC01', 'DC02'] },
  { materialId: 'component-1st-e5411-w0', eligibleResourceIds: ['DC04', 'DC03'] },
  { materialId: 'component-44c-e5111-w0', eligibleResourceIds: ['DC05', 'DC03', 'DC04'] },
  { materialId: 'component-1st-e1310-w0', eligibleResourceIds: ['DC05'] },
];
