import { Surface } from '../Surface/Surface';

export function RouteMessage({ title, detail }: { title: string; detail: string }) {
  return <section><Surface><h1>{title}</h1><p>{detail}</p><a href="/demo/fundicao-dc/production-scheduling">Voltar ao cenário demonstrativo</a></Surface></section>;
}
