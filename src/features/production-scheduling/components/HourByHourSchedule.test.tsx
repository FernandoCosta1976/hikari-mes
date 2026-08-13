import { screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { Lot } from '../../../domain/production-scheduling/models';
import { HourByHourSchedule } from './HourByHourSchedule';

const base = { materialId: 'material-a', quantity: 100, workCenterId: 'wc-1', destination: 'ASSEMBLY', productionOrderId: 'po-1', resourceId: null, materialAttention: false, state: 'SCHEDULED' } as const;
const lots: Lot[] = [
  { ...base, id: 'lot-short', lotNumber: 'A', scheduledStart: '2025-05-15T16:30:00-03:00', scheduledFinish: '2025-05-15T17:00:00-03:00' },
  { ...base, id: 'lot-long', lotNumber: 'B', scheduledStart: '2025-05-15T17:00:00-03:00', scheduledFinish: '2025-05-15T18:00:00-03:00' },
  { ...base, id: 'lot-crossing', lotNumber: 'C', scheduledStart: '2025-05-15T18:43:00-03:00', scheduledFinish: '2025-05-15T19:48:00-03:00' },
];

test('renders a continuous axis with start and width proportional to planned time', () => {
  render(<HourByHourSchedule lots={lots} materials={[{ id: 'material-a', code: 'A', name: 'Material A' }]} workCenter={{ id: 'wc-1', name: 'Fundição DC', areaLabel: 'Fundição DC' }} selectedLotId={null} onSelectLot={vi.fn()} />);
  expect(screen.getByText('Plano recebido — Balancing')).toBeInTheDocument();
  expect(screen.getByText('Sequência operacional será definida posteriormente')).toBeInTheDocument();
  const shortLot = screen.getByRole('button', { name: /Lote A/ });
  const longLot = screen.getByRole('button', { name: /Lote B/ });
  expect(Number.parseFloat(longLot.style.width)).toBeCloseTo(Number.parseFloat(shortLot.style.width) * 2, 5);
  expect(Number.parseFloat(longLot.style.left)).toBeGreaterThan(Number.parseFloat(shortLot.style.left));
  expect(screen.getByRole('button', { name: /Lote C.*18:43.*19:48/ })).toBeInTheDocument();
  expect(shortLot).not.toHaveAttribute('draggable');
});
