export interface DemoJourneyStep {
  id: string;
  label: string;
  href: string;
  path: string;
}

export const DEMO_JOURNEY: readonly DemoJourneyStep[] = [
  { id: '01', label: 'Plano', href: '/demo/fundicao-dc/production-scheduling', path: '/demo/fundicao-dc/production-scheduling' },
  { id: '02', label: 'Preparação', href: '/demo/fundicao-dc/production-readiness?lotId=lot-252', path: '/demo/fundicao-dc/production-readiness' },
  { id: '03', label: 'Liberação', href: '/demo/fundicao-dc/production-scheduling?lotId=lot-251', path: '/demo/fundicao-dc/production-scheduling' },
  { id: '04', label: 'Execução', href: '/demo/fundicao-dc/production-execution', path: '/demo/fundicao-dc/production-execution' },
  { id: '05', label: 'Acompanhamento', href: '/demo/fundicao-dc/production-monitoring', path: '/demo/fundicao-dc/production-monitoring' },
  { id: '06', label: 'Aderência', href: '/demo/fundicao-dc/production-adherence', path: '/demo/fundicao-dc/production-adherence' },
  { id: '07', label: 'Qualidade', href: '/demo/fundicao-dc/production-quality', path: '/demo/fundicao-dc/production-quality' },
  { id: '08', label: 'OEE', href: '/demo/fundicao-dc/oee', path: '/demo/fundicao-dc/oee' },
];

export function currentJourneyIndex(pathname: string, search: string): number {
  if (pathname === '/demo/fundicao-dc/production-scheduling' && search.includes('lotId=lot-251')) return 2;
  const index = DEMO_JOURNEY.findIndex((step) => step.path === pathname);
  return index === -1 ? 0 : index;
}
