/**
 * Demonstrative Component Cycle Time Master — one Ideal Cycle Time per real
 * Component Code used in the reference 2026-07-10 Fundição DC plan.
 * Deterministic, centralized, never random at runtime. Assumption: 1 peça
 * por ciclo. Values are plausible casting cycle times (35-95 s/peça) but
 * are demonstrative — BUSINESS VALIDATION REQUIRED before they represent a
 * governed standard.
 */
export const DEMONSTRATIVE_CYCLE_TIME_ORIGIN = 'DEMONSTRATIVE_MASTER_DATA' as const;

export const demonstrativeComponentCycleTimeSecondsMaster: Readonly<Record<string, number>> = {
  '44C-E5421-W0': 42,
  '1ST-E5421-W0': 58,
  '5LX-E5421-X0': 39,
  '1B2-E5411-W0': 51,
  '1ST-E5111-W0': 67,
  '1S4-E5411-W0': 45,
  '1ST-E5411-W0': 73,
  '44C-E5111-W0': 84,
  '1ST-E1310-W0': 95,
};

/** quantity x Ideal Cycle Time, rounded to the nearest minute for a readable demonstrative schedule. */
export function scheduledDurationMinutes(componentCode: string, quantity: number): number {
  const cycleTimeSeconds = demonstrativeComponentCycleTimeSecondsMaster[componentCode];
  if (cycleTimeSeconds === undefined) throw new Error(`No demonstrative Cycle Time for component ${componentCode}`);
  return Math.round((quantity * cycleTimeSeconds) / 60);
}
