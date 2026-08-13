import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test } from 'vitest';
import { fundicaoDcScenario } from '../../demo/scenarios/fundicaoDcScenario';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { ProductionSchedulingPage } from './ProductionSchedulingPage';

beforeEach(() => {
  useScenarioStore.setState({ definition: null, productionScheduling: null, initialized: false });
  useScenarioStore.getState().initializeScenario(fundicaoDcScenario);
  useScenarioStore.getState().resetScenario();
});

test('renders commitment and filters the timeline by Destination', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  expect(screen.getByRole('region', { name: 'Compromisso do período' })).toHaveTextContent('600 peças');
  expect(screen.getByText('15/05/2025')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Lote 252, Material A, 100 peças/ })).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Destino'), 'ENGINEERING');
  expect(screen.queryByRole('button', { name: /Lote 252/ })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Lote 256/ })).toBeInTheDocument();
});

test('selects a Lot, opens accessible detail and closes it', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  await user.click(screen.getByRole('button', { name: /Lote 252, Material A, 100 peças/ }));
  expect(screen.getByRole('dialog', { name: 'Lote 252' })).toBeInTheDocument();
  expect(screen.getByText('Ainda não atribuído')).toBeInTheDocument();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('button', { name: /Lote 252, Material A, 100 peças/ })).toHaveFocus());
});

test('makes reservation, projected coverage, material attention and selected-Lot scenarios explicit', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  await user.selectOptions(screen.getByLabelText('Variação demonstrativa'), 'SCN-WF001-02');
  expect(screen.getByText(/Reservas preservadas/)).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Variação demonstrativa'), 'SCN-WF001-03');
  expect(screen.getByRole('status')).toHaveTextContent('Cobertura recuperada pelo plano');
  await user.selectOptions(screen.getByLabelText('Variação demonstrativa'), 'SCN-WF001-04');
  expect(screen.getByText(/Lote 254 requer avaliação/)).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Variação demonstrativa'), 'SCN-WF001-08');
  expect(screen.getByRole('dialog', { name: 'Lote 252' })).toBeInTheDocument();
});

test('supports temporal navigation, stale state, mismatch, comparison and reset', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  await user.click(screen.getByRole('button', { name: 'D+1' }));
  expect(screen.getByRole('button', { name: /Lote 261/ })).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Variação demonstrativa'), 'SCN-WF001-06');
  expect(screen.getByText('Plano de hoje ainda não recebido.')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Hoje' }));
  await user.selectOptions(screen.getByLabelText('Variação demonstrativa'), 'SCN-WF001-05');
  expect(screen.getByText(/Diferença informada: 40 peças/)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Comparar plano anterior' }));
  expect(screen.getByRole('heading', { name: 'Comparação de versões demonstrativas' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Reiniciar cenário' }));
  expect(screen.getByRole('button', { name: 'Hoje' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByLabelText('Destino')).toHaveValue('ALL');
});

test('reveals source-level freshness on demand', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  await user.click(screen.getByRole('button', { name: /Atualização dos dados/ }));
  expect(screen.getByRole('region', { name: 'Detalhes da atualização dos dados' })).toHaveTextContent('Balancing');
  expect(screen.getByRole('region', { name: 'Detalhes da atualização dos dados' })).toHaveTextContent('PyMAC');
});

test('presents quick restrictions, revision summary and progressive drill-down', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  expect(screen.getByRole('heading', { name: 'O que merece atenção antes da preparação?' })).toBeInTheDocument();
  expect(screen.getByText('2 Materiais abaixo da referência atual')).toBeInTheDocument();
  expect(screen.getByText('Versão atualizada · ver alterações')).toBeInTheDocument();
  expect(screen.queryByText('Lote 251 + Lote 252 + Lote 253 = 300 peças')).not.toBeVisible();
  await user.click(screen.getByText('Consultar correlação'));
  expect(screen.getByText('Lote 251 + Lote 252 + Lote 253 = 300 peças')).toBeVisible();
  const revision = screen.getByText('Alterações do plano').closest('details');
  await user.click(screen.getByText('Alterações do plano'));
  expect(revision).toHaveTextContent(/Lote 256:\s*incluído\./);
});
