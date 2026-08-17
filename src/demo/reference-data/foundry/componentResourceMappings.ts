import type { ComponentResourceMapping } from '../../../domain/foundry-source-data/models';
import raw from './componentResourceMappings.json';

/** Máquina titular/reserva por componente canônico — derivado de "máquina titular e reserva" (PecasPorModelo.xlsx). */
export const componentResourceMappings: readonly ComponentResourceMapping[] = raw as ComponentResourceMapping[];

export const componentResourceMappingByCode: Readonly<Record<string, ComponentResourceMapping>> =
  Object.fromEntries(componentResourceMappings.map((mapping) => [mapping.componentCode, mapping]));
