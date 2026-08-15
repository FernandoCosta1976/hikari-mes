import { describe, expect, it } from 'vitest';
import type { ResourceSimulationImpact } from './resourceSimulation';
import { adoptOrganization } from './organization';

const impact: ResourceSimulationImpact = { lotId: 'lot-251', originalResourceId: 'DC01', simulatedResourceId: 'DC03', originSetupDeltaMinutes: 0, destinationSetupDeltaMinutes: 5, netSetupDeltaMinutes: 5, conflictLotIds: [], conflictSetupIds: [], bufferImpact: 'NEUTRAL' };

describe('adoptOrganization', () => {
  it('preserves the Programmed Resource distinct from the adopted Operational Resource', () => {
    const organization = adoptOrganization(impact, '2025-05-15T17:23:00-03:00', 'Planejador da Fundição · demonstrativo');
    expect(organization.programmedResourceId).toBe('DC01');
    expect(organization.operationalResourceId).toBe('DC03');
    expect(organization.programmedResourceId).not.toBe(organization.operationalResourceId);
    expect(organization.lotId).toBe('lot-251');
  });
});
