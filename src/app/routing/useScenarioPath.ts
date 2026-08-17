import { useParams } from 'react-router';

const DEFAULT_SCENARIO_ID = 'fundicao-dc';

/**
 * Composes an internal route against the scenario currently in the URL
 * (`/demo/:scenarioId/...`) instead of a hardcoded `/demo/fundicao-dc/...`.
 * Every in-app link/redirect must go through this so navigation never
 * silently drops the visitor out of the scenario they are in — see
 * ADR-002 (Section 13 of the canonical baseline round).
 */
export function useScenarioPath() {
  const { scenarioId } = useParams();
  return (subPath: string) => `/demo/${scenarioId ?? DEFAULT_SCENARIO_ID}${subPath}`;
}
