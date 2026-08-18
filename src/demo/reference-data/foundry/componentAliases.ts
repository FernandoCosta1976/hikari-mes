import type { ComponentAlias } from '../../../domain/foundry-source-data/models';
import raw from './componentAliases.json';

/**
 * Correspondência determinística entre o código de referência da Fundição
 * (ex.: "1ST-E5111-W0") e o código do cadastro de máquinas (ex.: "1STE5111W00080").
 * Método: o código de referência sem hífens é um prefixo exato do código de máquina —
 * nenhuma correspondência aproximada (fuzzy) é usada.
 */
export const componentAliases: readonly ComponentAlias[] = raw as ComponentAlias[];
