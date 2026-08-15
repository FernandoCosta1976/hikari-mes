import { screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { Lot } from '../../../domain/production-scheduling/models';
import { calculateCurrentTimeScrollLeft } from '../../../domain/production-scheduling/temporalMath';
import { HourByHourSchedule } from './HourByHourSchedule';
import { fundicaoDcShifts } from '../../../demo/scenarios/fundicaoDcScenario';

const base = { materialId: 'material-a', quantity: 100, workCenterId: 'wc-1', destination: 'ASSEMBLY', productionOrderId: 'po-1', scheduledResourceId: 'DC01', materialAttention: false, state: 'SCHEDULED' } as const;
const lots: Lot[] = [
  { ...base, id: 'lot-short', lotNumber: 'A', scheduledStart: '2025-05-15T16:30:00-03:00', scheduledFinish: '2025-05-15T17:00:00-03:00' },
  { ...base, id: 'lot-long', lotNumber: 'B', scheduledStart: '2025-05-15T17:00:00-03:00', scheduledFinish: '2025-05-15T18:00:00-03:00' },
  { ...base, id: 'lot-crossing', lotNumber: 'C', scheduledStart: '2025-05-15T18:43:00-03:00', scheduledFinish: '2025-05-15T19:48:00-03:00' },
];

test('renders a continuous axis with start and width proportional to planned time', () => {
  render(<HourByHourSchedule lots={lots} materials={[{ id: 'material-a', code: 'A', name: 'Material A' }]} workCenter={{ id: 'wc-1', name: 'Fundição DC', areaLabel: 'Fundição DC' }} shifts={fundicaoDcShifts} businessDate="2025-05-15" rangeStart="2025-05-15T16:00:00-03:00" rangeFinish="2025-05-15T20:00:00-03:00" currentScenarioTime="2025-05-15T17:23:00-03:00" selectedLotId={null} onSelectLot={vi.fn()} />);
  expect(screen.getByText('Requisito recebido — Balancing')).toBeInTheDocument();
  for (const resource of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) expect(screen.getByRole('region', { name: `Máquina programada ${resource}` })).toBeInTheDocument();
  const shortLot = screen.getByRole('button', { name: /Lote A/ });
  const longLot = screen.getByRole('button', { name: /Lote B/ });
  expect(Number.parseFloat(longLot.style.width)).toBeCloseTo(Number.parseFloat(shortLot.style.width) * 2, 5);
  expect(Number.parseFloat(longLot.style.left)).toBeGreaterThan(Number.parseFloat(shortLot.style.left));
  expect(screen.getByRole('button', { name: /Lote C.*18:43.*19:48/ })).toBeInTheDocument();
  expect(shortLot).not.toHaveAttribute('draggable');
  expect(shortLot).toHaveAccessibleName(/máquina programada DC01/);
});

test('positions a deterministic Current Time marker with temporal math and hides it outside the range', () => {
  const properties = { lots, materials: [{ id: 'material-a', code: 'A', name: 'Material A' }], workCenter: { id: 'wc-1', name: 'Fundição DC', areaLabel: 'Fundição DC' }, shifts: fundicaoDcShifts, businessDate: '2025-05-15', rangeStart: '2025-05-15T16:00:00-03:00', rangeFinish: '2025-05-15T20:00:00-03:00', selectedLotId: null, onSelectLot: vi.fn() } as const;
  const { rerender } = render(<HourByHourSchedule {...properties} currentScenarioTime="2025-05-15T17:23:00-03:00" />);
  expect(screen.getByText('Horário de referência do cenário: 17:23')).toBeInTheDocument();
  expect(screen.getByTestId('current-time-marker').style.left).toBe(`${(83 / 240) * 100}%`);
  expect(screen.queryByText(/Em execução/i)).not.toBeInTheDocument();
  rerender(<HourByHourSchedule {...properties} currentScenarioTime="2025-05-15T15:59:00-03:00" />);
  expect(screen.queryByTestId('current-time-marker')).not.toBeInTheDocument();
  rerender(<HourByHourSchedule {...properties} currentScenarioTime="2025-05-15T20:01:00-03:00" />);
  expect(screen.queryByTestId('current-time-marker')).not.toBeInTheDocument();
});

test('renders shared planned-break bands and keeps Current Time visible inside a break', () => {
  render(<HourByHourSchedule lots={lots} materials={[{ id: 'material-a', code: 'A', name: 'Material A' }]} workCenter={{ id: 'wc-1', name: 'Fundição DC', areaLabel: 'Fundição DC' }} shifts={fundicaoDcShifts} businessDate="2025-05-15" rangeStart="2025-05-15T15:15:00-03:00" rangeFinish="2025-05-16T00:00:00-03:00" currentScenarioTime="2025-05-15T17:05:00-03:00" selectedLotId={null} onSelectLot={vi.fn()} />);
  expect(screen.getByText('Horário de referência do cenário: 17:05')).toBeInTheDocument();
  expect(screen.getAllByTestId('planned-break')).toHaveLength(3);
  expect(screen.getByText(/Três turnos demonstrativos e nove paradas programadas/)).toBeInTheDocument();
  expect(screen.getByLabelText('Legenda do Plano Hora-Hora')).toHaveTextContent('Parada programada');
});

test('positions Current Time at ~10% of the temporal viewport (10% past, 90% future) with clamping', () => {
  expect(calculateCurrentTimeScrollLeft(1000, 900, 2000)).toBe(910);
  expect((1000 - calculateCurrentTimeScrollLeft(1000, 900, 2000)) / 900).toBeCloseTo(0.1, 5);
  expect(calculateCurrentTimeScrollLeft(50, 900, 2000)).toBe(0);
  expect(calculateCurrentTimeScrollLeft(3000, 900, 1500)).toBe(1500);
});
