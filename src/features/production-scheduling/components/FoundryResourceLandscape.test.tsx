import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { FoundryResourceLandscape } from './FoundryResourceLandscape';

describe('FoundryResourceLandscape', () => {
  test('shows the five physical Resources without assigning Lots', () => {
    render(<FoundryResourceLandscape />);
    const landscape = screen.getByRole('region', { name: 'Máquinas da Fundição DC' });
    for (const resource of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) {
      expect(within(landscape).getByRole('listitem', { name: `Máquina ${resource}, sem Lote atribuído` })).toBeVisible();
    }
    expect(landscape).toHaveTextContent('5 máquinas físicas');
    expect(landscape).toHaveTextContent('Atribuição dos LotesAinda não realizada');
    expect(within(landscape).queryByText(/Lote 25/)).not.toBeInTheDocument();
    expect(within(landscape).queryByRole('button')).not.toBeInTheDocument();
    expect(landscape.querySelector('[draggable="true"]')).toBeNull();
    expect(landscape).not.toHaveTextContent('16:00');
    expect(landscape.querySelector('[aria-label*="referência temporal"]')).toBeNull();
  });
});
