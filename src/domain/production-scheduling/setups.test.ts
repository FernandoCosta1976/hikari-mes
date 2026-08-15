import { describe, expect, test } from 'vitest';
import { fundicaoDcScenario } from '../../demo/scenarios/fundicaoDcScenario';
import { productionSchedulingDemoConfiguration } from '../../demo/configuration/productionSchedulingDemoConfiguration';
import { deriveScheduledSetups, requiresSetup } from './setups';
import { minutesBetween } from './temporalMath';

const definition = fundicaoDcScenario.productionScheduling;
const lots = definition.lots.filter((lot) => !lot.id.includes('-d'));
const setups = deriveScheduledSetups(lots, productionSchedulingDemoConfiguration.setupDurationMinutes);

describe('demonstrative material-change setup', () => {
  test('requires setup only when Material changes on the same Resource', () => {
    expect(requiresSetup(lots.find((lot) => lot.id === 'lot-251')!, lots.find((lot) => lot.id === 'lot-257')!)).toBe(false);
    expect(requiresSetup(lots.find((lot) => lot.id === 'lot-252')!, lots.find((lot) => lot.id === 'lot-256')!)).toBe(true);
  });

  test('uses the centralized 30-minute demonstrative assumption without becoming a Lot or quantity', () => {
    expect(productionSchedulingDemoConfiguration.setupDurationMinutes).toBe(30);
    expect(setups.length).toBeGreaterThan(0);
    for (const setup of setups) {
      expect(setup.durationMinutes).toBe(30);
      expect(minutesBetween(setup.scheduledStart, setup.scheduledFinish)).toBe(30);
      expect(setup).not.toHaveProperty('quantity');
      expect(setup).not.toHaveProperty('lotNumber');
    }
    expect(lots).toHaveLength(27);
    expect(lots.reduce((sum, lot) => sum + lot.quantity, 0)).toBe(2000);
  });

  test('places every setup after its previous Lot and before the next Lot without overlap', () => {
    for (const setup of setups) {
      const resourceLots = lots.filter((lot) => lot.scheduledResourceId === setup.resourceId);
      expect(resourceLots.some((lot) => lot.materialId === setup.previousMaterialId && lot.scheduledFinish === setup.scheduledStart)).toBe(true);
      expect(resourceLots.some((lot) => lot.materialId === setup.nextMaterialId && Date.parse(lot.scheduledStart) >= Date.parse(setup.scheduledFinish))).toBe(true);
      expect(resourceLots.some((lot) => Date.parse(lot.scheduledStart) < Date.parse(setup.scheduledFinish) && Date.parse(setup.scheduledStart) < Date.parse(lot.scheduledFinish))).toBe(false);
    }
  });
});
