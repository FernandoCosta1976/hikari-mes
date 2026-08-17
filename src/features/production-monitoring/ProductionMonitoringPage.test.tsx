import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { ProductionMonitoringPage } from './ProductionMonitoringPage';

test('shows the 2026-07-10 Scenario Clock 17:23 context and all five Resources with distinct states', () => {
  renderWithFoundation(<ProductionMonitoringPage />);
  expect(screen.getByRole('heading', { name: 'O que está acontecendo em relação ao plano?' })).toBeInTheDocument();
  expect(screen.getByText('10/07/2026 · Dados simulados até 17:23 · Futuro projetado')).toBeInTheDocument();
  const timeline = screen.getByTestId('live-production-timeline');
  for (const resource of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) expect(within(timeline).getByText(resource)).toBeInTheDocument();
  // Section 8 — diversity across the five minimal states, not five identical lanes.
  expect(within(timeline).getByText('Em execução')).toBeInTheDocument();
  expect(within(timeline).getAllByText('Concluído').length).toBeGreaterThanOrEqual(2);
  expect(within(timeline).getByText('Atrasado')).toBeInTheDocument();
  expect(within(timeline).getByText('Não iniciado')).toBeInTheDocument();
});

test('KPI strip reflects the real 23-requirement dataset totals', () => {
  renderWithFoundation(<ProductionMonitoringPage />);
  const strip = screen.getByRole('region', { name: 'Resumo operacional do dia' });
  expect(strip).toHaveTextContent('Planejado até agora1.600');
  expect(strip).toHaveTextContent('Realizado até agora1.300');
  expect(strip).toHaveTextContent('Em execução2');
  expect(strip).toHaveTextContent('Atrasados2');
  expect(strip).toHaveTextContent('A executar5');
  expect(strip).toHaveTextContent('Projeção do dia2.100');
});

test('opens the DELAYED DC03 requirement context showing the event, the downtime impact and the projected finish', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionMonitoringPage />);
  const dc03Lane = screen.getByTestId('live-production-timeline').querySelector<HTMLElement>('section[data-status="DELAYED"]')!;
  await user.click(within(dc03Lane).getAllByRole('button')[0]);
  const dialog = screen.getByRole('dialog', { name: '1S4-E5411-W0' });
  expect(dialog).toHaveTextContent('Lote Linha C331');
  expect(dialog).toHaveTextContent('MáquinaDC03');
  expect(dialog).toHaveTextContent('SituaçãoAtrasado');
  expect(dialog).toHaveTextContent('Quantidade93 / 100');
  expect(dialog).toHaveTextContent('Em risco');
  expect(dialog).toHaveTextContent('Parada não planejada');
});

test('Unknown != 0 — a requirement with no appointment never shows a fabricated zero', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionMonitoringPage />);
  const dc04Lane = screen.getByTestId('live-production-timeline').querySelector<HTMLElement>('section[data-status="NOT_STARTED"]')!;
  await user.click(within(dc04Lane).getAllByRole('button')[0]);
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveTextContent('Realizado—');
  expect(dialog).toHaveTextContent('Ausência de apontamento não significa zero produzido.');
  expect(dialog).toHaveTextContent('Quantidade— / 100');
  expect(dialog).not.toHaveTextContent('Quantidade0 / 100');
});

test('has no fabricated Material A/B/C and no execution controls (Acompanhamento does not start, pause or complete production)', () => {
  renderWithFoundation(<ProductionMonitoringPage />);
  expect(screen.queryByText('Material A')).not.toBeInTheDocument();
  expect(screen.queryByText('Material B')).not.toBeInTheDocument();
  expect(screen.queryByText('Material C')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Iniciar produção|Pausar|Retomar|Concluir/ })).not.toBeInTheDocument();
});
