export type FoundryFamily = 'CARC_ESQ' | 'CARC_DIR' | 'TAMPA_ESQ' | 'TAMPA_DIR' | 'CILINDRO' | 'CABECOTE';

export const foundryFamilyLabel: Record<FoundryFamily, string> = {
  CARC_ESQ: 'Carcaça Esquerda',
  CARC_DIR: 'Carcaça Direita',
  TAMPA_ESQ: 'Tampa Esquerda',
  TAMPA_DIR: 'Tampa Direita',
  CILINDRO: 'Cilindro',
  CABECOTE: 'Cabeçote',
};

export type FoundryProductiveArea = 'FOUNDRY_DC' | 'FOUNDRY_LP';

/** PRIMARY = máquina titular; RESERVE = máquina reserva; NOT_ENABLED = sem mapeamento de máquina conhecido. */
export type ResourceRole = 'PRIMARY' | 'RESERVE' | 'NOT_ENABLED';

export const resourceRoleLabel: Record<ResourceRole, string> = {
  PRIMARY: 'Titular',
  RESERVE: 'Reserva',
  NOT_ENABLED: 'Não habilitada',
};

/** TEM PADRÃO? da fonte máquina titular e reserva — não inferir NOT_CONFIRMED como bloqueio sem regra governada. */
export type StandardStatus = 'CONFIRMED' | 'NOT_CONFIRMED' | 'UNKNOWN';

export interface FoundryComponent {
  referenceCode: string;
  family: FoundryFamily;
  productiveArea: FoundryProductiveArea;
}

export interface ComponentResourceMapping {
  componentCode: string;
  primaryResource: string | null;
  primaryStandardStatus: StandardStatus;
  reserveResources: readonly string[];
  reserveStandardStatus: StandardStatus;
  machineMasterCode: string;
}

export interface ComponentAlias {
  referenceComponentCode: string;
  sourceCode: string;
  source: string;
  matchMethod: 'DASHLESS_PREFIX';
  status: 'RESOLVED';
}

export type ModelComponentMappingStatus = 'RESOLVED' | 'AMBIGUOUS' | 'NOT_FOUND';

export interface ModelComponentMapping {
  modelPrefix: string;
  family: FoundryFamily;
  status: ModelComponentMappingStatus;
  resolvedCode: string | null;
  candidates: readonly string[];
}

/** Uma necessidade de Fundição explodida de uma linha da LINHA C OFC para uma família aplicável. */
export interface FoundryComponentRequirement {
  /** Identificador técnico determinístico da linha (número da linha na planilha LINHA C OFC) — Item e Lote se repetem na fonte e não são chave única sozinhos. */
  sourceRowIndex: number;
  sourceItem: number | string;
  sourceModel: string;
  modelPrefix: string;
  sourceColor: string;
  sourceQuantity: number;
  sourceLot: number | string;
  sourceBusinessDate: string | null;
  /** Motor Hora Inicial/Final do plano da motocicleta — NÃO é o horário real do bloco de Fundição. */
  sourceDemandStart: string | null;
  sourceDemandFinish: string | null;
  family: FoundryFamily;
  componentCode: string;
  primaryResource: string | null;
  reserveResources: readonly string[];
  primaryStandardStatus: string | null;
  reserveStandardStatus: string | null;
  productiveArea: FoundryProductiveArea;
  machineMasterCode: string;
}

export type ExclusionReason =
  | 'MODEL_MAPPING_NOT_FOUND'
  | 'MODEL_MAPPING_AMBIGUOUS'
  | 'COMPONENT_MAPPING_NOT_FOUND'
  | 'RESOURCE_MAPPING_NOT_FOUND'
  | 'RESOURCE_MAPPING_AMBIGUOUS'
  | 'PRODUCTIVE_AREA_UNRESOLVED';

export interface FoundryComponentRequirementExclusion {
  sourceItem: number | string;
  sourceModel: string;
  modelPrefix: string;
  sourceLot: number | string;
  family: FoundryFamily;
  reason: ExclusionReason;
  candidates?: readonly string[];
  componentCode?: string;
}

export interface FoundryDatasetAuditCounts {
  A_linhas_consideradas_linha_c_ofc: number;
  B_linhas_ignoradas_all_na: number;
  linhas_aplicaveis: number;
  C_component_requirements_explodidos: number;
  D_requirements_resolvidos: number;
  E_ambiguidades: number;
  F_unmatched: number;
  G_requirements_dc: number;
  H_requirements_lp: number;
  I_quantidade_total_dc: number;
  J_quantidade_total_excluida: number;
}
