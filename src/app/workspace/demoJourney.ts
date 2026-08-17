export interface DemoJourneyStep {
  id: string;
  label: string;
  href: string;
  path: string;
}

/**
 * Etapas Preparação (02) e Liberação (03) fazem deep-link a um Lote
 * específico — o identificador varia por cenário, então cada cenário
 * registra o seu aqui em vez de um id fixo hardcoded no journey.
 */
const journeyLotIdByScenario: Readonly<Record<string, string>> = {
  'fundicao-dc': 'lot-sd-401',
  'fundicao-dc-legacy': 'lot-251',
};
const defaultJourneyLotId = journeyLotIdByScenario['fundicao-dc'];
const preparationLotIdByScenario: Readonly<Record<string, string>> = {
  'fundicao-dc': 'lot-sd-407',
  'fundicao-dc-legacy': 'lot-252',
};

/** Paths are relative to the current scenario (`/demo/:scenarioId`) — see useScenarioPath. */
export function demoJourney(scenarioId: string | undefined): readonly DemoJourneyStep[] {
  const liberacaoLotId = (scenarioId && journeyLotIdByScenario[scenarioId]) ?? defaultJourneyLotId;
  const preparacaoLotId = (scenarioId && preparationLotIdByScenario[scenarioId]) ?? preparationLotIdByScenario['fundicao-dc'];
  return [
    { id: '01', label: 'Plano', href: '/production-scheduling', path: '/production-scheduling' },
    { id: '02', label: 'Preparação', href: `/production-readiness?lotId=${preparacaoLotId}`, path: '/production-readiness' },
    { id: '03', label: 'Liberação', href: `/production-scheduling?lotId=${liberacaoLotId}`, path: '/production-scheduling' },
    { id: '04', label: 'Execução', href: '/production-execution', path: '/production-execution' },
    { id: '05', label: 'Acompanhamento', href: '/production-monitoring', path: '/production-monitoring' },
    { id: '06', label: 'Aderência', href: '/production-adherence', path: '/production-adherence' },
    { id: '07', label: 'Qualidade', href: '/production-quality', path: '/production-quality' },
    { id: '08', label: 'OEE', href: '/oee', path: '/oee' },
  ];
}

/** Strips the `/demo/:scenarioId` prefix so journey matching works for any scenario. */
function relativePath(pathname: string): string {
  return pathname.replace(/^\/demo\/[^/]+/, '') || '/';
}

/** -1 means the current route is not part of the guided demo journey (e.g. Home, Visão Estratégica). */
export function currentJourneyIndex(pathname: string, search: string, scenarioId: string | undefined): number {
  const relative = relativePath(pathname);
  const liberacaoLotId = (scenarioId && journeyLotIdByScenario[scenarioId]) ?? defaultJourneyLotId;
  if (relative === '/production-scheduling' && search.includes(`lotId=${liberacaoLotId}`)) return 2;
  return demoJourney(scenarioId).findIndex((step) => step.path === relative);
}
