import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test } from 'vitest';
import { scenarioDefinitionAdapter } from '../../demo/adapters/scenarioDefinitionAdapter';
import { useScenarioStore } from '../../demo/scenario-engine/scenarioStore';
import { renderWithFoundation } from '../../test/renderWithFoundation';
import { ProductionSchedulingPage } from './ProductionSchedulingPage';

beforeEach(() => {
  const fundicaoDcScenario = scenarioDefinitionAdapter.findById('fundicao-dc')!;
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

test('changes the read-only Eligible Resources with the selected Material without assigning a Resource', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);

  await user.click(screen.getByRole('button', { name: /Lote 251, Material A, 100 peças/ }));
  let detail = screen.getByRole('dialog', { name: 'Lote 251' });
  let eligible = within(detail).getByRole('list', { name: 'Máquinas elegíveis para Material A: DC01, DC03, DC05' });
  expect(within(eligible).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['DC01', 'DC03', 'DC05']);
  expect(within(eligible).queryByRole('button')).not.toBeInTheDocument();
  expect(detail).toHaveTextContent('Recurso atribuídoAinda não atribuído');
  expect(detail).toHaveTextContent('Elegível não significa disponível ou selecionado.');
  await user.click(within(detail).getByRole('button', { name: 'Fechar detalhe do Lote' }));

  await user.click(screen.getByRole('button', { name: /Lote 254, Material B, 100 peças/ }));
  detail = screen.getByRole('dialog', { name: 'Lote 254' });
  eligible = within(detail).getByRole('list', { name: 'Máquinas elegíveis para Material B: DC02, DC03, DC05' });
  expect(within(eligible).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['DC02', 'DC03', 'DC05']);
  expect(detail).not.toHaveTextContent('Máquinas disponíveis');
  expect(detail).not.toHaveTextContent('Máquina recomendada');
  expect(detail).not.toHaveTextContent('Ranking');

  const currentState = screen.getByRole('region', { name: 'Agora na Fundição' });
  expect(currentState).not.toHaveTextContent('Máquinas elegíveis');
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
