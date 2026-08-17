import { withBase } from '../../../app/routing/basePath';
import { useScenarioPath } from '../../../app/routing/useScenarioPath';
import { Surface } from '../Surface/Surface';

export function RouteMessage({ title, detail }: { title: string; detail: string }) {
  const scenarioPath = useScenarioPath();
  return <section><Surface><h1>{title}</h1><p>{detail}</p><a href={withBase(scenarioPath('/production-scheduling'))}>Voltar ao cenário demonstrativo</a></Surface></section>;
}
