import type { FoundryComponent } from '../../../domain/foundry-source-data/models';
import raw from './foundryComponents.json';

/** Componentes canônicos de Fundição efetivamente usados pelas necessidades resolvidas — derivado de FUNDIÇÃO (PecasPorModelo.xlsx). */
export const foundryComponents: readonly FoundryComponent[] = raw as FoundryComponent[];
