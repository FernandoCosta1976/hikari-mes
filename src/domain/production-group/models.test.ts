import { describe, expect, it } from 'vitest';
import { POWERTRAIN, operationalProductiveArea, powertrainProductiveAreas } from './models';
import { FOUNDRY_RESOURCE_IDS } from '../resource/models';
import { fundicaoDcSourceDerivedScenario, sourceDerivedLots, sourceDerivedMaterials } from '../../demo/scenarios/fundicaoDcSourceDerivedScenario';
import { fundicaoDcSourceDerivedProductionReadinessFixture } from '../../demo/fixtures/fundicaoDcSourceDerivedProductionReadiness';
import { componentResourceMappingByCode } from '../../demo/reference-data/foundry/componentResourceMappings';
import { foundryComponentRequirements } from '../../demo/reference-data/foundry/foundryComponentRequirements';

/** Section 19 invariants for the canonical baseline & PowerTrain round. */
describe('PowerTrain domain hierarchy (Section 19.1–19.3)', () => {
  it('1. PowerTrain governs exactly the five Áreas Produtivas', () => {
    expect(powertrainProductiveAreas).toHaveLength(5);
    expect(powertrainProductiveAreas.map((area) => area.id).sort()).toEqual(
      ['fundicao-dc', 'fundicao-lp', 'pintura-aluminio', 'usinagem-aluminio', 'usinagem-ferrosos'],
    );
    for (const area of powertrainProductiveAreas) expect(area.productionGroupId).toBe(POWERTRAIN.id);
  });

  it('2. Fundição DC is the one operational Área — DC01–DC05 belong to it, no other Área fabricates operational facts', () => {
    expect(operationalProductiveArea.id).toBe('fundicao-dc');
    expect(powertrainProductiveAreas.filter((area) => area.operational)).toHaveLength(1);
    expect(FOUNDRY_RESOURCE_IDS).toEqual(['DC01', 'DC02', 'DC03', 'DC04', 'DC05']);
  });

  it('3. DC01–DC05 are Resources, never registered as Áreas Produtivas', () => {
    const areaIds = new Set<string>(powertrainProductiveAreas.map((area) => area.id));
    for (const resourceId of FOUNDRY_RESOURCE_IDS) expect(areaIds.has(resourceId)).toBe(false);
  });
});

describe('Canonical Fundição DC baseline (Section 19.5–19.13)', () => {
  it('5. only RESOLVED requirements (with a real component + resource mapping) enter the Plano', () => {
    for (const lot of sourceDerivedLots) {
      const material = sourceDerivedMaterials.find((item) => item.id === lot.materialId)!;
      expect(componentResourceMappingByCode[material.code]).toBeDefined();
    }
  });

  it('7. Primary/Reserve on a scheduled Lot come from the source resource master, not an invented assignment', () => {
    const lot407 = sourceDerivedLots.find((lot) => lot.id === 'lot-sd-407')!;
    const material = sourceDerivedMaterials.find((item) => item.id === lot407.materialId)!;
    const mapping = componentResourceMappingByCode[material.code];
    expect(mapping.primaryResource).toBe('DC01');
    expect(mapping.reserveResources).toEqual(['DC03']);
    expect(lot407.scheduledResourceId).toBe(mapping.primaryResource);
  });

  it('11. Plano and Preparação consume the exact same canonical Lot set', () => {
    const planLotIds = new Set(sourceDerivedLots.map((lot) => lot.id));
    for (const readiness of fundicaoDcSourceDerivedProductionReadinessFixture) expect(planLotIds.has(readiness.lotId)).toBe(true);
    expect(fundicaoDcSourceDerivedProductionReadinessFixture).toHaveLength(sourceDerivedLots.length);
  });

  it('12. Business Date filters the canonical dataset to exactly the scheduled Fundição DC requirements', () => {
    const businessDate = fundicaoDcSourceDerivedScenario.productionScheduling.schedules[0].businessDate;
    expect(businessDate).toBe('2026-07-09');
    const dcRequirementsOnDate = foundryComponentRequirements.filter((requirement) => requirement.sourceBusinessDate === businessDate && requirement.productiveArea === 'FOUNDRY_DC');
    expect(dcRequirementsOnDate).toHaveLength(sourceDerivedLots.length);
  });

  it('13. the legacy Material A/B/C/D/E naming never appears in the official runtime scenario', () => {
    expect(fundicaoDcSourceDerivedScenario.id).toBe('fundicao-dc');
    for (const material of sourceDerivedMaterials) {
      expect(material.name).not.toMatch(/^Material [A-E]\b/);
      expect(material.code).not.toMatch(/^Material [A-E]\b/);
    }
  });
});
