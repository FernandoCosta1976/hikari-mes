export type FoundryResourceId = 'DC01' | 'DC02' | 'DC03' | 'DC04' | 'DC05';

export const FOUNDRY_RESOURCE_IDS = ['DC01', 'DC02', 'DC03', 'DC04', 'DC05'] as const satisfies readonly FoundryResourceId[];
