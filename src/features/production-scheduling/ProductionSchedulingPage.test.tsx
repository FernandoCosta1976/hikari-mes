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
  expect(screen.getByRole('region', { name: 'Compromisso do período' })).toHaveTextContent('1.600 peças');
  expect(screen.getByRole('heading', { name: 'O que precisamos produzir?' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Contexto da aplicação' })).toHaveTextContent('Fundição DC');
  expect(screen.getByText(/15\/05\/2025 · Dia completo · 24h/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Lote 252, Material A, 100 peças/ })).toBeInTheDocument();
  expect(screen.getByLabelText('Destino')).toHaveValue('ALL');
  await user.selectOptions(screen.getByLabelText('Destino'), 'ENGINEERING');
  expect(screen.getByText('Filtros · 1')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Lote 252/ })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Lote 260/ })).toBeInTheDocument();
});

test('selects a Lot, opens accessible detail and closes it', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  await user.click(screen.getByRole('button', { name: /Lote 266, Material B, 100 peças/ }));
  expect(screen.getByRole('dialog', { name: 'Lote 266' })).toBeInTheDocument();
  expect(screen.getByRole('dialog', { name: 'Lote 266' })).toHaveTextContent('Máquina programadaDC03');
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('button', { name: /Lote 266, Material B, 100 peças/ })).toHaveFocus());
});

test('releases a ready Lot without starting it and signals the timeline', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  await user.click(screen.getByRole('button', { name: /Lote 251, Material A, 100 peças/ }));
  const modal = screen.getByRole('dialog', { name: 'Lote 251' });
  await user.click(within(modal).getByRole('button', { name: 'Liberação' }));
  expect(modal).toHaveTextContent('PRONTO PARA LIBERAR');
  expect(modal).toHaveTextContent('DC01');
  expect(modal).toHaveTextContent('v08');
  expect(modal).toHaveTextContent('Ready não significa Organized; Organized não significa Released; Released não significa Started.');
  await user.click(within(modal).getByRole('button', { name: 'Liberar para produção' }));
  expect(modal).toHaveTextContent('Liberado');
  expect(modal).not.toHaveTextContent('Iniciado');
  await user.click(within(modal).getByRole('button', { name: 'Fechar contexto do Lote' }));
  expect(screen.getByRole('button', { name: /Lote 251.*liberado para produção/ })).toHaveTextContent('Liberado');
});

test('does not offer release for a blocked Lot', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  await user.click(screen.getByRole('button', { name: /Lote 267, Material D, 70 peças/ }));
  const modal = screen.getByRole('dialog', { name: 'Lote 267' });
  await user.click(within(modal).getByRole('button', { name: 'Liberação' }));
  expect(modal).toHaveTextContent('NÃO PODE SER LIBERADO');
  expect(within(modal).queryByRole('button', { name: 'Liberar para produção' })).not.toBeInTheDocument();
});

test('offers a compact release exception view and preserves buffer-critical context', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  const summary = screen.getByRole('region', { name: 'Decisão de liberação' });
  expect(summary).toHaveTextContent('Prontos para liberar');
  expect(summary).toHaveTextContent('Bloqueados');
  await user.click(within(summary).getByRole('button', { name: /Bloqueados/ }));
  expect(screen.getByRole('dialog', { name: 'Lote 259' })).toBeInTheDocument();
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Fechar contexto do Lote' }));
  await user.click(screen.getByRole('button', { name: /Lote 255, Material A, 50 peças/ }));
  const modal = screen.getByRole('dialog', { name: 'Lote 255' });
  await user.click(within(modal).getByRole('button', { name: 'Liberação' }));
  expect(modal).toHaveTextContent('Buffer-critical');
  expect(modal).toHaveTextContent('não determina automaticamente a liberação');
});

test('opens the Lot Context modal with immediate ATTENTION and BLOCKED causes', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  await user.click(screen.getByRole('button', { name: /Lote 257, Material A, 100 peças/ }));
  let modal = screen.getByRole('dialog', { name: 'Lote 257' });
  expect(modal).toHaveAttribute('aria-modal', 'true');
  expect(within(modal).getByRole('region', { name: 'Motivo principal' })).toHaveTextContent('Preparação no ponto');
  expect(modal).toHaveTextContent('Resultado demonstrativo · regra de agregação não governada');
  await user.click(within(modal).getByRole('button', { name: 'Fechar contexto do Lote' }));
  await user.click(screen.getByRole('button', { name: /Lote 267, Material D, 70 peças/ }));
  modal = screen.getByRole('dialog', { name: 'Lote 267' });
  expect(within(modal).getByRole('region', { name: 'Bloqueio principal' })).toHaveTextContent('Disponibilidade no intervalo');
});

test('shows eligible alternatives progressively and keeps scheduled Resource distinct from operational assignment', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  await user.click(screen.getByRole('button', { name: /Lote 251, Material A, 100 peças/ }));
  let detail = screen.getByRole('dialog', { name: 'Lote 251' });
  await user.click(within(detail).getByRole('button', { name: 'Recursos' }));
  expect(detail).toHaveTextContent('Com condição 1DC01Programada');
  expect(detail).toHaveTextContent('Requer atenção 2DC03');
  expect(detail).toHaveTextContent('DC05Informação insuficiente');
  expect(detail).toHaveTextContent('Sem condição 2DC02Não elegível');
  expect(detail).toHaveTextContent('Condição técnica e contexto operacional apoiam a análise; não representam escolha ou atribuição de máquina.');
  expect(within(detail).queryByRole('button', { name: /Atribuir|Selecionar|Trocar máquina/ })).not.toBeInTheDocument();
  await user.click(within(detail).getByRole('button', { name: 'Fechar contexto do Lote' }));

  await user.click(screen.getByRole('button', { name: /Lote 253, Material B, 100 peças/ }));
  detail = screen.getByRole('dialog', { name: 'Lote 253' });
  await user.click(within(detail).getByRole('button', { name: 'Recursos' }));
  expect(detail).toHaveTextContent('Requer atenção 3DC02Programada');
  expect(detail).toHaveTextContent('DC05');
  expect(detail).not.toHaveTextContent('Máquinas disponíveis');
  expect(detail).not.toHaveTextContent('Máquina recomendada');
  expect(detail).not.toHaveTextContent('Ranking');

  expect(screen.queryByRole('region', { name: 'Agora na Fundição' })).not.toBeInTheDocument();
});

test('shows five scheduled Resource lanes without the redundant physical landscape', () => {
  renderWithFoundation(<ProductionSchedulingPage />);
  for (const resource of ['DC01', 'DC02', 'DC03', 'DC04', 'DC05']) expect(screen.getByRole('region', { name: `Máquina programada ${resource}` })).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Agora na Fundição' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Lote 251.*máquina programada DC01.*00:30.*02:00/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Lote 266.*máquina programada DC03.*15:30.*17:30/ })).toBeInTheDocument();
  expect(screen.getAllByTestId('scheduled-setup')).toHaveLength(4);
});

test('toggles the Resource condition overlay without changing the timeline plan', async () => {
  const user = userEvent.setup();
  const { container } = renderWithFoundation(<ProductionSchedulingPage />);
  expect(screen.queryByRole('button', { name: 'Mostrar condições' })).not.toBeInTheDocument();
  const toggle = screen.getByRole('button', { name: 'Avaliar cenários' });
  expect(toggle).toHaveAttribute('aria-pressed', 'false');
  const originalOrder = [...container.querySelectorAll('[aria-label^="Máquina programada DC"]')].map((lane) => lane.getAttribute('aria-label'));
  const originalLotCount = container.querySelectorAll('[data-lot-id]').length;
  await user.click(toggle);
  expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(toggle).toHaveAccessibleName('Encerrar avaliação');
  expect(screen.getByRole('status')).toHaveTextContent('AVALIAÇÃO DE ALTERNATIVASSelecione um Lote para avaliar quais máquinas podem recebê-lo');
  await user.click(screen.getByRole('button', { name: /Lote 257, Material A, 100 peças/ }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('AVALIAÇÃO DE ALTERNATIVAS — LOTE 257Material A · 100 peças · Programado em DC01');
  const contextualOrder = [...container.querySelectorAll('[aria-label^="Máquina programada DC"]')].map((lane) => lane.getAttribute('aria-label'));
  expect(contextualOrder).toEqual(originalOrder);
  expect(screen.getByRole('region', { name: 'Máquina programada DC01' })).toHaveTextContent('DC01ProgramadaProgramada · Requer atenção');
  expect(screen.getByRole('region', { name: 'Máquina programada DC05' })).toHaveAttribute('data-resource-condition', 'UNKNOWN');
  expect(screen.getByRole('region', { name: 'Máquina programada DC02' })).toHaveAttribute('data-resource-eligible', 'false');
  expect(screen.getByRole('region', { name: 'Máquina programada DC01' })).toHaveTextContent('Eligibility: Elegível');
  expect(screen.getByRole('region', { name: 'Impacto conhecido por Resource' })).toHaveTextContent('Setup existente conhecido');
  expect(container.querySelectorAll('[data-lot-id]')).toHaveLength(originalLotCount);
  await user.click(toggle);
  expect(toggle).toHaveAttribute('aria-pressed', 'false');
  expect(toggle).toHaveAccessibleName('Avaliar cenários');
  expect([...container.querySelectorAll('[aria-label^="Máquina programada DC"]')].map((lane) => lane.getAttribute('aria-label'))).toEqual(originalOrder);
  expect(container.querySelectorAll('[data-lot-id]')).toHaveLength(originalLotCount);
});

test('simulates by keyboard, compares, undoes and discards without mutating fixed lanes', async () => {
  const user = userEvent.setup();
  const { container } = renderWithFoundation(<ProductionSchedulingPage />);
  const fixedOrder = [...container.querySelectorAll('[aria-label^="Máquina programada DC"]')].map((lane) => lane.getAttribute('aria-label'));
  await user.click(screen.getByRole('button', { name: 'Simular organização' }));
  expect(screen.getByRole('region', { name: 'Simulação de organização' })).toHaveTextContent('SIMULAÇÃO ATIVA0 alterações');
  await user.click(screen.getByRole('button', { name: /Lote 251, Material A, 100 peças/ }));
  const simulation = screen.getByRole('region', { name: 'Simulação de organização' });
  const options = within(simulation).getAllByRole('button').filter((button) => /^DC0[1-5]/.test(button.textContent ?? ''));
  expect(options.map((button) => button.textContent?.slice(0, 4))).toEqual(['DC01', 'DC02', 'DC03', 'DC04', 'DC05']);
  expect(options[0]).toBeDisabled();
  expect(options[1]).toBeDisabled();
  await user.click(options[4]);
  expect(simulation).toHaveTextContent('1 movimentação');
  expect(simulation).toHaveTextContent('PlanoDC01');
  expect(simulation).toHaveTextContent('SimulaçãoDC05');
  expect(container.querySelector('[data-lot-id="lot-251"]')).toHaveAttribute('data-simulated', 'true');
  expect(screen.getByLabelText('Posição original do Lote 251 no plano recebido')).toBeInTheDocument();
  expect([...container.querySelectorAll('[aria-label^="Máquina programada DC"]')].map((lane) => lane.getAttribute('aria-label'))).toEqual(fixedOrder);
  await user.click(within(simulation).getByRole('button', { name: 'Comparar' }));
  expect(screen.getByRole('region', { name: 'Comparação Plano recebido versus Simulação' })).toBeInTheDocument();
  await user.click(within(simulation).getByRole('button', { name: 'Desfazer' }));
  expect(simulation).toHaveTextContent('0 alterações');
  await user.click(within(simulation).getByRole('button', { name: 'Descartar' }));
  expect(screen.queryByRole('region', { name: 'Simulação de organização' })).not.toBeInTheDocument();
  expect([...container.querySelectorAll('[aria-label^="Máquina programada DC"]')].map((lane) => lane.getAttribute('aria-label'))).toEqual(fixedOrder);
});

test('makes reservation, projected coverage, material attention and selected-Lot scenarios explicit', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  await user.selectOptions(screen.getByLabelText('Variação demonstrativa'), 'SCN-WF001-02');
  expect(screen.getByText(/Reservas preservadas/)).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Variação demonstrativa'), 'SCN-WF001-03');
  expect(screen.getByRole('status')).toHaveTextContent('Cobertura recuperada pelo plano');
  await user.selectOptions(screen.getByLabelText('Variação demonstrativa'), 'SCN-WF001-04');
  expect(screen.getByText(/Lote 267 requer avaliação/)).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Variação demonstrativa'), 'SCN-WF001-08');
  expect(screen.getByRole('dialog', { name: 'Lote 252' })).toBeInTheDocument();
});

test('supports temporal navigation, stale state, mismatch, comparison and reset', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  await user.click(screen.getByRole('button', { name: 'D+1' }));
  expect(screen.getByRole('button', { name: /Lote 351/ })).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Variação demonstrativa'), 'SCN-WF001-06');
  expect(screen.getByText('Plano de hoje ainda não recebido.')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Hoje' }));
  await user.selectOptions(screen.getByLabelText('Variação demonstrativa'), 'SCN-WF001-05');
  expect(screen.getByText(/Diferença informada: 40 peças/)).toBeInTheDocument();
  await user.click(screen.getByText('Plano', { selector: 'summary strong' }));
  await user.click(screen.getByRole('button', { name: 'Comparar anterior' }));
  expect(screen.getByRole('heading', { name: 'Comparação de versões demonstrativas' })).toBeInTheDocument();
  await user.click(screen.getByText('Cenário', { selector: 'summary strong' }));
  await user.click(screen.getByRole('button', { name: 'Reiniciar cenário' }));
  expect(screen.getByRole('button', { name: 'Hoje' })).toHaveAttribute('aria-current', 'date');
  expect(screen.getByLabelText('Destino')).toHaveValue('ALL');
});

test('reveals source-level freshness on demand', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  await user.click(screen.getByRole('button', { name: /Atualizado/ }));
  expect(screen.getByRole('region', { name: 'Detalhes da atualização dos dados' })).toHaveTextContent('Balancing');
  expect(screen.getByRole('region', { name: 'Detalhes da atualização dos dados' })).toHaveTextContent('PyMAC');
});

test('presents quick restrictions, revision summary and progressive drill-down', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  expect(screen.getByRole('heading', { name: 'O que merece atenção antes da preparação?' })).toBeInTheDocument();
  expect(screen.getByText('3 Materiais abaixo da referência atual')).toBeInTheDocument();
  expect(screen.getByText('Versão atualizada · ver alterações')).toBeInTheDocument();
  expect(screen.getByText(/Lote 251 \+ Lote 252.*= 620 peças/)).not.toBeVisible();
  await user.click(screen.getByText('Consultar correlação'));
  expect(screen.getByText(/Lote 251 \+ Lote 252.*= 620 peças/)).toBeVisible();
  const revision = screen.getByText('Alterações do plano').closest('details');
  await user.click(screen.getByText('Alterações do plano'));
  expect(revision).toHaveTextContent(/Lote 271:\s*incluído\./);
});

test('switches between the 24h plan and each shift while updating its commitment', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  expect(screen.getByRole('region', { name: 'Compromisso do período' })).toHaveTextContent('21 Lotes');
  await user.click(screen.getByRole('button', { name: 'Turno 2' }));
  expect(screen.getByRole('region', { name: 'Compromisso do período' })).toHaveTextContent('550 peças');
  expect(screen.getByRole('region', { name: 'Compromisso do período' })).toHaveTextContent('7 Lotes');
  expect(screen.getByTestId('current-time-marker')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Turno 1' }));
  expect(screen.queryByTestId('current-time-marker')).not.toBeInTheDocument();
});

test('renders hierarchical filters and collapses the sidebar with Escape', async () => {
  const user = userEvent.setup();
  renderWithFoundation(<ProductionSchedulingPage />);
  expect(screen.getByLabelText('Destino')).toBeInTheDocument();
  const sidebar = screen.getByRole('complementary', { name: 'Operational Workspace' });
  expect(sidebar.parentElement).toHaveAttribute('data-sidebar-expanded', 'true');
  await user.keyboard('{Escape}');
  expect(sidebar.parentElement).toHaveAttribute('data-sidebar-expanded', 'false');
});
