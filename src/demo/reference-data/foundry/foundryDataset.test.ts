import { describe, expect, it } from 'vitest';
import { foundryComponentRequirements, foundryComponentRequirementExclusions, foundryDatasetAuditCounts } from './foundryComponentRequirements';
import { componentResourceMappings } from './componentResourceMappings';
import { componentAliases } from './componentAliases';
import { modelComponentMappings } from './modelComponentMappings';
import { foundryComponents } from './foundryComponents';
import { fundicaoDcSourceDerivedScenario, sourceDerivedLots, sourceDerivedMaterials, sourceDerivedTraceabilityByLotId } from '../../scenarios/fundicaoDcSourceDerivedScenario';
import { FOUNDRY_RESOURCE_IDS } from '../../../domain/resource/models';
import { deriveScheduledSetups } from '../../../domain/production-scheduling/setups';

describe('reference foundry dataset — LINHA C OFC × FUNDIÇÃO × máquina titular e reserva', () => {
  it('computes modelPrefix as the first three uppercase characters of the source model', () => {
    for (const requirement of foundryComponentRequirements) {
      expect(requirement.modelPrefix).toBe(requirement.sourceModel.toUpperCase().slice(0, 3));
    }
  });

  it('never lets a resolved requirement or exclusion carry an all-NA source row (Section 3 filtering already happened upstream)', () => {
    expect(foundryComponentRequirements.length).toBeGreaterThan(0);
    expect(foundryComponentRequirementExclusions.length).toBeGreaterThan(0);
  });

  it('preserves sourceLot and sourceItem for every requirement — never deduplicates LINHA C rows', () => {
    for (const requirement of foundryComponentRequirements) {
      expect(requirement.sourceLot).not.toBeUndefined();
      expect(requirement.sourceItem).not.toBeUndefined();
    }
    // "Lote" and "Item" numbering both recur in the source (e.g. Item 232 appears twice
    // on 2026-07-27 for two genuinely different rows) — sourceRowIndex is the
    // deterministic technical identifier (Section 4) that must never collapse.
    const rows = foundryComponentRequirements.map((requirement) => `${requirement.sourceRowIndex}:${requirement.family}`);
    expect(new Set(rows).size).toBe(rows.length);
    expect(rows.length).toBe(604);
  });

  it('applies the 1 motorcycle = 1 component demonstrative assumption (requiredQuantity === LINHA C Qtd)', () => {
    for (const requirement of foundryComponentRequirements) {
      expect(requirement.sourceQuantity).toBeGreaterThan(0);
    }
  });

  it('flags the known BFW × Carcaça Esquerda and BSR × Cilindro ambiguities without picking a winner', () => {
    const bfwCarcEsq = modelComponentMappings.find((mapping) => mapping.modelPrefix === 'BFW' && mapping.family === 'CARC_ESQ');
    const bsrCilindro = modelComponentMappings.find((mapping) => mapping.modelPrefix === 'BSR' && mapping.family === 'CILINDRO');
    expect(bfwCarcEsq?.status).toBe('AMBIGUOUS');
    expect(bfwCarcEsq?.resolvedCode).toBeNull();
    expect(bsrCilindro?.status).toBe('AMBIGUOUS');
    expect(bsrCilindro?.resolvedCode).toBeNull();
    expect(foundryComponentRequirementExclusions.some((exclusion) => exclusion.modelPrefix === 'BFW' && exclusion.family === 'CARC_ESQ' && exclusion.reason === 'MODEL_MAPPING_AMBIGUOUS')).toBe(true);
    expect(foundryComponentRequirementExclusions.some((exclusion) => exclusion.modelPrefix === 'BSR' && exclusion.family === 'CILINDRO' && exclusion.reason === 'MODEL_MAPPING_AMBIGUOUS')).toBe(true);
  });

  it('excludes the unmapped BUP, BXN and D25 prefixes instead of inventing a component', () => {
    for (const prefix of ['BUP', 'BXN', 'D25']) {
      expect(modelComponentMappings.some((mapping) => mapping.modelPrefix === prefix && mapping.status === 'RESOLVED')).toBe(false);
      expect(foundryComponentRequirements.some((requirement) => requirement.modelPrefix === prefix)).toBe(false);
      expect(foundryComponentRequirementExclusions.some((exclusion) => exclusion.modelPrefix === prefix)).toBe(true);
    }
  });

  it('resolves component aliases only through an exact dashless-prefix match (never fuzzy)', () => {
    expect(componentAliases.length).toBeGreaterThan(0);
    for (const alias of componentAliases) {
      const dashless = alias.referenceComponentCode.replace(/-/g, '').toUpperCase();
      expect(alias.sourceCode.startsWith(dashless)).toBe(true);
      expect(alias.matchMethod).toBe('DASHLESS_PREFIX');
    }
  });

  it('gives every resource mapping a normalized DC01–DC05 or LPx resource id — no invented machine', () => {
    for (const mapping of componentResourceMappings) {
      if (mapping.primaryResource) expect(mapping.primaryResource).toMatch(/^(DC0[1-5]|LP[1-4])$/);
      for (const reserve of mapping.reserveResources) expect(reserve).toMatch(/^(DC0[1-5]|LP[1-4])$/);
    }
  });

  it('routes every resolved requirement to a real productiveArea (FOUNDRY_DC or FOUNDRY_LP), never leaving it unresolved', () => {
    for (const requirement of foundryComponentRequirements) {
      expect(['FOUNDRY_DC', 'FOUNDRY_LP']).toContain(requirement.productiveArea);
    }
  });

  it('routes Cabeçote (LP-only components) out of the DC scenario entirely', () => {
    const cabecoteComponents = foundryComponents.filter((component) => component.family === 'CABECOTE');
    expect(cabecoteComponents.every((component) => component.productiveArea === 'FOUNDRY_LP')).toBe(true);
    expect(sourceDerivedMaterials.some((material) => material.code.includes('CABECOTE'))).toBe(false);
    for (const lot of sourceDerivedLots) {
      const material = sourceDerivedMaterials.find((item) => item.id === lot.materialId)!;
      const component = foundryComponents.find((item) => item.referenceCode === material.code);
      expect(component?.productiveArea).toBe('FOUNDRY_DC');
    }
  });

  it('reconciles the audit counts (Section 28) — the totals close mathematically', () => {
    const audit = foundryDatasetAuditCounts;
    expect(audit.A_linhas_consideradas_linha_c_ofc).toBe(audit.B_linhas_ignoradas_all_na + audit.linhas_aplicaveis);
    expect(audit.C_component_requirements_explodidos).toBe(audit.D_requirements_resolvidos + audit.E_ambiguidades + audit.F_unmatched);
    expect(audit.D_requirements_resolvidos).toBe(audit.G_requirements_dc + audit.H_requirements_lp);
    expect(audit.C_component_requirements_explodidos).toBe(foundryComponentRequirements.length + foundryComponentRequirementExclusions.length);
  });
});

describe('source-derived Fundição DC scenario (2026-07-09 operational subset)', () => {
  it('never falls back to the artificial Material A/B/C/D/E naming', () => {
    for (const material of fundicaoDcSourceDerivedScenario.productionScheduling.materials) {
      expect(material.name).not.toMatch(/Material [A-E]\b/);
      expect(material.code).not.toMatch(/Material [A-E]\b/);
    }
  });

  it('keeps the five Fundição DC lanes in the fixed DC01→DC05 order regardless of lot content', () => {
    expect(FOUNDRY_RESOURCE_IDS).toEqual(['DC01', 'DC02', 'DC03', 'DC04', 'DC05']);
  });

  it('preserves full traceability from every scheduled Lot back to its LINHA C source row', () => {
    for (const lot of sourceDerivedLots) {
      const traceability = sourceDerivedTraceabilityByLotId[lot.id];
      expect(traceability).toBeDefined();
      expect(traceability.sourceLot).not.toBeUndefined();
      expect(traceability.sourceModel.length).toBeGreaterThan(0);
      const material = sourceDerivedMaterials.find((item) => item.id === lot.materialId)!;
      expect(traceability.componentCode).toBe(material.code);
    }
  });

  it('derives Setup from a component-code transition (never from the retired Material A→B semantics)', () => {
    const setups = deriveScheduledSetups(sourceDerivedLots, 30);
    expect(setups.length).toBeGreaterThan(0);
    for (const setup of setups) expect(setup.previousMaterialId).not.toBe(setup.nextMaterialId);
  });
});
