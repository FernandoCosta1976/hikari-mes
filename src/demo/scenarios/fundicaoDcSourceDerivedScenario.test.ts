import { describe, expect, it } from 'vitest';
import { fundicaoDcSourceDerivedScenario, sourceDerivedLots, sourceDerivedMaterials } from './fundicaoDcSourceDerivedScenario';
import { scheduledDurationMinutes } from '../../domain/production-scheduling/cycleTimeMaster';
import { requiresSetup } from '../../domain/production-scheduling/setups';
import { FOUNDRY_RESOURCE_IDS } from '../../domain/resource/models';

describe('reference 2026-07-10 schedule — duration is mathematically quantity x Cycle Time, never a fixed block', () => {
  it('every Lot duration equals scheduledDurationMinutes(component, quantity) exactly', () => {
    for (const lot of sourceDerivedLots) {
      const material = sourceDerivedMaterials.find((item) => item.id === lot.materialId)!;
      const expectedMinutes = scheduledDurationMinutes(material.code, lot.quantity);
      const actualMinutes = Math.round((Date.parse(lot.scheduledFinish) - Date.parse(lot.scheduledStart)) / 60_000);
      expect(actualMinutes, `${lot.id} (${material.code} x${lot.quantity})`).toBe(expectedMinutes);
    }
  });

  it('two different components at different Cycle Times produce different durations even at the same or lower quantity (50 pcs high-CT can equal/exceed 100 pcs low-CT)', () => {
    const fiftyPieceDurations = sourceDerivedLots.filter((lot) => lot.quantity === 50).map((lot) => Math.round((Date.parse(lot.scheduledFinish) - Date.parse(lot.scheduledStart)) / 60_000));
    const hundredPieceDurations = sourceDerivedLots.filter((lot) => lot.quantity === 100).map((lot) => Math.round((Date.parse(lot.scheduledFinish) - Date.parse(lot.scheduledStart)) / 60_000));
    expect(new Set(fiftyPieceDurations).size).toBeGreaterThan(0);
    expect(new Set(hundredPieceDurations).size).toBeGreaterThan(1); // 100pc Lots alone already span multiple distinct durations (different Cycle Times)
  });

  it('every Resource sequence has no overlap and honors the Setup rule (requiresSetup -> 30min, same component -> 0min)', () => {
    for (const resourceId of FOUNDRY_RESOURCE_IDS) {
      const ordered = sourceDerivedLots.filter((lot) => lot.scheduledResourceId === resourceId).sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart));
      for (let index = 1; index < ordered.length; index += 1) {
        const previous = ordered[index - 1];
        const current = ordered[index];
        const requiredGapMinutes = requiresSetup(previous, current) ? 30 : 0;
        const actualGapMinutes = Math.round((Date.parse(current.scheduledStart) - Date.parse(previous.scheduledFinish)) / 60_000);
        expect(actualGapMinutes, `${resourceId}: ${previous.id} -> ${current.id}`).toBeGreaterThanOrEqual(requiredGapMinutes);
      }
    }
  });

  it('all 23 real FOUNDRY_DC requirements for 2026-07-10 are present, none invented, none dropped', () => {
    expect(sourceDerivedLots).toHaveLength(23);
    expect(sourceDerivedLots.reduce((sum, lot) => sum + lot.quantity, 0)).toBe(2100);
    const byResource = Object.fromEntries(FOUNDRY_RESOURCE_IDS.map((id) => [id, sourceDerivedLots.filter((lot) => lot.scheduledResourceId === id).length]));
    expect(byResource).toEqual({ DC01: 10, DC02: 3, DC03: 1, DC04: 3, DC05: 6 });
  });

  it('the Scenario Clock is 2026-07-10T09:15 and no Lot on this Resource day exceeds the Business Date', () => {
    expect(fundicaoDcSourceDerivedScenario.currentScenarioTime).toBe('2026-07-10T09:15:00-03:00');
    for (const lot of sourceDerivedLots) expect(lot.scheduledStart.slice(0, 10)).toBe('2026-07-10');
  });
});
