import type {
  FoundryComponentRequirement,
  FoundryComponentRequirementExclusion,
  FoundryDatasetAuditCounts,
} from '../../../domain/foundry-source-data/models';
import raw from './foundryComponentRequirements.json';

/**
 * Dataset canônico completo derivado de LINHA C OFC (Quadro HH 2026 Linha C) ×
 * FUNDIÇÃO × máquina titular e reserva (PecasPorModelo.xlsx). Cada linha da
 * LINHA C OFC é preservada sem deduplicação; cada família aplicável (AB–AG ≠ NA)
 * gera uma necessidade independente. Somente correspondências determinísticas
 * (sem fuzzy matching) entram como resolvidas — o restante é preservado em
 * `foundryComponentRequirementExclusions` com o motivo da exclusão.
 */
export const foundryComponentRequirements: readonly FoundryComponentRequirement[] =
  raw.requirements as unknown as FoundryComponentRequirement[];

export const foundryComponentRequirementExclusions: readonly FoundryComponentRequirementExclusion[] =
  raw.exclusions as unknown as FoundryComponentRequirementExclusion[];

export const foundryDatasetAuditCounts: FoundryDatasetAuditCounts = raw.audit as FoundryDatasetAuditCounts;
