import { expect, test } from 'vitest';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { simulateResourceMove } from './resourceSimulation';

const lots = scenarioDefinitionAdapter.findById('fundicao-dc')!.productionScheduling.lots.filter((lot) => !lot.id.includes('-d'));

test('calculates origin, destination and net Setup without mutating the baseline', () => {
  const baselineResource = lots.find((lot) => lot.id === 'lot-251')!.scheduledResourceId;
  const result = simulateResourceMove(lots, 'lot-251', 'DC05', 30, ['lot-255']);
  expect(result.originalResourceId).toBe('DC01');
  expect(result.simulatedResourceId).toBe('DC05');
  expect(result.netSetupDeltaMinutes).toBe(result.originSetupDeltaMinutes + result.destinationSetupDeltaMinutes);
  expect(lots.find((lot) => lot.id === 'lot-251')!.scheduledResourceId).toBe(baselineResource);
});

test('detects temporal Lot conflicts and buffer risk only for a critical Lot', () => {
  const regular = simulateResourceMove(lots, 'lot-257', 'DC03', 30, ['lot-255']);
  expect(regular.conflictLotIds).toContain('lot-260');
  expect(regular.bufferImpact).toBe('NEUTRAL');
  const critical = simulateResourceMove(lots, 'lot-255', 'DC03', 30, ['lot-255']);
  expect(critical.conflictLotIds.length).toBeGreaterThan(0);
  expect(critical.bufferImpact).toBe('RISK');
});
