import type { ModelComponentMapping } from '../../../domain/foundry-source-data/models';
import raw from './modelComponentMappings.json';

/** Tabela completa de resolução PrefixoModelo × Família a partir da aba FUNDIÇÃO — inclui RESOLVED, MODEL_MAPPING_AMBIGUOUS e COMPONENT_MAPPING_NOT_FOUND. */
export const modelComponentMappings: readonly ModelComponentMapping[] = raw as ModelComponentMapping[];
