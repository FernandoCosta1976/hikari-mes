import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { CurrentResourceStateProjection } from '../../../domain/current-resource-state/models';
import { FoundryResourceLandscape } from './FoundryResourceLandscape';

const items: readonly CurrentResourceStateProjection[] = [
  { resourceId: 'DC01', activityState: 'CURRENT_PRODUCTION_KNOWN', currentLotReference: '247', currentMaterial: 'Material A', source: 'DEMONSTRATIVE_MONITORING_PROJECTION', observedAt: '2025-05-15T15:42:00-03:00', receivedAt: '2025-05-15T15:43:00-03:00', freshness: 'CURRENT' },
  { resourceId: 'DC02', activityState: 'CURRENT_PRODUCTION_KNOWN', currentLotReference: '248', source: 'DEMONSTRATIVE_MONITORING_PROJECTION', observedAt: '2025-05-15T15:41:00-03:00', receivedAt: '2025-05-15T15:42:00-03:00', freshness: 'CURRENT' },
  { resourceId: 'DC03', activityState: 'NO_CURRENT_PRODUCTION_KNOWN', source: 'DEMONSTRATIVE_MONITORING_PROJECTION', observedAt: '2025-05-15T15:40:00-03:00', receivedAt: '2025-05-15T15:41:00-03:00', freshness: 'CURRENT' },
  { resourceId: 'DC04', activityState: 'INFORMATION_PARTIAL', currentLotReference: '249', source: 'DEMONSTRATIVE_MONITORING_PROJECTION', observedAt: '2025-05-15T15:39:00-03:00', receivedAt: '2025-05-15T15:40:00-03:00', freshness: 'PARTIAL' },
  { resourceId: 'DC05', activityState: 'INFORMATION_STALE', source: 'DEMONSTRATIVE_MONITORING_PROJECTION', observedAt: '2025-05-15T14:55:00-03:00', receivedAt: '2025-05-15T14:56:00-03:00', freshness: 'STALE' },
];

describe('FoundryResourceLandscape', () => {
  test('shows the five read-only Resource snapshots with safe projection states', () => {
    render(<FoundryResourceLandscape items={items} />);
    const landscape = screen.getByRole('region', { name: 'Agora na Fundição' });

    for (const resource of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) {
      expect(within(landscape).getByText(resource, { exact: true })).toBeVisible();
    }
    expect(landscape).toHaveTextContent('Estado observado · Cenário demonstrativo');
    expect(landscape).toHaveTextContent('Produção atual conhecida');
    expect(landscape).toHaveTextContent('Sem produção corrente conhecida');
    expect(landscape).toHaveTextContent('Informação parcial');
    expect(landscape).toHaveTextContent('Informação desatualizada');
    expect(landscape).not.toHaveTextContent('Disponível');
    expect(within(landscape).queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders Lot and Material only when supplied and preserves separate timestamps', () => {
    render(<FoundryResourceLandscape items={items} />);
    const dc01 = screen.getByRole('listitem', { name: /DC01, Produção atual conhecida, Lote 247, Material A, Atual/ });
    const dc03 = screen.getByRole('listitem', { name: /DC03, Sem produção corrente conhecida, Atual/ });
    const dc04 = screen.getByRole('listitem', { name: /DC04, Informação parcial, Lote 249, Informação parcial/ });

    expect(dc01).toHaveTextContent('Lote atual247');
    expect(dc01).toHaveTextContent('MaterialMaterial A');
    expect(dc01).toHaveTextContent('Observado às 15:42');
    expect(dc01).toHaveTextContent('Recebido separadamente às 15:43');
    expect(dc03).not.toHaveTextContent('Lote atual');
    expect(dc03).not.toHaveTextContent('Material');
    expect(dc04).toHaveTextContent('MaterialNão informado');
  });

  test('does not expose prohibited operational fields or assignment behavior', () => {
    render(<FoundryResourceLandscape items={items} />);
    const landscape = screen.getByRole('region', { name: 'Agora na Fundição' });

    expect(landscape).toHaveTextContent('A situação atual não representa atribuição dos Lotes planejados às máquinas.');
    for (const prohibited of ['Ordem de Produção', 'Início real', 'Quantidade produzida', 'Quantidade restante', 'Setup', 'Parada', 'OEE', 'Eficiência', 'Último evento']) {
      expect(landscape).not.toHaveTextContent(prohibited);
    }
    expect(landscape.querySelector('[draggable="true"]')).toBeNull();
  });
});
